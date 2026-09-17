const express = require('express');
const db = require('../db');
const { authMiddleware } = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const generatePDF = require('../utils/pdfGenerator');

const router = express.Router();

// Email Transporter setup (using env vars or ethereal for testing)
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.ethereal.email',
    port: process.env.SMTP_PORT || 587,
    auth: {
        user: process.env.SMTP_USER || 'test@ethereal.email',
        pass: process.env.SMTP_PASS || 'testpassword'
    }
});

// Checkout - Create order from cart
router.post('/checkout', authMiddleware, async (req, res) => {
    const connection = await db.getConnection();
    try {
        await connection.beginTransaction();

        // Get cart items
        const [cartItems] = await connection.query(`
            SELECT c.id as cart_id, c.quantity, c.booking_date, d.id as destination_id, d.price, d.name 
            FROM carts c 
            JOIN destinations d ON c.destination_id = d.id 
            WHERE c.user_id = ?
        `, [req.user.id]);

        if (cartItems.length === 0) {
            return res.status(400).json({ message: 'Cart is empty' });
        }

        // Calculate total amount
        const totalAmount = cartItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);

        // Create order record
        const [orderResult] = await connection.query(
            'INSERT INTO orders (user_id, total_amount, status) VALUES (?, ?, ?)',
            [req.user.id, totalAmount, 'paid'] // Simulating paid payment gateway
        );
        const orderId = orderResult.insertId;

        // Insert order items
        for (let item of cartItems) {
            await connection.query(
                'INSERT INTO order_items (order_id, destination_id, quantity, price, booking_date) VALUES (?, ?, ?, ?, ?)',
                [orderId, item.destination_id, item.quantity, item.price, item.booking_date]
            );
        }

        // Clear cart
        await connection.query('DELETE FROM carts WHERE user_id = ?', [req.user.id]);

        await connection.commit();

        // ----------------------------------------------------
        // SEND EMAIL NOTIFICATION (NON-BLOCKING)
        // ----------------------------------------------------
        setImmediate(async () => {
            try {
                // Generate PDF first
                const pdfPath = await generatePDF(orderId, req.user);
                
                // Send email
                await transporter.sendMail({
                    from: '"Sistem Tiket Wisata" <no-reply@wisata.com>',
                    to: req.user.email,
                    subject: `E-Ticket Wisata Anda - Pesanan #${orderId}`,
                    text: `Terima kasih telah memesan tiket. Berikut adalah E-Ticket Anda untuk pesanan #${orderId}.`,
                    html: `<p>Terima kasih telah memesan tiket.</p><p>Berikut adalah <b>E-Ticket PDF</b> Anda untuk pesanan <b>#${orderId}</b>.</p>`,
                    attachments: [
                        {
                            filename: `ticket_${orderId}.pdf`,
                            path: pdfPath
                        }
                    ]
                });
                console.log(`Email sent to ${req.user.email} for order #${orderId}`);
            } catch (emailError) {
                console.error("Failed to send email:", emailError.message);
                // Note: We don't throw here because checkout is already successful
            }
        });

        res.status(201).json({ message: 'Checkout successful', orderId });
    } catch (error) {
        await connection.rollback();
        res.status(500).json({ message: 'Server error', error: error.message });
    } finally {
        connection.release();
    }
});

// Get user orders (Order History for Profile)
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const [orders] = await db.query('SELECT id, total_amount, status, created_at FROM orders WHERE user_id = ? ORDER BY created_at DESC', [req.user.id]);
        
        // Fetch items for each order
        for (let order of orders) {
            const [items] = await db.query(`
                SELECT oi.quantity, oi.price, oi.booking_date, d.name, d.image_url 
                FROM order_items oi 
                JOIN destinations d ON oi.destination_id = d.id 
                WHERE oi.order_id = ?
            `, [order.id]);
            order.items = items;
        }

        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Download PDF
router.get('/:id/pdf', async (req, res) => {
    try {
        const orderId = req.params.id;
        // In a real app, you should check auth and ownership here.
        // For now, generate on the fly or send existing.
        // We'll generate it on the fly to avoid file storage issues.
        const [orders] = await db.query('SELECT * FROM orders WHERE id = ?', [orderId]);
        if (orders.length === 0) return res.status(404).send('Order not found');
        const order = orders[0];

        const [items] = await db.query(`
            SELECT oi.quantity, oi.price, oi.booking_date, d.name 
            FROM order_items oi 
            JOIN destinations d ON oi.destination_id = d.id 
            WHERE oi.order_id = ?
        `, [orderId]);

        generatePDF.generateTicketPDF(order, items, res);
    } catch (error) {
        res.status(500).send('Server error generating PDF');
    }
});

module.exports = router;
