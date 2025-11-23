const { admin, db } = require('../firebase');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const { sendSuccess } = require('../utils/responseHandler');
const { COLLECTIONS } = require('../config/constants');

const USERS_COLLECTION = COLLECTIONS.USERS || 'users';

/**
 * Register a new user
 * POST /api/v1/auth/register
 */
exports.register = catchAsync(async (req, res, next) => {
  const { email, password, name, role = 'customer' } = req.body;

  try {
    // Create user in Firebase Auth
    const userRecord = await admin.auth().createUser({
      email,
      password,
      displayName: name,
    });

    // Store user profile in Firestore
    const userProfile = {
      uid: userRecord.uid,
      email,
      name,
      role,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    };

    await db.collection(USERS_COLLECTION).doc(userRecord.uid).set(userProfile);

    // Generate custom token for immediate login
    const customToken = await admin.auth().createCustomToken(userRecord.uid);

    sendSuccess(
      res,
      {
        uid: userRecord.uid,
        email,
        name,
        role,
        token: customToken,
      },
      'User registered successfully',
      201
    );
  } catch (error) {
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-exists') {
      return next(new AppError('Email already in use', 400));
    }
    if (error.code === 'auth/invalid-email') {
      return next(new AppError('Invalid email address', 400));
    }
    if (error.code === 'auth/weak-password') {
      return next(new AppError('Password is too weak', 400));
    }
    
    // Generic error
    return next(new AppError('Failed to register user: ' + error.message, 500));
  }
});

/**
 * Get current authenticated user's profile
 * GET /api/v1/auth/me
 */
exports.getCurrentUser = catchAsync(async (req, res, next) => {
  // req.user is set by the authenticate middleware
  const uid = req.user.uid;

  const userDoc = await db.collection(USERS_COLLECTION).doc(uid).get();

  if (!userDoc.exists) {
    return next(new AppError('User profile not found', 404));
  }

  const userData = userDoc.data();

  sendSuccess(res, {
    uid: userDoc.id,
    ...userData,
    createdAt: userData.createdAt?.toDate().toISOString(),
    updatedAt: userData.updatedAt?.toDate().toISOString(),
  });
});

/**
 * Verify Firebase ID token (mainly for debugging/testing)
 * POST /api/v1/auth/verify
 */
exports.verifyToken = catchAsync(async (req, res, next) => {
  const { token } = req.body;

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    sendSuccess(res, {
      uid: decodedToken.uid,
      email: decodedToken.email,
      isValid: true,
    }, 'Token is valid');
  } catch (error) {
    return next(new AppError('Invalid or expired token', 401));
  }
});

/**
 * Refresh token endpoint
 * POST /api/v1/auth/refresh
 * 
 * Note: Token refresh is typically handled client-side with Firebase SDK
 * This endpoint creates a new custom token if needed
 */
exports.refreshToken = catchAsync(async (req, res, next) => {
  const uid = req.user.uid;

  try {
    const customToken = await admin.auth().createCustomToken(uid);
    
    sendSuccess(res, {
      token: customToken,
    }, 'Token refreshed successfully');
  } catch (error) {
    return next(new AppError('Failed to refresh token', 500));
  }
});
