const AppError = require('../utils/appError');
const { admin } = require('../firebase');

/**
 * Middleware to protect routes with API key authentication.
 * Checks for the 'x-api-key' header and compares it with the API_KEY environment variable.
 * @deprecated Use authenticate middleware for user-based authentication
 */
const protectWithApiKey = (req, res, next) => {
  // Get API key from headers
  const apiKey = req.headers['x-api-key'];

  // Check if API key is present
  if (!apiKey) {
    return next(new AppError('API key is missing. Please provide x-api-key header.', 401));
  }

  // Check if API key is valid
  if (apiKey !== process.env.API_KEY) {
    return next(new AppError('Invalid API key.', 401));
  }

  // Grant access
  next();
};

/**
 * Middleware to authenticate users using Firebase ID tokens
 * Checks for 'Authorization: Bearer <token>' header
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(new AppError('Authentication token is missing. Please provide Authorization header.', 401));
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return next(new AppError('Authentication token is missing.', 401));
    }

    // Verify the Firebase ID token
    try {
      const decodedToken = await admin.auth().verifyIdToken(token);
      
      // Attach user info to request object
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email,
        emailVerified: decodedToken.email_verified,
      };

      next();
    } catch (error) {
      if (error.code === 'auth/id-token-expired') {
        return next(new AppError('Authentication token has expired. Please login again.', 401));
      }
      if (error.code === 'auth/argument-error') {
        return next(new AppError('Invalid authentication token format.', 401));
      }
      return next(new AppError('Invalid authentication token.', 401));
    }
  } catch (error) {
    return next(new AppError('Authentication failed.', 401));
  }
};

/**
 * Optional authentication middleware
 * Tries to authenticate if token is present, but doesn't fail if missing
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      
      if (token) {
        try {
          const decodedToken = await admin.auth().verifyIdToken(token);
          req.user = {
            uid: decodedToken.uid,
            email: decodedToken.email,
            emailVerified: decodedToken.email_verified,
          };
        } catch (error) {
          // Token is invalid, but we don't fail - just continue without user
          req.user = null;
        }
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};

/**
 * Role-based access control middleware
 * Requires authenticate middleware to be run first
 * @param {string|string[]} roles - Required role(s) to access the route
 */
const requireRole = (roles) => {
  return async (req, res, next) => {
    if (!req.user || !req.user.uid) {
      return next(new AppError('Authentication required.', 401));
    }

    // Import here to avoid circular dependency
    const { db } = require('../firebase');
    const { COLLECTIONS } = require('../config/constants');

    try {
      // Get user profile from Firestore
      const userDoc = await db.collection(COLLECTIONS.USERS).doc(req.user.uid).get();
      
      if (!userDoc.exists) {
        return next(new AppError('User profile not found.', 404));
      }

      const userData = userDoc.data();
      const userRole = userData.role;

      // Add role to req.user for later use
      req.user.role = userRole;

      // Check if user has required role
      const allowedRoles = Array.isArray(roles) ? roles : [roles];
      
      if (!allowedRoles.includes(userRole)) {
        return next(new AppError('You do not have permission to access this resource.', 403));
      }

      next();
    } catch (error) {
      return next(new AppError('Failed to verify user role.', 500));
    }
  };
};

// Legacy export for backward compatibility
const protect = protectWithApiKey;

module.exports = { 
  protect, 
  protectWithApiKey, 
  authenticate, 
  optionalAuth,
  requireRole 
};

