import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(60, 'Name cannot exceed 60 characters'),
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(6, 'Password must be at least 6 characters').max(100, 'Password is too long'),
});

export const loginSchema = z.object({
  email: z.string().trim().email('Invalid email address').toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, 'Product name must be at least 2 characters').max(120),
  description: z.string().trim().min(10, 'Description must be at least 10 characters'),
  price: z.coerce.number().positive('Price must be greater than 0'),
  category: z.string().min(1, 'Category is required'),
  stock: z.coerce.number().int().min(0, 'Stock cannot be negative').default(0),
  roastLevel: z.enum(['light', 'medium', 'dark']).nullable().optional(),
  tastingNotes: z.array(z.string()).optional().default([]),
  estate: z.string().trim().optional().default(''),
  altitude: z.string().trim().optional().default(''),
  process: z.string().trim().optional().default(''),
  isFeatured: z.coerce.boolean().optional().default(false),
  isNewArrival: z.coerce.boolean().optional().default(false),
  isRoastOfTheMonth: z.coerce.boolean().optional().default(false),
  images: z
    .array(
      z.object({
        url: z.string().url('Image must have a valid URL'),
        publicId: z.string().min(1, 'Image public ID is required'),
      })
    )
    .min(1, 'At least one product image is required'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2, 'Category name must be at least 2 characters').max(50),
  slug: z
    .string()
    .trim()
    .min(2)
    .regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens')
    .optional(),
  description: z.string().trim().optional().default(''),
});

export const addToCartSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1').max(50, 'Cannot add more than 50 at once'),
});

export const updateCartItemSchema = z.object({
  quantity: z.coerce.number().int().min(0, 'Quantity cannot be negative').max(50),
});

/**
 * Express middleware helper to validate request body with Zod schema
 */
export function validate(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const errorMessages = result.error.errors.map((err) => `${err.path.join('.')}: ${err.message}`).join(', ');
      return res.status(422).json({
        success: false,
        message: 'Validation failed',
        errors: result.error.flatten().fieldErrors,
        details: errorMessages,
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
