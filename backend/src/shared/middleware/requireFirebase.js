const { isFirebaseAvailable } = require('../firebase');
const AppError = require('../utils/appError');

/**
 * Middleware to check if Firebase is available
 * Returns 503 Service Unavailable if Firebase is not initialized
 * This allows graceful degraded mode handling in development
 */
const requireFirebase = (req, res, next) => {
  if (!isFirebaseAvailable()) {
    return next(
      new AppError(
        'Firebase service is currently unavailable. Please check server configuration.',
        503
      )
    );
  }
  next();
};

module.exports = requireFirebase;
