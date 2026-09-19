const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'borrowloop_super_secret_jwt_key_2026_modern_marketplace_token'
      );

      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      if (req.user.isBlocked) {
        return res.status(403).json({ success: false, message: 'Your account has been suspended by an administrator.' });
      }

      return next();
    } catch (error) {
      console.error('[Auth Middleware] Token error:', error.message);
      return res.status(401).json({ success: false, message: 'Not authorized, invalid or expired token' });
    }
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token provided' });
  }
};

// Optional auth - populates req.user if token is present, but doesn't reject if not
const optionalAuth = async (req, res, next) => {
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    try {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'borrowloop_super_secret_jwt_key_2026_modern_marketplace_token'
      );
      req.user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Ignore token errors for optional auth
    }
  }
  next();
};

module.exports = { protect, optionalAuth };
