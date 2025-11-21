const express = require('express');
const router = express.Router();
const customerController = require('../controllers/customerController');
const validate = require('../middleware/validate');
const { createCustomer, updateCustomer } = require('../validations/customerValidation');

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(createCustomer), customerController.createCustomer);
router.put('/:id', validate(updateCustomer), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
