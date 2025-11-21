const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.get('/customer/:customerId', orderController.getOrdersByCustomer);
router.post('/', orderController.createOrder);
router.put('/:id', orderController.updateOrder);
router.post('/track', orderController.trackOrder);

module.exports = router;
