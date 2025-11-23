const express = require('express');
const router = express.Router();
const authController = require('../../controllers/authController');
const { authRateLimiter } = require('../../middleware/rateLimitMiddleware');
const { authenticate } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const authValidation = require('../../validations/authValidation');

/**
 * Authentication Routes
 * Base path: /api/v1/auth
 */

// Public routes (no authentication required)
router.post(
  '/register',
  authRateLimiter,
  validate(authValidation.register),
  authController.register
);

router.post(
  '/verify',
  validate(authValidation.verifyToken),
  authController.verifyToken
);

// Protected routes (require authentication)
router.get('/me', authenticate, authController.getCurrentUser);
router.post('/refresh', authenticate, authController.refreshToken);

module.exports = router;
