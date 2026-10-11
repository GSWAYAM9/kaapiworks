import { getIsMongoConnected } from '../config/db.js';
import Subscriber from '../models/Subscriber.js';
import { memoryStore } from '../config/store.js';

const EMAIL_REGEX = /^\S+@\S+\.\S+$/;

/**
 * POST /api/newsletter/subscribe or POST /api/subscribers
 * Body: { email: string, source?: string }
 */
export async function subscribe(req, res, next) {
  try {
    const { email, source = 'footer' } = req.body;

    if (!email || typeof email !== 'string' || !EMAIL_REGEX.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();

    if (!getIsMongoConnected()) {
      const result = memoryStore.addSubscriber(cleanEmail, source);
      const isNew = result.isNew;

      return res.status(isNew ? 201 : 200).json({
        success: true,
        isNew,
        message: isNew
          ? 'Welcome to the Kaapi Guild! You are now subscribed to our micro-lot harvest dispatches and private tasting alerts.'
          : "You're already on our dispatch list! Thank you for staying connected with our roastery.",
        data: {
          email: result.subscriber.email,
          createdAt: result.subscriber.createdAt,
        },
      });
    }

    // MongoDB Atlas
    let subscriber = await Subscriber.findOne({ email: cleanEmail });

    if (subscriber) {
      if (!subscriber.isActive) {
        subscriber.isActive = true;
        await subscriber.save();
        return res.status(200).json({
          success: true,
          isNew: false,
          message: 'Welcome back! Your newsletter subscription has been reactivated.',
          data: {
            email: subscriber.email,
            createdAt: subscriber.createdAt,
          },
        });
      }

      return res.status(200).json({
        success: true,
        isNew: false,
        message: "You're already on our dispatch list! Thank you for staying connected with our roastery.",
        data: {
          email: subscriber.email,
          createdAt: subscriber.createdAt,
        },
      });
    }

    subscriber = await Subscriber.create({
      email: cleanEmail,
      source: source || 'footer',
      isActive: true,
    });

    return res.status(201).json({
      success: true,
      isNew: true,
      message: 'Welcome to the Kaapi Guild! You are now subscribed to our micro-lot harvest dispatches and private tasting alerts.',
      data: {
        email: subscriber.email,
        createdAt: subscriber.createdAt,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/newsletter/subscribers or GET /api/subscribers
 */
export async function getSubscribers(req, res, next) {
  try {
    if (!getIsMongoConnected()) {
      const list = memoryStore.getSubscribers();
      return res.status(200).json({
        success: true,
        count: list.length,
        data: list,
      });
    }

    const subscribers = await Subscriber.find({ isActive: true }).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: subscribers.length,
      data: subscribers,
    });
  } catch (error) {
    next(error);
  }
}
