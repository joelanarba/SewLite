/**
 * API Deprecation Management
 * 
 * This utility manages API deprecation notices, sunset dates, and warning headers.
 * It follows RFC 7234 (HTTP Caching) and RFC 8594 (Sunset HTTP Header) standards.
 */

/**
 * Deprecation configuration for routes and versions
 */
const deprecationConfig = {
  // Legacy unversioned routes
  legacyRoutes: {
    deprecated: true,
    sunsetDate: '2026-06-01', // 6 months from implementation
    message: 'Unversioned endpoints are deprecated. Please use /api/v1/* instead.',
    migrationGuide: 'https://docs.yourapp.com/api/versioning'
  },
  
  // Future: Add specific version deprecations
  versions: {
    // Example for when v1 needs to be deprecated:
    // v1: {
    //   deprecated: false,
    //   sunsetDate: null,
    //   message: null
    // }
  }
};

/**
 * Check if a route or version is deprecated
 * @param {string} type - 'legacy' or 'version'
 * @param {string} value - route path or version number
 * @returns {Object|null} Deprecation info or null if not deprecated
 */
function getDeprecationInfo(type, value) {
  if (type === 'legacy') {
    return deprecationConfig.legacyRoutes.deprecated 
      ? deprecationConfig.legacyRoutes 
      : null;
  }
  
  if (type === 'version' && deprecationConfig.versions[value]) {
    const versionConfig = deprecationConfig.versions[value];
    return versionConfig.deprecated ? versionConfig : null;
  }
  
  return null;
}

/**
 * Generate deprecation warning headers
 * @param {Object} deprecationInfo - Deprecation configuration
 * @returns {Object} Headers to add to response
 */
function generateDeprecationHeaders(deprecationInfo) {
  if (!deprecationInfo) return {};
  
  const headers = {
    'Deprecation': 'true',
    'X-API-Warn': deprecationInfo.message
  };
  
  // Add Sunset header if sunset date is set (RFC 8594)
  if (deprecationInfo.sunsetDate) {
    const sunsetDate = new Date(deprecationInfo.sunsetDate);
    headers['Sunset'] = sunsetDate.toUTCString();
  }
  
  // Add link to migration guide if available
  if (deprecationInfo.migrationGuide) {
    headers['Link'] = `<${deprecationInfo.migrationGuide}>; rel="deprecation"`;
  }
  
  return headers;
}

/**
 * Log deprecation usage for analytics
 * @param {Object} req - Express request object
 * @param {Object} deprecationInfo - Deprecation configuration
 */
function logDeprecationUsage(req, deprecationInfo) {
  console.warn('[API Deprecation]', {
    path: req.originalUrl,
    method: req.method,
    message: deprecationInfo.message,
    sunsetDate: deprecationInfo.sunsetDate,
    timestamp: new Date().toISOString(),
    userAgent: req.get('User-Agent'),
    ip: req.ip
  });
}

/**
 * Middleware to add deprecation warnings to legacy routes
 */
function deprecationWarningMiddleware(req, res, next) {
  const deprecationInfo = getDeprecationInfo('legacy', req.path);
  
  if (deprecationInfo) {
    // Add deprecation headers
    const headers = generateDeprecationHeaders(deprecationInfo);
    Object.entries(headers).forEach(([key, value]) => {
      res.setHeader(key, value);
    });
    
    // Log usage for tracking
    logDeprecationUsage(req, deprecationInfo);
  }
  
  next();
}

module.exports = {
  deprecationConfig,
  getDeprecationInfo,
  generateDeprecationHeaders,
  logDeprecationUsage,
  deprecationWarningMiddleware
};
