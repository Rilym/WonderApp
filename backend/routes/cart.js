const express = require('express');
const db = require('../db');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Middleware to protect cart routes
const authMiddleware = (req, res, next) => {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Token is not valid' });
    }
};

// Get user cart
router.get('/', authMiddleware, async (req, res) => {
    try {
        const [cartItems] = await db.query(`
            SELECT c.id, c.quantity, c.booking_date, d.id as destination_id, d.name, d.price, d.image_url 
            FROM carts c 
            JOIN destinations d ON c.destination_id = d.id 
            WHERE c.user_id = ?
        `, [req.user.id]);
        res.json(cartItems);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add to cart
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { destination_id, quantity, bookingDate } = req.body;
        if (!bookingDate) return res.status(400).json({ message: 'Booking date is required' });
        
        // Check if already in cart for that specific date
        const [existing] = await db.query('SELECT * FROM carts WHERE user_id = ? AND destination_id = ? AND booking_date = ?', [req.user.id, destination_id, bookingDate]);
        
        if (existing.length > 0) {
            await db.query('UPDATE carts SET quantity = quantity + ? WHERE id = ?', [quantity, existing[0].id]);
        } else {
            await db.query('INSERT INTO carts (user_id, destination_id, quantity, booking_date) VALUES (?, ?, ?, ?)', [req.user.id, destination_id, quantity, bookingDate]);
        }
        
        res.status(201).json({ message: 'Added to cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Remove from cart
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        await db.query('DELETE FROM carts WHERE id = ? AND user_id = ?', [req.params.id, req.user.id]);
        res.json({ message: 'Removed from cart' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
