import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary from environment variables
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
});

/**
 * Upload an image buffer to Cloudinary
 * @param {Buffer} buffer - File buffer from multer memory storage
 * @param {string} originalName - Original filename
 * @returns {Promise<{ url: string, publicId: string }>}
 */
export async function uploadToCloudinary(buffer, originalName = 'coffee-product') {
  // Check if real Cloudinary credentials are provided
  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (hasCloudinary) {
    return new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: 'kaapi_works/products',
          resource_type: 'image',
          transformation: [
            { width: 1200, height: 1200, crop: 'limit' },
            { quality: 'auto', fetch_format: 'auto' },
          ],
        },
        (error, result) => {
          if (error) {
            return reject(error);
          }
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        }
      );
      uploadStream.end(buffer);
    });
  }

  // Graceful fallback for local development or preview without Cloudinary credentials:
  // Convert buffer to data URI so image upload works end-to-end without failing.
  const mimeType = originalName.endsWith('.png')
    ? 'image/png'
    : originalName.endsWith('.webp')
    ? 'image/webp'
    : 'image/jpeg';
  const base64Data = buffer.toString('base64');
  const dataUri = `data:${mimeType};base64,${base64Data}`;
  const publicId = `local_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  return {
    url: dataUri,
    publicId,
  };
}

/**
 * Delete an image from Cloudinary
 * @param {string} publicId
 * @returns {Promise<boolean>}
 */
export async function deleteFromCloudinary(publicId) {
  if (!publicId || publicId.startsWith('local_')) {
    return true;
  }

  const hasCloudinary =
    process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET;

  if (!hasCloudinary) {
    return true;
  }

  try {
    const result = await cloudinary.uploader.destroy(publicId);
    return result.result === 'ok';
  } catch (err) {
    console.error('Failed to delete image from Cloudinary:', err);
    return false;
  }
}

export default cloudinary;
