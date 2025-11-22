/**
 * API Version Middleware
 * 
 * Middleware for extracting, validating, and tracking API versions
 */

const AppError = require('../utils/appError');

/**
 * Supported API versions
 */
const SUPPORTED_VERSIONS = ['v1'];
const DEFAULT_VERSION = 'v1';
const LATEST_VERSION = 'v1';

/**
 * Extract version from request URL
 * @param {string} path - Request path
 * @returns {string|null} Version string (e.g., 'v1') or null if not found
 */
function extractVersionFromPath(path) {
  const versionMatch = path.match(/^\/api\/(v\d+)/);
  return versionMatch ? versionMatch[1] : null;
}

/**
 * Check if a version is supported
 * @param {string} version - Version to check
 * @returns {boolean} True if supported
 */
function isVersionSupported(version) {
  return SUPPORTED_VERSIONS.includes(version);
}

/**
 * Middleware to extract and attach version info to request
 */
function extractVersionMiddleware(req, res, next) {
  const version = extractVersionFromPath(req.path);
  
  // Attach version info to request
  req.apiVersion = {
    version: version || DEFAULT_VERSION,
    isVersioned: !!version,
    isLegacy: !version,
    latest: LATEST_VERSION
  };
  
  // Add version info to response headers
  res.setHeader('X-API-Version', req.apiVersion.version);
  res.setHeader('X-API-Latest-Version', LATEST_VERSION);
  
  next();
}

/**
 * Middleware to validate API version
 * Only validates versioned routes (/api/v*)
 */
function validateVersionMiddleware(req, res, next) {
  // Only validate if this is a versioned API request
  if (!req.path.startsWith('/api/v')) {
    return next();
  }
  
  const version = extractVersionFromPath(req.path);
  
  if (!version) {
    return next(new AppError('API version not specified in path', 400));
  }
  
  if (!isVersionSupported(version)) {
    return next(new AppError(
      `API version '${version}' is not supported. Supported versions: ${SUPPORTED_VERSIONS.join(', ')}`,
      400
    ));
  }
  
  next();
}

/**
 * Log API version usage for analytics
 */
function logVersionUsage(req, res, next) {
  if (req.apiVersion) {
    console.log('[API Version]', {
      version: req.apiVersion.version,
      isLegacy: req.apiVersion.isLegacy,
      path: req.originalUrl,
      method: req.method,
      timestamp: new Date().toISOString()
    });
  }
  
  next();
}

/**
 * Combined version middleware (extract + validate + log)
 */
function versionMiddleware(req, res, next) {
  extractVersionMiddleware(req, res, (err) => {
    if (err) return next(err);
    
    validateVersionMiddleware(req, res, (err) => {
      if (err) return next(err);
      
      logVersionUsage(req, res, next);
    });
  });
}

module.exports = {
  versionMiddleware,
  extractVersionMiddleware,
  validateVersionMiddleware,
  logVersionUsage,
  extractVersionFromPath,
  isVersionSupported,
  SUPPORTED_VERSIONS,
  DEFAULT_VERSION,
  LATEST_VERSION
};
