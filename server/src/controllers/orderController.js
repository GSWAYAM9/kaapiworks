import mongoose from 'mongoose';
import { getIsMongoConnected } from '../config/db.js';
import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import { memoryStore } from '../config/store.js';
import { sendOrderStatusNotification } from '../services/emailService.js';

/**
 * GET /api/orders
 * Returns orders placed by the authenticated user
 */
export async function getUserOrders(req, res, next) {
  try {
    const userId = req.user.id;

    if (getIsMongoConnected()) {
      const orders = await Order.find({ user: userId })
        .sort({ createdAt: -1 })
        .populate('items.product', 'name price images roastLevel');

      return res.status(200).json({
        success: true,
        data: orders,
      });
    } else {
      const orders = memoryStore.findOrdersByUser(userId);
      return res.status(200).json({
        success: true,
        data: orders,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/orders/:id
 */
export async function getOrderById(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    if (getIsMongoConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ _id: id }, { orderNumber: id }], user: userId }
        : { orderNumber: id, user: userId };

      const order = await Order.findOne(query).populate(
        'items.product',
        'name price images roastLevel'
      );
      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }
      return res.status(200).json({
        success: true,
        data: order,
      });
    } else {
      const order = memoryStore.findOrderById(id);
      if (!order || order.user !== userId) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }
      return res.status(200).json({
        success: true,
        data: order,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/orders
 * Creates a new order from current cart or specified payload
 */
export async function createOrder(req, res, next) {
  try {
    const userId = req.user.id;
    const { shippingAddress, paymentMethod, pointsToRedeem = 0, giftMessage = '' } = req.body;

    if (getIsMongoConnected()) {
      // 1. Fetch user's cart
      const cart = await Cart.findOne({ user: userId }).populate('items.product');
      if (!cart || !cart.items || cart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot place order with an empty bag.',
        });
      }

      // 2. Validate items, stock, and calculate server total
      let subtotal = 0;
      const orderItems = [];

      for (const item of cart.items) {
        if (!item.product) continue;
        const prod = item.product;
        if (prod.stock < item.quantity) {
          return res.status(400).json({
            success: false,
            message: `Insufficient inventory for ${prod.name} (Only ${prod.stock} available).`,
          });
        }

        const itemTotal = prod.price * item.quantity;
        subtotal += itemTotal;

        orderItems.push({
          product: prod._id,
          name: prod.name,
          price: prod.price,
          quantity: item.quantity,
          image: prod.images?.[0]?.url || '',
          roastLevel: prod.roastLevel || null,
        });

        // Decrement product inventory
        prod.stock = Math.max(0, prod.stock - item.quantity);
        await prod.save();
      }

      // Loyalty points redemption & calculation
      const user = await User.findById(userId);
      const userPoints = user?.beanPoints || 0;
      const requestedPoints = Math.max(0, parseInt(pointsToRedeem, 10) || 0);
      const actualPointsRedeemed = Math.min(requestedPoints, userPoints, subtotal);
      const pointsDiscount = actualPointsRedeemed * 1; // 1 Bean Point = ₹1

      const payableSubtotal = Math.max(0, subtotal - pointsDiscount);
      const shipping = subtotal >= 1499 || subtotal === 0 ? 0 : 99;
      const total = payableSubtotal + shipping;
      const pointsEarned = Math.floor(payableSubtotal / 10); // 1 Bean Point per ₹10 spent

      // Update user points
      if (user) {
        user.beanPoints = Math.max(0, userPoints - actualPointsRedeemed) + pointsEarned;
        await user.save();
      }

      const orderNumber = `KW-${Math.floor(10000 + Math.random() * 90000)}`;

      const order = await Order.create({
        user: userId,
        orderNumber,
        items: orderItems,
        subtotal,
        shipping,
        total,
        pointsRedeemed: actualPointsRedeemed,
        pointsDiscount,
        pointsEarned,
        status: 'processing',
        trackingNumber: `BD-${Math.floor(10000000 + Math.random() * 90000000)}`,
        carrier: 'Blue Dart Express Air',
        estimatedDelivery: new Date(Date.now() + 3 * 86400000).toISOString(),
        shippingAddress: shippingAddress || {
          street: '12th Main Road',
          city: 'Bengaluru',
          state: 'Karnataka',
          postalCode: '560038',
          country: 'India',
        },
        paymentMethod: paymentMethod || 'UPI / Card',
        paymentStatus: 'paid',
        giftMessage: giftMessage ? String(giftMessage).trim() : '',
      });

      // Clear the user's cart
      cart.items = [];
      await cart.save();

      // Send initial order confirmation email
      sendOrderStatusNotification({
        order,
        previousStatus: 'none',
        newStatus: order.status || 'confirmed',
      }).catch((err) => console.error('[OrderController] Email confirmation error:', err.message));

      return res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        data: order,
        beanPoints: user ? user.beanPoints : 0,
      });
    } else {
      const currentCart = memoryStore.getCart(userId);
      if (!currentCart || currentCart.items.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Cannot place order with an empty bag.',
        });
      }

      const user = memoryStore.findUserById(userId);
      const userPoints = user?.beanPoints !== undefined ? user.beanPoints : 150;
      const requestedPoints = Math.max(0, parseInt(pointsToRedeem, 10) || 0);
      const actualPointsRedeemed = Math.min(requestedPoints, userPoints, currentCart.subtotal);
      const pointsDiscount = actualPointsRedeemed * 1;

      const payableSubtotal = Math.max(0, currentCart.subtotal - pointsDiscount);
      const shipping = currentCart.subtotal >= 1499 || currentCart.subtotal === 0 ? 0 : 99;
      const total = payableSubtotal + shipping;
      const pointsEarned = Math.floor(payableSubtotal / 10);

      const newOrder = memoryStore.createOrder({
        user: userId,
        items: currentCart.items,
        subtotal: currentCart.subtotal,
        shipping,
        total,
        pointsRedeemed: actualPointsRedeemed,
        pointsDiscount,
        pointsEarned,
        shippingAddress,
        paymentMethod,
        giftMessage: giftMessage ? String(giftMessage).trim() : '',
      });

      memoryStore.clearCart(userId);

      // Send initial order confirmation email
      sendOrderStatusNotification({
        order: newOrder,
        previousStatus: 'none',
        newStatus: newOrder.status || 'confirmed',
      }).catch((err) => console.error('[OrderController] Email confirmation error:', err.message));

      return res.status(201).json({
        success: true,
        message: 'Order created successfully.',
        data: newOrder,
        beanPoints: user ? user.beanPoints : 0,
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/orders/:id/status
 * Updates order progress status
 */
export async function updateOrderStatus(req, res, next) {
  try {
    const userId = req.user.id;
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = [
      'confirmed',
      'processing',
      'roasted',
      'dispatched',
      'shipped',
      'delivered',
      'cancelled',
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
      });
    }

    if (getIsMongoConnected()) {
      const isObjectId = mongoose.Types.ObjectId.isValid(id);
      const query = isObjectId
        ? { $or: [{ _id: id }, { orderNumber: id }] }
        : { orderNumber: id };

      if (req.user.role !== 'admin') {
        query.user = userId;
      }

      const existingOrder = await Order.findOne(query);
      if (!existingOrder) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      const previousStatus = existingOrder.status;
      existingOrder.status = status;
      if (req.body.trackingNumber) existingOrder.trackingNumber = req.body.trackingNumber;
      if (req.body.carrier) existingOrder.carrier = req.body.carrier;
      if (req.body.estimatedDelivery) existingOrder.estimatedDelivery = req.body.estimatedDelivery;
      await existingOrder.save();
      await existingOrder.populate('items.product', 'name price images roastLevel');

      // Send email notification on status transition
      if (previousStatus !== status) {
        sendOrderStatusNotification({
          order: existingOrder,
          previousStatus,
          newStatus: status,
        }).catch((err) => console.error('[OrderController] Email notification error:', err.message));
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}.`,
        data: existingOrder,
      });
    } else {
      const order = memoryStore.findOrderById(id);
      if (!order || (req.user.role !== 'admin' && order.user !== userId)) {
        return res.status(404).json({
          success: false,
          message: 'Order not found.',
        });
      }

      const previousStatus = order.status;
      order.status = status;
      if (req.body.trackingNumber) order.trackingNumber = req.body.trackingNumber;
      if (req.body.carrier) order.carrier = req.body.carrier;
      if (req.body.estimatedDelivery) order.estimatedDelivery = req.body.estimatedDelivery;
      order.updatedAt = new Date().toISOString();

      // Send email notification on status transition
      if (previousStatus !== status) {
        sendOrderStatusNotification({
          order,
          previousStatus,
          newStatus: status,
        }).catch((err) => console.error('[OrderController] Email notification error:', err.message));
      }

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}.`,
        data: order,
      });
    }
  } catch (error) {
    next(error);
  }
}
