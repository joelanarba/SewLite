const express = require('express');
const router = express.Router();
const orderController = require('../../controllers/orderController');
const validate = require('../../middleware/validate');
const sanitizeMiddleware = require('../../middleware/sanitizeMiddleware');
const requireFirebase = require('../../middleware/requireFirebase');
const { smsRateLimiter } = require('../../middleware/rateLimitMiddleware');
const { createOrder, updateOrder, trackOrder } = require('../../validations/orderValidation');

router.use(sanitizeMiddleware);
router.use(requireFirebase);

router.get('/customer/:customerId', orderController.getOrdersByCustomer);
router.post('/', validate(createOrder), orderController.createOrder);
router.put('/:id', smsRateLimiter, validate(updateOrder), orderController.updateOrder);
router.post('/track', validate(trackOrder), orderController.trackOrder);

module.exports = router;
