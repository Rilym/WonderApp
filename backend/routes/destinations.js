const express = require('express');
const db = require('../db');
const { authMiddleware, ownerMiddleware } = require('../middleware/authMiddleware');
const multer = require('multer');
const path = require('path');
const { body, validationResult } = require('express-validator');

const router = express.Router();

// Multer Config for multiple images
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

// Get all destinations with Filters, Sorting, and Pagination
router.get('/', async (req, res) => {
    try {
        let { page, limit, category, minPrice, maxPrice, sort } = req.query;
        
        page = parseInt(page) || 1;
        limit = parseInt(limit) || 12;
        const offset = (page - 1) * limit;

        let query = 'SELECT * FROM destinations WHERE is_active = TRUE';
        const params = [];

        if (category) {
            query += ' AND category = ?';
            params.push(category);
        }
        if (minPrice) {
            query += ' AND price >= ?';
            params.push(minPrice);
        }
        if (maxPrice) {
            query += ' AND price <= ?';
            params.push(maxPrice);
        }

        if (sort === 'price_asc') query += ' ORDER BY price ASC';
        else if (sort === 'price_desc') query += ' ORDER BY price DESC';
        else query += ' ORDER BY created_at DESC';

        // Get total count for pagination
        const [countResult] = await db.query(query.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
        const total = countResult[0].total;

        // Apply pagination limit
        query += ' LIMIT ? OFFSET ?';
        params.push(limit, offset);

        const [destinations] = await db.query(query, params);
        
        res.json({
            data: destinations,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Get single destination
router.get('/:id', async (req, res) => {
    try {
        const [destination] = await db.query('SELECT * FROM destinations WHERE id = ? AND is_active = TRUE', [req.params.id]);
        if (destination.length === 0) return res.status(404).json({ message: 'Destination not found' });
        
        // Also fetch average rating
        const [[ratingResult]] = await db.query('SELECT AVG(rating) as avg_rating, COUNT(*) as review_count FROM reviews WHERE destination_id = ?', [req.params.id]);
        
        res.json({
            ...destination[0],
            rating: parseFloat(ratingResult.avg_rating) || 0,
            review_count: ratingResult.review_count
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Create destination (Owner/Admin only)
router.post('/', authMiddleware, ownerMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        const { name, description, price, category, location, stock, latitude, longitude } = req.body;
        
        // Handle multiple images
        let imagesArray = [];
        if (req.files && req.files.length > 0) {
            imagesArray = req.files.map(file => `/uploads/${file.filename}`);
        }
        
        const imagesJson = JSON.stringify(imagesArray);
        const firstImage = imagesArray.length > 0 ? imagesArray[0] : null;

        await db.query(
            'INSERT INTO destinations (name, description, price, category, location, image_url, images, owner_id, stock, latitude, longitude, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE)',
            [name, description, price, category, location, firstImage, imagesJson, req.user.id, stock || 0, latitude || null, longitude || null]
        );
        res.status(201).json({ message: 'Destination created' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Update destination (Owner/Admin only)
router.put('/:id', authMiddleware, ownerMiddleware, upload.array('images', 5), async (req, res) => {
    try {
        // Verify ownership if role is owner
        if (req.user.role === 'owner') {
            const [dest] = await db.query('SELECT owner_id FROM destinations WHERE id = ?', [req.params.id]);
            if (dest.length === 0 || dest[0].owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized to edit this destination' });
            }
        }

        const { name, description, price, category, location, stock, latitude, longitude } = req.body;
        let query = 'UPDATE destinations SET name=?, description=?, price=?, category=?, location=?, stock=?, latitude=?, longitude=?';
        let params = [name, description, price, category, location, stock || 0, latitude || null, longitude || null];

        if (req.files && req.files.length > 0) {
            const imagesArray = req.files.map(file => `/uploads/${file.filename}`);
            query += ', image_url=?, images=?';
            params.push(imagesArray[0], JSON.stringify(imagesArray));
        }
        
        query += ' WHERE id=?';
        params.push(req.params.id);

        await db.query(query, params);
        res.json({ message: 'Destination updated' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Soft Delete destination (Owner/Admin only)
router.delete('/:id', authMiddleware, ownerMiddleware, async (req, res) => {
    try {
        if (req.user.role === 'owner') {
            const [dest] = await db.query('SELECT owner_id FROM destinations WHERE id = ?', [req.params.id]);
            if (dest.length === 0 || dest[0].owner_id !== req.user.id) {
                return res.status(403).json({ message: 'Unauthorized to delete this destination' });
            }
        }

        await db.query('UPDATE destinations SET is_active = FALSE WHERE id = ?', [req.params.id]);
        res.json({ message: 'Destination disabled (soft deleted)' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// REVIEWS API
// Get reviews for a destination
router.get('/:id/reviews', async (req, res) => {
    try {
        const [reviews] = await db.query(`
            SELECT r.id, r.rating, r.comment, r.created_at, u.name as user_name
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.destination_id = ?
            ORDER BY r.created_at DESC
        `, [req.params.id]);
        res.json(reviews);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

// Add a review
router.post('/:id/reviews', 
    authMiddleware,
    [
        body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
        body('comment').optional().trim().isLength({ max: 500 }).withMessage('Comment too long')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        try {
            const { rating, comment } = req.body;
            
            // Check if user already reviewed
            const [existing] = await db.query('SELECT id FROM reviews WHERE user_id = ? AND destination_id = ?', [req.user.id, req.params.id]);
            if (existing.length > 0) return res.status(400).json({ message: 'You have already reviewed this destination' });

            await db.query(
                'INSERT INTO reviews (user_id, destination_id, rating, comment) VALUES (?, ?, ?, ?)',
                [req.user.id, req.params.id, rating, comment || null]
            );
            res.status(201).json({ message: 'Review added successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Server error', error: error.message });
        }
});

module.exports = router;
