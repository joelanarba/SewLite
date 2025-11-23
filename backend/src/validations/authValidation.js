const Joi = require('joi');

/**
 * Validation schema for user registration
 */
const register = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password must be at least 6 characters long',
    'any.required': 'Password is required'
  }),
  name: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Name must be at least 2 characters long',
    'string.max': 'Name must not exceed 100 characters',
    'any.required': 'Name is required'
  }),
  role: Joi.string().valid('designer', 'customer').default('customer').messages({
    'any.only': 'Role must be either "designer" or "customer"'
  })
});

/**
 * Validation schema for user login
 */
const login = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Please provide a valid email address',
    'any.required': 'Email is required'
  }),
  password: Joi.string().required().messages({
    'any.required': 'Password is required'
  })
});

/**
 * Validation schema for token verification
 */
const verifyToken = Joi.object({
  token: Joi.string().required().messages({
    'any.required': 'Token is required'
  })
});

module.exports = {
  register,
  login,
  verifyToken
};
