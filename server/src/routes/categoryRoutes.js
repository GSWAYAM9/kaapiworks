import express from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../controllers/categoryController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, categorySchema } from '../validators/index.js';

const router = express.Router();

// Public route
router.get('/', getCategories);

// Admin routes (Customer receives 403 Forbidden)
router.post('/', requireAuth, requireRole('admin'), validate(categorySchema), createCategory);
router.put('/:id', requireAuth, requireRole('admin'), validate(categorySchema), updateCategory);
router.delete('/:id', requireAuth, requireRole('admin'), deleteCategory);

export default router;
