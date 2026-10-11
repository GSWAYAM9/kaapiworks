import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getIsMongoConnected } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaapi_works_super_secret_jwt_key_2026';
const JWT_EXPIRES_IN = '7d';
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days in ms

/**
 * Generate a signed JWT
 */
function signToken(userId, role) {
  return jwt.sign({ id: userId, role }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Set httpOnly secure cookie
 */
function setCookie(res, token) {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('kw_token', token, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: COOKIE_MAX_AGE,
    path: '/',
  });
}

/**
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password } = req.validatedBody;
    const cleanEmail = email.toLowerCase().trim();

    // Check if user already exists
    if (getIsMongoConnected()) {
      const existing = await User.findOne({ email: cleanEmail });
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      // Hash with cost 12
      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = await User.create({
        name,
        email: cleanEmail,
        passwordHash,
        role: 'customer',
      });

      const token = signToken(user._id.toString(), user.role);
      setCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
        },
      });
    } else {
      // Memory store fallback
      const existing = memoryStore.findUserByEmail(cleanEmail);
      if (existing) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email address already exists.',
        });
      }

      const salt = await bcrypt.genSalt(12);
      const passwordHash = await bcrypt.hash(password, salt);

      const user = memoryStore.createUser({
        name,
        email: cleanEmail,
        passwordHash,
        role: 'customer',
      });

      const token = signToken(user._id, user.role);
      setCookie(res, token);

      return res.status(201).json({
        success: true,
        message: 'Account created successfully.',
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.validatedBody;
    const cleanEmail = email.toLowerCase().trim();

    let user = null;
    if (getIsMongoConnected()) {
      user = await User.findOne({ email: cleanEmail });
    } else {
      user = memoryStore.findUserByEmail(cleanEmail);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    // Verify bcrypt password hash
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email address or password.',
      });
    }

    const userId = user._id ? user._id.toString() : user.id;
    const token = signToken(userId, user.role);
    setCookie(res, token);

    return res.status(200).json({
      success: true,
      message: 'Signed in successfully.',
      token,
      user: {
        id: userId,
        name: user.name,
        email: user.email,
        role: user.role,
        beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 */
export function logout(req, res) {
  const isProd = process.env.NODE_ENV === 'production';
  res.clearCookie('kw_token', {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}

/**
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    const userId = req.user.id;
    if (getIsMongoConnected()) {
      const user = await User.findById(userId).select('-passwordHash');
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      return res.status(200).json({
        success: true,
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          shippingAddress: user.shippingAddress || {},
          beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
        },
      });
    } else {
      const user = memoryStore.findUserById(userId);
      return res.status(200).json({
        success: true,
        user: {
          id: user?._id || userId,
          name: user?.name || req.user.name,
          email: user?.email || req.user.email,
          role: user?.role || req.user.role,
          phone: user?.phone || '',
          shippingAddress: user?.shippingAddress || {},
          beanPoints: user?.beanPoints !== undefined ? user?.beanPoints : 150,
        },
      });
    }
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const { name, phone, shippingAddress } = req.body;

    if (getIsMongoConnected()) {
      const updateData = {};
      if (name && name.trim()) updateData.name = name.trim();
      if (phone !== undefined) updateData.phone = phone.trim();
      if (shippingAddress) updateData.shippingAddress = shippingAddress;

      const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select(
        '-passwordHash'
      );

      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          shippingAddress: user.shippingAddress || {},
          beanPoints: user.beanPoints !== undefined ? user.beanPoints : 150,
        },
      });
    } else {
      const updated = memoryStore.updateUserProfile(userId, { name, phone, shippingAddress });
      return res.status(200).json({
        success: true,
        message: 'Profile updated successfully.',
        user: updated,
      });
    }
  } catch (error) {
    next(error);
  }
}

