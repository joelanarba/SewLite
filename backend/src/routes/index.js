/**
 * Centralized API Router
 * 
 * This router manages all API versions and provides version routing
 */

const express = require('express');
const router = express.Router();
const AppError = require('../utils/appError');

// Import versioned routers
const v1Router = require('./v1');

// Mount version routers
router.use('/v1', v1Router);

// API root endpoint - provides API information
router.get('/', (req, res) => {
  res.json({
    success: true,
    data: {
      name: 'Fashion Designer Backend API',
      currentVersion: 'v1',
      supportedVersions: ['v1'],
      baseUrl: `${req.protocol}://${req.get('host')}/api`,
      documentation: 'https://docs.yourapp.com/api',
      endpoints: {
        v1: '/api/v1'
      }
    },
    message: 'API Information'
  });
});

// Handle requests to unsupported versions
router.all('/:version/*', (req, res, next) => {
  const version = req.params.version;
  const supportedVersions = ['v1'];
  
  if (!supportedVersions.includes(version)) {
    return next(new AppError(
      `API version '${version}' is not supported. Supported versions: ${supportedVersions.join(', ')}`,
      404
    ));
  }
  
  next();
});

module.exports = router;
