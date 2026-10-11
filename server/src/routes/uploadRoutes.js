import express from 'express';
import { handleImageUpload } from '../controllers/uploadController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

// Admin-only upload endpoint with multer file size & type validation
router.post('/', requireAuth, requireRole('admin'), upload.single('image'), handleImageUpload);

export default router;
