const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../db');
const { body, validationResult } = require('express-validator');

const router = express.Router();

router.post('/register', 
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { name, email, password } = req.body;
            const [existingUsers] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            
            if (existingUsers.length > 0) {
                return res.status(400).json({ message: 'Email already exists' });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            await db.query(
                'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
                [name, email, hashedPassword, 'user']
            );

            res.status(201).json({ message: 'User registered successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
});

router.post('/login',
    [
        body('email').isEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { email, password } = req.body;
            const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email]);
            
            if (users.length === 0) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const user = users[0];
            const isMatch = await bcrypt.compare(password, user.password);

            if (!isMatch) {
                return res.status(400).json({ message: 'Invalid credentials' });
            }

            const payload = {
                id: user.id,
                email: user.email,
                role: user.role
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET || 'fallback_secret',
                { expiresIn: '1d' },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: user.role } });
                }
            );

        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
});

// Get Current Profile (Optional for refreshing user data)
router.get('/me', async (req, res) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) return res.status(401).json({ message: 'No token' });

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
        const [users] = await db.query('SELECT id, name, email, role, created_at FROM users WHERE id = ?', [decoded.id]);
        
        if (users.length === 0) return res.status(404).json({ message: 'User not found' });
        res.json(users[0]);
    } catch (error) {
        res.status(401).json({ message: 'Invalid token' });
    }
});

module.exports = router;
