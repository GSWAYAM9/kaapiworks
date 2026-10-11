import { getIsMongoConnected } from '../config/db.js';
import Category from '../models/Category.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/store.js';

/**
 * GET /api/categories
 */
export async function getCategories(req, res, next) {
  try {
    if (getIsMongoConnected()) {
      const categories = await Category.find().sort({ name: 1 });
      return res.status(200).json({
        success: true,
        data: categories,
      });
    } else {
      const categories = memoryStore.getCategories();
      return res.status(200).json({
        success: true,
        data: categories,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/categories (Admin only)
 */
export async function createCategory(req, res, next) {
  try {
    const { name, slug, description } = req.validatedBody;
    const finalSlug = (slug || name).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (getIsMongoConnected()) {
      const existing = await Category.findOne({ $or: [{ name }, { slug: finalSlug }] });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A category with this name or slug already exists.',
        });
      }

      const category = await Category.create({
        name,
        slug: finalSlug,
        description: description || '',
      });

      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
      });
    } else {
      const existing = memoryStore.categories.find((c) => c.name.toLowerCase() === name.toLowerCase() || c.slug === finalSlug);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'A category with this name or slug already exists.',
        });
      }

      const category = memoryStore.createCategory({ name, slug: finalSlug, description });
      return res.status(201).json({
        success: true,
        message: 'Category created successfully.',
        data: category,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/categories/:id (Admin only)
 */
export async function updateCategory(req, res, next) {
  try {
    const { id } = req.params;
    const { name, slug, description } = req.validatedBody;

    if (getIsMongoConnected()) {
      const updateData = {};
      if (name) updateData.name = name;
      if (slug) updateData.slug = slug;
      if (description !== undefined) updateData.description = description;

      const category = await Category.findByIdAndUpdate(id, updateData, { new: true });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: category,
      });
    } else {
      const category = memoryStore.updateCategory(id, { name, slug, description });
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category updated successfully.',
        data: category,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/categories/:id (Admin only)
 */
export async function deleteCategory(req, res, next) {
  try {
    const { id } = req.params;

    if (getIsMongoConnected()) {
      // Check if products exist in category
      const productCount = await Product.countDocuments({ category: id });
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category: ${productCount} products are assigned to it. Reassign or delete products first.`,
        });
      }

      const category = await Category.findByIdAndDelete(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
      });
    } else {
      const productCount = memoryStore.products.filter((p) => p.category === id).length;
      if (productCount > 0) {
        return res.status(400).json({
          success: false,
          message: `Cannot delete category: ${productCount} products are assigned to it.`,
        });
      }

      const category = memoryStore.deleteCategory(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Category not found.',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Category deleted successfully.',
      });
    }
  } catch (error) {
    next(error);
  }
}
