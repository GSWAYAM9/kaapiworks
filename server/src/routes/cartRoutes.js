import express from 'express';
import {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  mergeCart,
} from '../controllers/cartController.js';
import { requireAuth } from '../middleware/auth.js';
import { validate, addToCartSchema, updateCartItemSchema } from '../validators/index.js';

const router = express.Router();

// All cart endpoints require user authentication
router.use(requireAuth);

router.get('/', getCart);
router.post('/add', validate(addToCartSchema), addToCart);
router.put('/items/:productId', validate(updateCartItemSchema), updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.post('/merge', mergeCart);

export default router;
