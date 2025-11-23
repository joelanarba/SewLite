const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const { authenticate, optionalAuth } = require('../../middleware/authMiddleware');
const validate = require('../../middleware/validate');
const sanitizeMiddleware = require('../../middleware/sanitizeMiddleware');
const requireFirebase = require('../../middleware/requireFirebase');
const { smsRateLimiter } = require('../../middleware/rateLimitMiddleware');
const { createOrder, updateOrder, trackOrder } = require('../../validations/orderValidation');

router.use(sanitizeMiddleware);
router.use(requireFirebase);

// Protected routes (require authentication)
router.get('/customer/:customerId', authenticate, orderController.getOrdersByCustomer);
router.post('/', authenticate, validate(createOrder), orderController.createOrder);
router.put('/:id', authenticate, smsRateLimiter, validate(updateOrder), orderController.updateOrder);

// Public route (no authentication required) - customer order tracking
router.post('/track', validate(trackOrder), orderController.trackOrder);

module.exports = router;
