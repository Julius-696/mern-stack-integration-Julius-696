// routes/categories.js - CRUD routes for Categories

const express = require('express');
const { body, validationResult } = require('express-validator');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/categories - list all categories
router.get('/', async (req, res, next) => {
  try {
    const categories = await Category.find().sort({ name: 1 });
    res.json(categories);
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - create a category
router.post(
  '/',
  authMiddleware,
  [body('name').notEmpty().withMessage('Category name is required')],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { name, description } = req.body;

      // Prevent duplicates
      const existing = await Category.findOne({ name });
      if (existing) return res.status(400).json({ message: 'Category already exists' });

      const category = new Category({ name, description });
      await category.save();
      res.status(201).json(category);
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
