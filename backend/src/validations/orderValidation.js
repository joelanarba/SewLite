const Joi = require('joi');
const { ORDER_STATUSES } = require('../config/constants');

const createOrder = Joi.object({
  customerId: Joi.string().required(),
  customerName: Joi.string().optional(),
  customerPhone: Joi.string().optional(),
  item: Joi.string().required(),
  measurements: Joi.object().optional(),
  price: Joi.number().optional(),
  deposit: Joi.number().optional(),
  pickupDate: Joi.date().iso().allow(null).optional(),
  fittingDate: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('').optional(),
});

const updateOrder = Joi.object({
  status: Joi.string().valid(...ORDER_STATUSES).optional(),
  measurements: Joi.object().optional(),
  price: Joi.number().optional(),
  deposit: Joi.number().optional(),
  pickupDate: Joi.date().iso().allow(null).optional(),
  fittingDate: Joi.date().iso().allow(null).optional(),
  notes: Joi.string().allow('').optional(),
});

const trackOrder = Joi.object({
  phone: Joi.string().required(),
});

module.exports = {
  createOrder,
  updateOrder,
  trackOrder,
};
