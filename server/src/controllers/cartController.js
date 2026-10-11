import { getIsMongoConnected } from '../config/db.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/store.js';

/**
 * Helper to compute cart totals securely on server from live product records
 */
async function formatMongoCart(cart) {
  let subtotal = 0;
  const items = [];

  for (const item of cart.items) {
    if (!item.product) continue;
    const prod = item.product;
    // Cap to available stock
    const validQuantity = Math.max(1, Math.min(item.quantity, Math.max(1, prod.stock)));
    const itemTotal = prod.price * validQuantity;
    subtotal += itemTotal;

    items.push({
      _id: item._id,
      product: {
        _id: prod._id,
        name: prod.name,
        price: prod.price,
        stock: prod.stock,
        images: prod.images,
        roastLevel: prod.roastLevel,
        tastingNotes: prod.tastingNotes,
        estate: prod.estate,
      },
      quantity: validQuantity,
      unitPrice: prod.price,
      itemTotal,
    });
  }

  // Shipping policy: Free above ₹1,499, otherwise ₹99
  const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
  const total = subtotal + shipping;

  return {
    _id: cart._id,
    user: cart.user,
    items,
    subtotal,
    shipping,
    total,
    itemCount: items.reduce((acc, curr) => acc + curr.quantity, 0),
  };
}

/**
 * GET /api/cart
 */
export async function getCart(req, res, next) {
  try {
    const userId = req.user.id;

    if (getIsMongoConnected()) {
      let cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart) {
        cart = await Cart.create({ user: userId, items: [] });
      }

      const formatted = await formatMongoCart(cart);
      return res.status(200).json({
        success: true,
        data: formatted,
      });
    } else {
      const formatted = memoryStore.getCart(userId);
      return res.status(200).json({
        success: true,
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/add
 * Body: { productId, quantity }
 */
export async function addToCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId, quantity = 1 } = req.validatedBody;
    const qty = Math.max(1, parseInt(quantity, 10));

    if (getIsMongoConnected()) {
      // 1. Validate product existence and stock
      const product = await Product.findById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This product is currently out of stock.',
        });
      }

      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      const existingIndex = cart.items.findIndex(
        (it) => it.product && it.product.toString() === productId
      );

      if (existingIndex > -1) {
        const newQty = cart.items[existingIndex].quantity + qty;
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock.`,
          });
        }
        cart.items[existingIndex].quantity = newQty;
      } else {
        if (qty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock.`,
          });
        }
        cart.items.push({ product: productId, quantity: qty });
      }

      await cart.save();
      const populated = await Cart.findById(cart._id).populate('items.product');
      const formatted = await formatMongoCart(populated);

      return res.status(200).json({
        success: true,
        message: 'Added to cart.',
        data: formatted,
      });
    } else {
      const product = memoryStore.findProductById(productId);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found.',
        });
      }

      if (product.stock <= 0) {
        return res.status(400).json({
          success: false,
          message: 'This product is currently out of stock.',
        });
      }

      let currentCart = memoryStore.carts.find((c) => c.user === userId);
      if (!currentCart) {
        currentCart = {
          _id: `cart_${Date.now()}`,
          user: userId,
          items: [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        memoryStore.carts.push(currentCart);
      }

      const existingItem = currentCart.items.find(
        (it) => it.product === productId || (typeof it.product === 'object' && it.product._id === productId)
      );

      if (existingItem) {
        const newQty = existingItem.quantity + qty;
        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock.`,
          });
        }
        existingItem.quantity = newQty;
      } else {
        if (qty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Only ${product.stock} units available in stock.`,
          });
        }
        currentCart.items.push({
          _id: `item_${Date.now()}`,
          product: productId,
          quantity: qty,
        });
      }

      const formatted = memoryStore.getCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Added to cart.',
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/cart/items/:productId
 * Body: { quantity }
 */
