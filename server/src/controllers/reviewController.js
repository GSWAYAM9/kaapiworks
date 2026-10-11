import { getIsMongoConnected } from '../config/db.js';
import Review from '../models/Review.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/store.js';

/**
 * Helper to recalculate aggregate average rating & review count for a product in Mongo
 */
async function updateMongoProductRating(productId) {
  const reviews = await Review.find({ product: productId });
  const reviewCount = reviews.length;
  const averageRating =
    reviewCount === 0
      ? 0
      : Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount).toFixed(1));

  await Product.findByIdAndUpdate(productId, {
    averageRating,
    reviewCount,
  });

  return { averageRating, reviewCount };
}

/**
 * GET /api/products/:id/reviews
 */
export async function getProductReviews(req, res, next) {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const reviews = await Review.find({ product: id }).sort({ createdAt: -1 });

      // Compute distribution (1-star to 5-star counts)
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r) => {
        if (distribution[r.rating] !== undefined) distribution[r.rating]++;
      });

      const total = reviews.length;
      const average =
        total === 0 ? 0 : Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1));

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          averageRating: average,
          reviewCount: total,
          distribution,
        },
      });
    } else {
      const reviews = memoryStore.findReviewsByProduct(id);
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
      reviews.forEach((r) => {
        if (distribution[r.rating] !== undefined) distribution[r.rating]++;
      });

      const total = reviews.length;
      const average =
        total === 0 ? 0 : Number((reviews.reduce((acc, r) => acc + r.rating, 0) / total).toFixed(1));

      return res.status(200).json({
        success: true,
        data: {
          reviews,
          averageRating: average,
          reviewCount: total,
          distribution,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products/:id/reviews
 * Body: { rating, comment }
 * Requires Authentication
 */
export async function createProductReview(req, res, next) {
  try {
    const { id: productId } = req.params;
    const userId = req.user.id;
    const userName = req.user.name;
    const { rating, comment } = req.body;

    const numRating = Number(rating);
    if (!numRating || numRating < 1 || numRating > 5) {
      return res.status(422).json({
        success: false,
        message: 'Rating must be an integer between 1 and 5 stars.',
      });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length < 3) {
      return res.status(422).json({
        success: false,
        message: 'Review comment must be at least 3 characters long.',
      });
    }

    if (comment.length > 1000) {
      return res.status(422).json({
        success: false,
        message: 'Review comment cannot exceed 1000 characters.',
      });
    }

    if (getIsMongoConnected()) {
      // Check product exists
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      // Check duplicate review
      const existing = await Review.findOne({ product: productId, user: userId });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'You have already submitted a review for this product.',
        });
      }

      const review = await Review.create({
        product: productId,
        user: userId,
        userName,
        rating: numRating,
        comment: comment.trim(),
        verifiedPurchase: true,
      });

      // Recalculate aggregate product ratings
      await updateMongoProductRating(productId);

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Thank you for your feedback!',
        data: review,
      });
    } else {
      const prod = memoryStore.findProductById(productId);
      if (!prod) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      const review = memoryStore.createReview({
        product: productId,
        user: userId,
        userName,
        rating: numRating,
        comment: comment.trim(),
      });

      return res.status(201).json({
        success: true,
        message: 'Review submitted successfully. Thank you for your feedback!',
        data: review,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/reviews (Admin only)
 * Returns all reviews across store for moderation
 */
export async function getAllReviewsAdmin(req, res, next) {
  try {
    if (getIsMongoConnected()) {
      const reviews = await Review.find()
        .sort({ createdAt: -1 })
        .populate('product', 'name price images');

      return res.status(200).json({
        success: true,
        data: reviews,
      });
    } else {
      const reviews = memoryStore.getAllReviews();
      return res.status(200).json({
        success: true,
        data: reviews,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/reviews/:id (Admin only)
 */
export async function deleteReviewAdmin(req, res, next) {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const review = await Review.findByIdAndDelete(id);
      if (!review) {
        return res.status(404).json({
          success: false,
          message: 'Review not found.',
        });
      }

      // Recalculate rating on product
      await updateMongoProductRating(review.product);

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
      });
    } else {
      const deleted = memoryStore.deleteReview(id);
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Review not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Review deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
}
