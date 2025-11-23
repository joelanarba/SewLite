const express = require('express');
const router = express.Router();
const customerController = require('../../controllers/customerController');
const validate = require('../../middleware/validate');
const sanitizeMiddleware = require('../../middleware/sanitizeMiddleware');
const requireFirebase = require('../../middleware/requireFirebase');
const { createCustomer, updateCustomer } = require('../../validations/customerValidation');

router.use(sanitizeMiddleware);
router.use(requireFirebase);

router.get('/', customerController.getAllCustomers);
router.get('/:id', customerController.getCustomerById);
router.post('/', validate(createCustomer), customerController.createCustomer);
router.put('/:id', validate(updateCustomer), customerController.updateCustomer);
router.delete('/:id', customerController.deleteCustomer);

module.exports = router;