export async function updateCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;
    const { quantity } = req.validatedBody;
    const newQty = parseInt(quantity, 10);

    if (getIsMongoConnected()) {
      const cart = await Cart.findOne({ user: userId });
      if (!cart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }

      if (newQty <= 0) {
        // Remove item if quantity is zero
        cart.items = cart.items.filter((it) => it.product.toString() !== productId);
      } else {
        const product = await Product.findById(productId);
        if (!product) {
          return res.status(404).json({
            success: false,
            message: 'Product not found.',
          });
        }

        if (newQty > product.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot exceed available stock (${product.stock} units).`,
          });
        }

        const item = cart.items.find((it) => it.product.toString() === productId);
        if (item) {
          item.quantity = newQty;
        } else {
          cart.items.push({ product: productId, quantity: newQty });
        }
      }

      await cart.save();
      const populated = await Cart.findById(cart._id).populate('items.product');
      const formatted = await formatMongoCart(populated);

      return res.status(200).json({
        success: true,
        message: 'Cart updated.',
        data: formatted,
      });
    } else {
      let currentCart = memoryStore.carts.find((c) => c.user === userId);
      if (!currentCart) {
        return res.status(404).json({
          success: false,
          message: 'Cart not found.',
        });
      }

      if (newQty <= 0) {
        currentCart.items = currentCart.items.filter(
          (it) => it.product !== productId && (typeof it.product !== 'object' || it.product._id !== productId)
        );
      } else {
        const prod = memoryStore.findProductById(productId);
        if (!prod) {
          return res.status(404).json({
            success: false,
            message: 'Product not found.',
          });
        }

        if (newQty > prod.stock) {
          return res.status(400).json({
            success: false,
            message: `Cannot exceed available stock (${prod.stock} units).`,
          });
        }

        const item = currentCart.items.find(
          (it) => it.product === productId || (typeof it.product === 'object' && it.product._id === productId)
        );
        if (item) {
          item.quantity = newQty;
        } else {
          currentCart.items.push({ product: productId, quantity: newQty });
        }
      }

      const formatted = memoryStore.getCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Cart updated.',
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/cart/items/:productId
 */
export async function removeCartItem(req, res, next) {
  try {
    const userId = req.user.id;
    const { productId } = req.params;

    if (getIsMongoConnected()) {
      const cart = await Cart.findOne({ user: userId });
      if (cart) {
        cart.items = cart.items.filter((it) => it.product.toString() !== productId);
        await cart.save();
      }

      const populated = await Cart.findOne({ user: userId }).populate('items.product');
      const formatted = await formatMongoCart(populated || { user: userId, items: [] });

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        data: formatted,
      });
    } else {
      const currentCart = memoryStore.carts.find((c) => c.user === userId);
      if (currentCart) {
        currentCart.items = currentCart.items.filter(
          (it) => it.product !== productId && (typeof it.product !== 'object' || it.product._id !== productId)
        );
      }

      const formatted = memoryStore.getCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Item removed from cart.',
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/cart/merge
 * Merges guest cart items from localStorage upon login
 * Body: { items: [{ productId, quantity }] }
 */
export async function mergeCart(req, res, next) {
  try {
    const userId = req.user.id;
    const { items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      if (getIsMongoConnected()) {
        const cart = await Cart.findOne({ user: userId }).populate('items.product');
        return res.status(200).json({
          success: true,
          data: await formatMongoCart(cart || { user: userId, items: [] }),
        });
      } else {
        return res.status(200).json({
          success: true,
          data: memoryStore.getCart(userId),
        });
      }
    }

    if (getIsMongoConnected()) {
      let cart = await Cart.findOne({ user: userId });
      if (!cart) {
        cart = new Cart({ user: userId, items: [] });
      }

      for (const guestItem of items) {
        const prodId = guestItem.productId || (guestItem.product && guestItem.product._id);
        const qty = Math.max(1, parseInt(guestItem.quantity, 10) || 1);
        if (!prodId) continue;

        const product = await Product.findById(prodId);
        if (!product || product.stock <= 0) continue;

        const existing = cart.items.find((it) => it.product.toString() === prodId);
        if (existing) {
          existing.quantity = Math.min(product.stock, existing.quantity + qty);
        } else {
          cart.items.push({
            product: prodId,
            quantity: Math.min(product.stock, qty),
          });
        }
      }

      await cart.save();
      const populated = await Cart.findById(cart._id).populate('items.product');
      const formatted = await formatMongoCart(populated);

      return res.status(200).json({
        success: true,
        message: 'Cart merged successfully.',
        data: formatted,
      });
    } else {
      for (const guestItem of items) {
        const prodId = guestItem.productId || (guestItem.product && guestItem.product._id);
        const qty = Math.max(1, parseInt(guestItem.quantity, 10) || 1);
        if (!prodId) continue;

        const prod = memoryStore.findProductById(prodId);
        if (!prod || prod.stock <= 0) continue;

        let currentCart = memoryStore.carts.find((c) => c.user === userId);
        if (!currentCart) {
          currentCart = {
            _id: `cart_${Date.now()}`,
            user: userId,
            items: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
          memoryStore.carts.push(currentCart);
        }

        const existing = currentCart.items.find(
          (it) => it.product === prodId || (typeof it.product === 'object' && it.product._id === prodId)
        );

        if (existing) {
          existing.quantity = Math.min(prod.stock, existing.quantity + qty);
        } else {
          currentCart.items.push({
            _id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
            product: prodId,
            quantity: Math.min(prod.stock, qty),
          });
        }
      }

      const formatted = memoryStore.getCart(userId);
      return res.status(200).json({
        success: true,
        message: 'Cart merged successfully.',
        data: formatted,
      });
    }
  } catch (error) {
    next(error);
  }
}
