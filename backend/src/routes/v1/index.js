/**
 * API v1 Routes
 * 
 * Central router for all v1 API endpoints
 */

const express = require('express');
const router = express.Router();

// Import v1 route modules
const customerRoutes = require('./customerRoutes');
const orderRoutes = require('./orderRoutes');
const authRoutes = require('./authRoutes');

// Mount v1 routes
// Auth routes are public (no authentication required for /register, etc.)
router.use('/auth', authRoutes);
router.use('/customers', customerRoutes);
router.use('/orders', orderRoutes);

// v1 API info endpoint
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      version: 'v1',
      status: 'active',
      endpoints: {
        auth: '/api/v1/auth',
        customers: '/api/v1/customers',
        orders: '/api/v1/orders'
      },
      documentation: 'https://docs.yourapp.com/api/v1'
    },
    message: 'API v1'
  });
});

module.exports = router;
