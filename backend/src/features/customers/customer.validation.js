const Joi = require('joi');

const createCustomer = Joi.object({
  name: Joi.string().required(),
  phone: Joi.string().required(),
  measurements: Joi.object().optional(),
  item: Joi.string().allow('').optional(),
  pickupDate: Joi.date().iso().allow(null).optional(),
  fittingDate: Joi.date().iso().allow(null).optional(),
  balance: Joi.number().allow(null).optional(),
  notes: Joi.string().allow('').optional(),
});

const updateCustomer = Joi.object({
  name: Joi.string().optional(),
  phone: Joi.string().optional(),
  measurements: Joi.object().optional(),
  item: Joi.string().allow('').optional(),
  pickupDate: Joi.date().iso().allow(null).optional(),
  fittingDate: Joi.date().iso().allow(null).optional(),
  balance: Joi.number().allow(null).optional(),
  notes: Joi.string().allow('').optional(),
});

module.exports = {
  createCustomer,
  updateCustomer,
};
