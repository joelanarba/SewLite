const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Firebase Initialization with Robust Validation
 * Provides detailed error messages and validation for different deployment scenarios
 */

// Error types for detailed reporting
const FIREBASE_ERROR_TYPES = {
  MISSING_FILE: 'MISSING_FILE',
  MISSING_ENV: 'MISSING_ENV',
  CORRUPTED_JSON: 'CORRUPTED_JSON',
  INVALID_STRUCTURE: 'INVALID_STRUCTURE',
  INIT_FAILED: 'INIT_FAILED'
};

/**
 * Validates service account key structure
 * @param {Object} serviceAccount - The service account object to validate
 * @returns {Object} { valid: boolean, missing: string[] }
 */
function validateServiceAccountStructure(serviceAccount) {
  const requiredFields = [
    'type',
    'project_id',
    'private_key_id',
    'private_key',
    'client_email',
    'client_id',
    'auth_uri',
    'token_uri'
  ];

  const missing = requiredFields.filter(field => !serviceAccount[field]);
  
  return {
    valid: missing.length === 0,
    missing
  };
}

/**
 * Loads service account from file or environment variable
 * @returns {Object|null} { serviceAccount, errorType, errorDetails }
 */
function loadServiceAccount() {
  let serviceAccount = null;
  let errorType = null;
  let errorDetails = {};

  // Strategy 1: Try to load from local file (for local development)
  try {
    serviceAccount = require('../serviceAccountKey.json');
    console.log('✓ Service account loaded from file: serviceAccountKey.json');
    
    // Validate structure
    const validation = validateServiceAccountStructure(serviceAccount);
    if (!validation.valid) {
      errorType = FIREBASE_ERROR_TYPES.INVALID_STRUCTURE;
      errorDetails = {
        source: 'serviceAccountKey.json',
        missing: validation.missing,
        message: `Service account file is missing required fields: ${validation.missing.join(', ')}`
      };
      serviceAccount = null;
    }
  } catch (fileError) {
    console.log('ℹ Service account file not found (this is OK for production deployments)');
    
    // Strategy 2: Try to load from environment variable (for production/CI/Docker)
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      try {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
        console.log('✓ Service account loaded from environment variable: FIREBASE_SERVICE_ACCOUNT');
        
        // Validate structure
        const validation = validateServiceAccountStructure(serviceAccount);
        if (!validation.valid) {
          errorType = FIREBASE_ERROR_TYPES.INVALID_STRUCTURE;
          errorDetails = {
            source: 'FIREBASE_SERVICE_ACCOUNT env var',
            missing: validation.missing,
            message: `Service account from env is missing required fields: ${validation.missing.join(', ')}`
          };
          serviceAccount = null;
        }
      } catch (parseError) {
        errorType = FIREBASE_ERROR_TYPES.CORRUPTED_JSON;
        errorDetails = {
          source: 'FIREBASE_SERVICE_ACCOUNT env var',
          parseError: parseError.message,
          message: 'Environment variable FIREBASE_SERVICE_ACCOUNT contains invalid JSON'
        };
      }
    } else {
      // No file and no env variable
      errorType = FIREBASE_ERROR_TYPES.MISSING_ENV;
      errorDetails = {
        message: 'No Firebase credentials found in file or environment'
      };
    }
  }

  return { serviceAccount, errorType, errorDetails };
}

/**
 * Provides detailed, actionable error messages based on error type and environment
 * @param {string} errorType - The type of error encountered
 * @param {Object} errorDetails - Additional error details
 */
