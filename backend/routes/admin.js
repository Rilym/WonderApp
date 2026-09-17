const express = require('express');
const db = require('../db');
const { authMiddleware, ownerMiddleware, superAdminMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const bcrypt = require('bcryptjs');

const router = express.Router();

// Get dashboard stats (Total Revenue, Tickets Sold, Total Destinations)
router.get('/stats', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        let revenueQuery, ticketsQuery, destinationsQuery, params = [];
        
        if (req.user.role === 'owner') {
            revenueQuery = `
                SELECT SUM(oi.quantity * oi.price) as total 
                FROM order_items oi
                JOIN destinations d ON oi.destination_id = d.id
                JOIN orders o ON oi.order_id = o.id
                WHERE d.owner_id = ? AND o.status = "paid"
            `;
            ticketsQuery = `
                SELECT SUM(oi.quantity) as total 
                FROM order_items oi
                JOIN destinations d ON oi.destination_id = d.id
                WHERE d.owner_id = ?
            `;
            destinationsQuery = 'SELECT COUNT(*) as total FROM destinations WHERE owner_id = ?';
            params = [req.user.id];
        } else {
            revenueQuery = 'SELECT SUM(total_amount) as total FROM orders WHERE status = "paid"';
            ticketsQuery = 'SELECT SUM(quantity) as total FROM order_items';
            destinationsQuery = 'SELECT COUNT(*) as total FROM destinations';
        }

        const [[revenueResult]] = await db.query(revenueQuery, params);
        const [[ticketsResult]] = await db.query(ticketsQuery, params);
        const [[destinationsResult]] = await db.query(destinationsQuery, params);
        
        // Also get breakdown per destination
        let breakdownQuery = `
            SELECT d.id, d.name, SUM(oi.quantity * oi.price) as revenue, SUM(oi.quantity) as tickets
            FROM destinations d
            LEFT JOIN order_items oi ON d.id = oi.destination_id
            LEFT JOIN orders o ON oi.order_id = o.id AND o.status = "paid"
        `;
        let breakdownParams = [];
        if (req.user.role === 'owner') {
            breakdownQuery += ` WHERE d.owner_id = ?`;
            breakdownParams.push(req.user.id);
        }
        breakdownQuery += ` GROUP BY d.id, d.name ORDER BY revenue DESC`;

        const [breakdown] = await db.query(breakdownQuery, breakdownParams);

        res.json({
            revenue: revenueResult.total || 0,
            ticketsSold: ticketsResult.total || 0,
            totalDestinations: destinationsResult.total || 0,
            breakdown
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get destinations for admin/owner
router.get('/destinations', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        let query = 'SELECT * FROM destinations';
        let params = [];
        if (req.user.role === 'owner') {
            query += ' WHERE owner_id = ?';
            params.push(req.user.id);
        }
        const [destinations] = await db.query(query, params);
        res.json({ data: destinations });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get recent orders
router.get('/orders', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        let query, params = [];
        if (req.user.role === 'owner') {
            query = `
                SELECT DISTINCT o.id, u.name as user_name, o.total_amount, o.status, o.created_at 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                JOIN order_items oi ON o.id = oi.order_id
                JOIN destinations d ON oi.destination_id = d.id
                WHERE d.owner_id = ?
                ORDER BY o.created_at DESC LIMIT 10
            `;
            params = [req.user.id];
        } else {
            query = `
                SELECT o.id, u.name as user_name, o.total_amount, o.status, o.created_at 
                FROM orders o 
                JOIN users u ON o.user_id = u.id 
                ORDER BY o.created_at DESC LIMIT 10
            `;
        }
        
        const [orders] = await db.query(query, params);
        res.json(orders);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get all users (Superadmin only)
router.get('/users', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create User/Admin/Owner (Superadmin only)
router.post('/users', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        const { name, email, password, role } = req.body;
        
        const [existing] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
        if (existing.length > 0) return res.status(400).json({ message: 'Email already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        await db.query(
            'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
            [name, email, hashedPassword, role || 'admin']
        );
        res.status(201).json({ message: 'User created successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Delete User (Superadmin only)
router.delete('/users/:id', authMiddleware, superAdminMiddleware, async (req, res) => {
    try {
        // Prevent deleting oneself
        if (parseInt(req.params.id) === req.user.id) {
            return res.status(400).json({ message: 'Cannot delete your own account' });
        }
        await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
