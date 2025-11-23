const AppError = require('../utils/appError');

/**
 * Middleware to protect routes with API key authentication.
 * Checks for the 'x-api-key' header and compares it with the API_KEY environment variable.
 */
const protect = (req, res, next) => {
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

module.exports = { protect };
