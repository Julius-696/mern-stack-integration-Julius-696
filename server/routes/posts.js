// routes/posts.js - CRUD routes for Posts

const express = require('express');
const { body, validationResult } = require('express-validator');
const Post = require('../models/Post');
const Category = require('../models/Category');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// GET /api/posts - list posts with optional pagination and category filter
router.get('/', async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const category = req.query.category || null;

    const filter = {};
    if (category) filter.category = category;

    const posts = await Post.find(filter)
      .populate('author', 'name email')
      .populate('category', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const total = await Post.countDocuments(filter);

    res.json({ posts, page, limit, total });
  } catch (err) {
    next(err);
  }
});

// GET /api/posts/:id - get post by id or slug
router.get('/:id', async (req, res, next) => {
  try {
    const idOrSlug = req.params.id;
    let post = null;

    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      post = await Post.findById(idOrSlug).populate('author category');
    }

    if (!post) {
      post = await Post.findOne({ slug: idOrSlug }).populate('author category');
    }

    if (!post) return res.status(404).json({ message: 'Post not found' });

    // increment view count (non-blocking)
    post.incrementViewCount().catch(() => {});

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// POST /api/posts - create a new post
router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('content').notEmpty().withMessage('Content is required'),
    body('author').notEmpty().withMessage('Author is required'),
    body('category').notEmpty().withMessage('Category is required'),
  ],
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    try {
      const { title, content, author, category, excerpt, tags, featuredImage, isPublished, slug } = req.body;

      // Ensure category exists
      const cat = await Category.findById(category);
      if (!cat) return res.status(400).json({ message: 'Invalid category' });

      // Generate slug from title if not provided
      const finalSlug = slug || title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

      const post = new Post({ 
        title, 
        content, 
        author, 
        category, 
        excerpt, 
        tags, 
        featuredImage, 
        isPublished,
        slug: finalSlug
      });
      await post.save();

      res.status(201).json(post);
    } catch (err) {
      next(err);
    }
  }
);

// PUT /api/posts/:id - update post
router.put('/:id', authMiddleware, async (req, res, next) => {
  try {
    const id = req.params.id;
    const updates = req.body;

    const post = await Post.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json(post);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/posts/:id
router.delete('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const post = await Post.findByIdAndDelete(id);
    if (!post) return res.status(404).json({ message: 'Post not found' });

    res.json({ message: 'Post deleted' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
