import express from 'express';
import rateLimit from 'express-rate-limit';
import { subscribe, getSubscribers } from '../controllers/newsletterController.js';

const router = express.Router();

const subscribeLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
  message: {
    success: false,
    message: 'Too many subscription requests. Please try again after a few minutes.',
  },
});

router.post('/subscribe', subscribeLimiter, subscribe);
router.post('/', subscribeLimiter, subscribe);
router.get('/', getSubscribers);

export default router;
