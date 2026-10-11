import jwt from 'jsonwebtoken';
import { getIsMongoConnected } from '../config/db.js';
import User from '../models/User.js';
import { memoryStore } from '../config/store.js';

const JWT_SECRET = process.env.JWT_SECRET || 'kaapi_works_super_secret_jwt_key_2026';

/**
 * Middleware: Require authenticated user via httpOnly cookie or Authorization header
 */
export async function requireAuth(req, res, next) {
  try {
    let token = null;

    // 1. Check httpOnly cookie
    if (req.cookies && req.cookies.kw_token) {
      token = req.cookies.kw_token;
    }
    // 2. Check Authorization header (Bearer <token>)
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Please sign in to continue.',
      });
    }

    // Verify token
    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired session. Please sign in again.',
      });
    }

    // Retrieve user from active database or memory store
    let user = null;
    if (getIsMongoConnected()) {
      user = await User.findById(decoded.id).select('-passwordHash');
    } else {
      user = memoryStore.findUserById(decoded.id);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Account not found or session revoked.',
      });
    }

    req.user = {
      _id: user._id.toString(),
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication verification.',
    });
  }
}

/**
 * Middleware: Require specific role (e.g. 'admin')
 * Customers must receive a 403 Forbidden on admin endpoints
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Access restricted. You do not have '${roles.join(' or ')}' privileges.`,
      });
    }

    next();
  };
}