function reportFirebaseError(errorType, errorDetails) {
  const isProduction = process.env.NODE_ENV === 'production';
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true';
  const isDocker = process.env.DOCKER_CONTAINER === 'true';

  console.error('\n' + '='.repeat(80));
  console.error('❌ FIREBASE INITIALIZATION FAILED');
  console.error('='.repeat(80));

  switch (errorType) {
    case FIREBASE_ERROR_TYPES.MISSING_FILE:
    case FIREBASE_ERROR_TYPES.MISSING_ENV:
      console.error('\n📋 ISSUE: Firebase credentials not found\n');
      console.error('ENVIRONMENT DETECTED:');
      console.error(`  • NODE_ENV: ${process.env.NODE_ENV || 'not set'}`);
      console.error(`  • CI: ${isCI ? 'Yes' : 'No'}`);
      console.error(`  • Docker: ${isDocker ? 'Yes' : 'No'}`);
      
      console.error('\n🔧 HOW TO FIX:\n');
      
      if (isDevelopment) {
        console.error('For LOCAL DEVELOPMENT:');
        console.error('  1. Download your service account key from Firebase Console:');
        console.error('     https://console.firebase.google.com/project/_/settings/serviceaccounts/adminsdk');
        console.error('  2. Save it as: backend/serviceAccountKey.json');
        console.error('  3. Restart the server\n');
      }
      
      if (isProduction || isDocker) {
        console.error('For PRODUCTION/DOCKER:');
        console.error('  1. Set the FIREBASE_SERVICE_ACCOUNT environment variable');
        console.error('  2. The value should be the entire JSON content (as a string)');
        console.error('  3. Example in docker-compose.yml:');
        console.error('     environment:');
        console.error('       FIREBASE_SERVICE_ACCOUNT: \'{"type":"service_account",...}\'');
        console.error('  4. Or use secrets management (recommended)\n');
      }
      
      if (isCI) {
        console.error('For CI/CD (GitHub Actions, GitLab CI, etc.):');
        console.error('  1. Add FIREBASE_SERVICE_ACCOUNT to your repository secrets');
        console.error('  2. Pass it as an environment variable in your workflow');
        console.error('  3. Example for GitHub Actions:');
        console.error('     env:');
        console.error('       FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}\n');
      }
      break;

    case FIREBASE_ERROR_TYPES.CORRUPTED_JSON:
      console.error('\n📋 ISSUE: Firebase credentials contain invalid JSON\n');
      console.error(`SOURCE: ${errorDetails.source}`);
      console.error(`ERROR: ${errorDetails.parseError}\n`);
      console.error('🔧 HOW TO FIX:');
      console.error('  1. Verify the JSON is properly formatted');
      console.error('  2. Check for missing quotes, commas, or brackets');
      console.error('  3. Validate using: https://jsonlint.com/');
      console.error('  4. Common issue: Escaped quotes in environment variables');
      console.error('     - Correct: FIREBASE_SERVICE_ACCOUNT=\'{"type":"service_account"}\'');
      console.error('     - Wrong: FIREBASE_SERVICE_ACCOUNT={"type":"service_account"}\n');
      break;

    case FIREBASE_ERROR_TYPES.INVALID_STRUCTURE:
      console.error('\n📋 ISSUE: Firebase credentials are missing required fields\n');
      console.error(`SOURCE: ${errorDetails.source}`);
      console.error(`MISSING FIELDS: ${errorDetails.missing.join(', ')}\n`);
      console.error('🔧 HOW TO FIX:');
      console.error('  1. Re-download a fresh service account key from Firebase Console');
      console.error('  2. Ensure you\'re using the correct file (Admin SDK type)');
      console.error('  3. Don\'t manually edit the service account JSON');
      console.error('  4. Verify the entire file was copied (not truncated)\n');
      break;

    case FIREBASE_ERROR_TYPES.INIT_FAILED:
      console.error('\n📋 ISSUE: Firebase Admin SDK initialization failed\n');
      console.error(`ERROR: ${errorDetails.message}\n`);
      console.error('🔧 HOW TO FIX:');
      console.error('  1. Verify the service account has Firebase Admin privileges');
      console.error('  2. Check that the project_id matches your Firebase project');
      console.error('  3. Ensure the private_key is not corrupted or truncated');
      console.error('  4. Verify network connectivity to Firebase services');
      console.error('  5. Check Firebase service status: https://status.firebase.google.com/\n');
      break;
  }

  console.error('='.repeat(80));
  console.error('For more help, visit: https://firebase.google.com/docs/admin/setup');
  console.error('='.repeat(80) + '\n');
}

// Initialize Firebase with robust error handling
let db = null;
let firebaseInitialized = false;

if (!admin.apps.length) {
  const { serviceAccount, errorType, errorDetails } = loadServiceAccount();

  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: process.env.FIREBASE_DATABASE_URL // Optional for Firestore
      });
      
      db = admin.firestore();
      firebaseInitialized = true;
      
      console.log('✓ Firebase Admin SDK initialized successfully');
      console.log(`✓ Project ID: ${serviceAccount.project_id}`);
      console.log(`✓ Client Email: ${serviceAccount.client_email}\n`);
    } catch (initError) {
      reportFirebaseError(FIREBASE_ERROR_TYPES.INIT_FAILED, {
        message: initError.message,
        code: initError.code
      });
      
      // Exit in production to prevent running with degraded functionality
      if (process.env.NODE_ENV === 'production') {
        console.error('🛑 Exiting process (production mode requires Firebase)');
        process.exit(1);
      } else {
        console.warn('⚠️  Server will start in DEGRADED mode (development only)');
        console.warn('⚠️  Firebase-dependent features will not work\n');
      }
    }
  } else {
    reportFirebaseError(errorType, errorDetails);
    
    // Exit in production, allow degraded mode in development
    if (process.env.NODE_ENV === 'production') {
      console.error('🛑 Exiting process (production mode requires Firebase)');
      process.exit(1);
    } else {
      console.warn('⚠️  Server will start in DEGRADED mode (development only)');
      console.warn('⚠️  Firebase-dependent features will not work\n');
    }
  }
} else {
  db = admin.firestore();
  firebaseInitialized = true;
  console.log('✓ Firebase Admin SDK already initialized');
}

// Helper to check if Firebase is available
function isFirebaseAvailable() {
  return firebaseInitialized;
}

module.exports = { 
  db, 
  admin, 
  isFirebaseAvailable 
};
