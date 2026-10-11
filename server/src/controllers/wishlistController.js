import { getIsMongoConnected } from '../config/db.js';
import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/store.js';

/**
 * Format Mongo wishlist document for client response
 */
function formatMongoWishlist(doc) {
  const items = [];
  if (doc && doc.items) {
    for (const item of doc.items) {
      if (item && item.product) {
        items.push({
          _id: item._id,
          product: item.product,
          addedAt: item.addedAt || item.createdAt || new Date().toISOString(),
        });
      }
    }
  }

  return {
    _id: doc._id,
    user: doc.user,
    items,
    itemCount: items.length,
    productIds: items.map((it) => (it.product._id ? it.product._id.toString() : it.product.toString())),
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

/**
 * GET /api/wishlist
 */
export async function getWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    if (!getIsMongoConnected()) {
      const wishlistData = memoryStore.getWishlist(userId);
      return res.status(200).json({
        success: true,
        data: wishlistData,
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId }).populate({
      path: 'items.product',
      populate: { path: 'category' },
    });

    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    return res.status(200).json({
      success: true,
      data: formatMongoWishlist(wishlist),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist/toggle
 * Body: { productId }
 */
export async function toggleWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    if (!getIsMongoConnected()) {
      const product = memoryStore.findProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const result = memoryStore.toggleWishlist(userId, productId);
      return res.status(200).json({
        success: true,
        inWishlist: result.inWishlist,
        message: result.inWishlist
          ? `Added "${product.name}" to wishlist.`
          : `Removed "${product.name}" from wishlist.`,
        data: result.wishlist,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const existingIndex = wishlist.items.findIndex(
      (item) => item.product && item.product.toString() === productId
    );

    let inWishlist = false;
    if (existingIndex > -1) {
      wishlist.items.splice(existingIndex, 1);
      inWishlist = false;
    } else {
      wishlist.items.push({ product: productId, addedAt: new Date() });
      inWishlist = true;
    }

    await wishlist.save();
    await wishlist.populate({
      path: 'items.product',
      populate: { path: 'category' },
    });

    return res.status(200).json({
      success: true,
      inWishlist,
      message: inWishlist
        ? `Added "${product.name}" to wishlist.`
        : `Removed "${product.name}" from wishlist.`,
      data: formatMongoWishlist(wishlist),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/wishlist/add
 * Body: { productId }
 */
export async function addToWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.body;

    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'productId is required',
      });
    }

    if (!getIsMongoConnected()) {
      const product = memoryStore.findProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found',
        });
      }

      const updated = memoryStore.addToWishlist(userId, productId);
      return res.status(200).json({
        success: true,
        message: `Added "${product.name}" to wishlist.`,
        data: updated,
      });
    }

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found',
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (!wishlist) {
      wishlist = await Wishlist.create({ user: userId, items: [] });
    }

    const exists = wishlist.items.some(
      (item) => item.product && item.product.toString() === productId
    );

    if (!exists) {
      wishlist.items.push({ product: productId, addedAt: new Date() });
      await wishlist.save();
    }

    await wishlist.populate({
      path: 'items.product',
      populate: { path: 'category' },
    });

    return res.status(200).json({
      success: true,
      message: `Added "${product.name}" to wishlist.`,
      data: formatMongoWishlist(wishlist),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist/:productId
 */
export async function removeFromWishlist(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (!getIsMongoConnected()) {
      const updated = memoryStore.removeFromWishlist(userId, productId);
      return res.status(200).json({
        success: true,
        message: 'Item removed from wishlist.',
        data: updated,
      });
    }

    let wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = wishlist.items.filter(
        (item) =>
          item.product &&
          item.product.toString() !== productId &&
          item._id.toString() !== productId
      );
      await wishlist.save();
      await wishlist.populate({
        path: 'items.product',
        populate: { path: 'category' },
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Item removed from wishlist.',
      data: wishlist ? formatMongoWishlist(wishlist) : { items: [], itemCount: 0, productIds: [] },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/wishlist
 */
export async function clearWishlist(req, res, next) {
  try {
    const userId = req.user.id;

    if (!getIsMongoConnected()) {
      const updated = memoryStore.clearWishlist(userId);
      return res.status(200).json({
        success: true,
        message: 'Wishlist cleared.',
        data: updated,
      });
    }

    const wishlist = await Wishlist.findOne({ user: userId });
    if (wishlist) {
      wishlist.items = [];
      await wishlist.save();
    }

    return res.status(200).json({
      success: true,
      message: 'Wishlist cleared.',
      data: wishlist ? formatMongoWishlist(wishlist) : { items: [], itemCount: 0, productIds: [] },
    });
  } catch (error) {
    next(error);
  }
}
