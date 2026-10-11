import { uploadToCloudinary } from '../config/cloudinary.js';

/**
 * POST /api/upload
 * Requires multipart/form-data with file field 'image'
 * Protected by requireAuth and requireRole('admin')
 */
export async function handleImageUpload(req, res, next) {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file uploaded. Please provide an image under the "image" field.',
      });
    }

    const { buffer, originalname } = req.file;
    const result = await uploadToCloudinary(buffer, originalname);

    return res.status(200).json({
      success: true,
      message: 'Image uploaded successfully.',
      data: {
        url: result.url,
        publicId: result.publicId,
      },
    });
  } catch (error) {
    console.error('Image upload failed:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process and upload image.',
      details: error.message,
    });
  }
}
