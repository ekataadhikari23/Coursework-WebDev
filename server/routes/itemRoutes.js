const express = require('express');
const router = express.Router();
const itemController = require('../controllers/itemController');
const { verifyToken } = require('../auth');

// Public route to view items
router.get('/', itemController.getItems);

// Protected routes (require admin JWT token)
router.post('/', verifyToken, itemController.createItem);
router.put('/:id', verifyToken, itemController.updateItem);
router.delete('/:id', verifyToken, itemController.deleteItem);

module.exports = router;