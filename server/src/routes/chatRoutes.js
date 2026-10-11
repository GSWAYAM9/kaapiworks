import express from 'express';
import rateLimit from 'express-rate-limit';
import { handleChatMessage } from '../controllers/chatController.js';

const router = express.Router();

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  validate: {
    xForwardedForHeader: false,
    forwardedHeader: false,
  },
  message: {
    success: false,
    message: 'Too many messages sent. Please take a sip of coffee and try again in a few moments.',
  },
});

router.post('/', chatLimiter, handleChatMessage);

export default router;
