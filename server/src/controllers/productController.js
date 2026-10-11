import { getIsMongoConnected } from '../config/db.js';
import Product from '../models/Product.js';
import Category from '../models/Category.js';
import { memoryStore } from '../config/store.js';
import { deleteFromCloudinary } from '../config/cloudinary.js';

/**
 * GET /api/products
 * Query params: search, category, roastLevel, sort, page, limit
 */
export async function getProducts(req, res, next) {
  try {
    const { search, category, roastLevel, sort, page = 1, limit = 12 } = req.query;
    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(50, parseInt(limit, 10) || 12));

    if (getIsMongoConnected()) {
      const query = {};

      // Category filter (supports either ObjectId or category slug)
      if (category && category !== 'all') {
        const foundCategory = await Category.findOne({
          $or: [{ slug: category }, { _id: category.match(/^[0-9a-fA-F]{24}$/) ? category : null }],
        });
        if (foundCategory) {
          query.category = foundCategory._id;
        }
      }

      // Roast level filter
      if (roastLevel && roastLevel !== 'all') {
        query.roastLevel = roastLevel;
      }

      // Search filter
      if (search && search.trim()) {
        const searchRegex = new RegExp(search.trim(), 'i');
        query.$or = [
          { name: searchRegex },
          { description: searchRegex },
          { estate: searchRegex },
          { tastingNotes: searchRegex },
        ];
      }

      // Sort
      let sortOptions = { createdAt: -1 };
      if (sort === 'price_asc' || sort === 'price-asc' || sort === 'price_low_high') {
        sortOptions = { price: 1 };
      } else if (sort === 'price_desc' || sort === 'price-desc' || sort === 'price_high_low') {
        sortOptions = { price: -1 };
      } else if (sort === 'name_asc') {
        sortOptions = { name: 1 };
      } else if (sort === 'oldest' || sort === 'createdAt_asc') {
        sortOptions = { createdAt: 1 };
      } else {
        // Default: recency / newest
        sortOptions = { createdAt: -1 };
      }

      const total = await Product.countDocuments(query);
      const products = await Product.find(query)
        .populate('category', 'name slug')
        .sort(sortOptions)
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum);

      return res.status(200).json({
        success: true,
        data: products,
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum) || 1,
        },
      });
    } else {
      // Memory store fallback
      const result = memoryStore.findProducts({
        search,
        categorySlug: category,
        roastLevel,
        sort,
        page: pageNum,
        limit: limitNum,
      });

      return res.status(200).json({
        success: true,
        data: result.products,
        pagination: {
          total: result.total,
          page: result.page,
          limit: limitNum,
          totalPages: result.totalPages,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/highlights
 * Landing page highlights: featured, new arrivals, roast of the month
 */
export async function getProductHighlights(req, res, next) {
  try {
    if (getIsMongoConnected()) {
      const [featured, newArrivals, roastOfTheMonth] = await Promise.all([
        Product.find({ isFeatured: true }).populate('category', 'name slug').limit(6),
        Product.find({ isNewArrival: true }).populate('category', 'name slug').limit(4),
        Product.findOne({ isRoastOfTheMonth: true }).populate('category', 'name slug'),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          featured,
          newArrivals,
          roastOfTheMonth: roastOfTheMonth || featured[0] || null,
        },
      });
    } else {
      const all = memoryStore.products;
      const featured = all.filter((p) => p.isFeatured).slice(0, 6).map((p) => memoryStore.findProductById(p._id));
      const newArrivals = all.filter((p) => p.isNewArrival).slice(0, 4).map((p) => memoryStore.findProductById(p._id));
      const roastOfTheMonth = memoryStore.findProductById(all.find((p) => p.isRoastOfTheMonth)?._id || all[0]?._id);

      return res.status(200).json({
        success: true,
        data: {
          featured,
          newArrivals,
          roastOfTheMonth,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/products/:id
 */
export async function getProductById(req, res, next) {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const product = await Product.findById(id).populate('category', 'name slug description');
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }
      return res.status(200).json({
        success: true,
        data: product,
      });
    } else {
      const product = memoryStore.findProductById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }
      return res.status(200).json({
        success: true,
        data: product,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/products (Admin only)
 */
export async function createProduct(req, res, next) {
  try {
    const data = req.validatedBody;

    if (getIsMongoConnected()) {
      const product = await Product.create(data);
      const populated = await Product.findById(product._id).populate('category', 'name slug');
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: populated,
      });
    } else {
      const product = memoryStore.createProduct(data);
      return res.status(201).json({
        success: true,
        message: 'Product created successfully.',
        data: product,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/products/:id (Admin only)
 */
export async function updateProduct(req, res, next) {
  try {
    const { id } = req.params;
    const data = req.validatedBody;

    if (getIsMongoConnected()) {
      const product = await Product.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).populate('category', 'name slug');

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: product,
      });
    } else {
      const product = memoryStore.updateProduct(id, data);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully.',
        data: product,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/products/:id (Admin only)
 */
export async function deleteProduct(req, res, next) {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const product = await Product.findByIdAndDelete(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      // Cleanup Cloudinary images
      if (Array.isArray(product.images)) {
        for (const img of product.images) {
          if (img.publicId) {
            deleteFromCloudinary(img.publicId).catch(() => {});
          }
        }
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    } else {
      const product = memoryStore.deleteProduct(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/stats (Admin only)
 */
export async function getAdminStats(req, res, next) {
  try {
    if (getIsMongoConnected()) {
      const [totalProducts, lowStock, outOfStock, totalCategories] = await Promise.all([
        Product.countDocuments(),
        Product.countDocuments({ stock: { $gt: 0, $lte: 5 } }),
        Product.countDocuments({ stock: 0 }),
        Category.countDocuments(),
      ]);

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          lowStock,
          outOfStock,
          totalCategories,
        },
      });
    } else {
      const prods = memoryStore.products;
      const totalProducts = prods.length;
      const lowStock = prods.filter((p) => p.stock > 0 && p.stock <= 5).length;
      const outOfStock = prods.filter((p) => p.stock === 0).length;
      const totalCategories = memoryStore.categories.length;

      return res.status(200).json({
        success: true,
        data: {
          totalProducts,
          lowStock,
          outOfStock,
          totalCategories,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}
