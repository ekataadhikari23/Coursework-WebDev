const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const { verifyToken } = require('../auth');

// Public route to view categories
router.get('/', categoryController.getCategories);

// Protected route to add categories (admin only)
router.post('/', verifyToken, categoryController.createCategory);

module.exports = router;