import express from 'express';
import {
  getProductReviews,
  createProductReview,
  getAllReviewsAdmin,
  deleteReviewAdmin,
} from '../controllers/reviewController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Public: GET /api/products/:id/reviews
router.get('/products/:id/reviews', getProductReviews);

// Authenticated customer: POST /api/products/:id/reviews
router.post('/products/:id/reviews', requireAuth, createProductReview);

// Admin-only review moderation endpoints
router.get('/reviews', requireAuth, requireRole('admin'), getAllReviewsAdmin);
router.delete('/reviews/:id', requireAuth, requireRole('admin'), deleteReviewAdmin);

export default router;
