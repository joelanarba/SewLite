const admin = require('firebase-admin');
const dotenv = require('dotenv');

dotenv.config();

// Initialize Firebase Admin SDK
// You need to download your service account key from Firebase Console
// and save it as 'serviceAccountKey.json' in the backend root or use env vars
// For this example, we'll assume env vars or a file path.

let serviceAccount;

try {
  // Try to load from a local file if it exists (for local dev)
  // Adjusted path: ../serviceAccountKey.json because this file is in src/
  serviceAccount = require('../serviceAccountKey.json');
} catch (error) {
  // If file doesn't exist, check if we have the JSON string in env (for production)
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    try {
      serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } catch (parseError) {
      console.error('ERROR: Failed to parse FIREBASE_SERVICE_ACCOUNT environment variable');
    }
  }
}

if (!admin.apps.length) {
  if (serviceAccount) {
    try {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        // databaseURL: process.env.FIREBASE_DATABASE_URL // Optional for Firestore
      });
      console.log('Firebase Admin initialized successfully');
    } catch (initError) {
      console.error('ERROR: Failed to initialize Firebase Admin:', initError.message);
      process.exit(1);
    }
  } else {
    console.error('ERROR: Firebase service account not found. Please check .env or serviceAccountKey.json');
    // Exit process to prevent further errors
    process.exit(1);
  }
}

const db = admin.firestore();

module.exports = { db, admin };
