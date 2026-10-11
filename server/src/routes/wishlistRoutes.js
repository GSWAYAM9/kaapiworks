import express from 'express';
import {
  getWishlist,
  toggleWishlist,
  addToWishlist,
  removeFromWishlist,
  clearWishlist,
} from '../controllers/wishlistController.js';
import { requireAuth } from '../middleware/auth.js';

const router = express.Router();

// Wishlist endpoints require authentication
router.use(requireAuth);

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);
router.post('/add', addToWishlist);
router.delete('/:productId', removeFromWishlist);
router.delete('/', clearWishlist);

export default router;
