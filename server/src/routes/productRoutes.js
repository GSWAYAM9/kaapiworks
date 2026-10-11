import express from 'express';
import {
  getProducts,
  getProductHighlights,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { getProductReviews, createProductReview } from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { validate, productSchema } from '../validators/index.js';

const router = express.Router();

// Public routes
router.get('/', getProducts);
router.get('/highlights', getProductHighlights);
router.get('/:id', getProductById);
router.get('/:id/reviews', getProductReviews);

// Authenticated reviews submission
router.post('/:id/reviews', requireAuth, createProductReview);

// Admin routes (Customer receives 403 Forbidden)
router.post('/', requireAuth, requireRole('admin'), validate(productSchema), createProduct);
router.put('/:id', requireAuth, requireRole('admin'), validate(productSchema), updateProduct);
router.delete('/:id', requireAuth, requireRole('admin'), deleteProduct);

export default router;
