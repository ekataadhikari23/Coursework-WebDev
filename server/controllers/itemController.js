const { Item, Category } = require('../models');

exports.getItems = async (req, res) => {
  try {
    const items = await Item.findAll({ include: Category });
    res.json(items);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch items' });
  }
};

exports.createItem = async (req, res) => {
  try {
    const { name, price, stock, categoryId, image } = req.body;

    if (!name || price == null || stock == null || !categoryId) {
      return res.status(400).json({ error: 'All fields (name, price, stock, categoryId) are required.' });
    }
    if (price < 0 || stock < 0) {
      return res.status(400).json({ error: 'Price and stock cannot be negative numbers.' });
    }

    const newItem = await Item.create({ name, price, stock, categoryId, image });
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create item' });
  }
};

exports.updateItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, stock, categoryId, image } = req.body;

    if (!name || price == null || stock == null || !categoryId) {
      return res.status(400).json({ error: 'All fields are required.' });
    }
    if (price < 0 || stock < 0) {
      return res.status(400).json({ error: 'Price and stock cannot be negative numbers.' });
    }

    const item = await Item.findByPk(id);
    if (!item) {
      return res.status(404).json({ error: 'Item not found' });
    }

    await item.update({ name, price, stock, categoryId, image });
    res.json({ message: 'Item updated successfully', item });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update item' });
  }
};

exports.deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Item.destroy({ where: { id } });
    
    if (!deleted) {
      return res.status(404).json({ error: 'Item not found' });
    }
    res.json({ message: 'Item deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete item' });
  }
};