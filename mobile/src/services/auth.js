import { 
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  signInWithCustomToken
} from 'firebase/auth';
import { auth } from './firebaseConfig';
import api from './api';

/**
 * Sign up with email and password
 * @param {string} email
 * @param {string} password  
 * @param {string} name
 * @param {string} role - 'designer' or 'customer'
 * @returns {Promise<{user, token}>}
 */
export const signUpWithEmail = async (email, password, name, role = 'customer') => {
  try {
    // Register user on the backend first
    // This creates the user in Firebase Auth and Firestore
    const response = await api.post('/api/v1/auth/register', {
      email,
      password,
      name,
      role
    });

    const { token, uid } = response.data;

    // Sign in with the custom token returned from backend
    const userCredential = await signInWithCustomToken(auth, token);
    
    return {
      user: userCredential.user,
      token: await userCredential.user.getIdToken()
    };
  } catch (error) {
    throw processAuthError(error);
  }
};

/**
 * Sign in with email and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{user, token}>}
 */
export const signInWithEmail = async (email, password) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const token = await userCredential.user.getIdToken();
    
    return {
      user: userCredential.user,
      token
    };
  } catch (error) {
    throw processAuthError(error);
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw processAuthError(error);
  }
};

/**
 * Get the current user's ID token
 * @param {boolean} forceRefresh - Force refresh the token
 * @returns {Promise<string|null>}
 */
export const getIdToken = async (forceRefresh = false) => {
  try {
    const user = auth.currentUser;
    if (user) {
      return await user.getIdToken(forceRefresh);
    }
    return null;
  } catch (error) {
    console.error('Error getting ID token:', error);
    return null;
  }
};

/**
 * Listen to authentication state changes
 * @param {function} callback - Callback function to handle auth state changes
 * @returns {function} - Unsubscribe function
 */
export const onAuthStateChanged = (callback) => {
  return firebaseOnAuthStateChanged(auth, callback);
};

/**
 * Get the current authenticated user
 * @returns {User|null}
 */
export const getCurrentUser = () => {
  return auth.currentUser;
};

/**
 * Process Firebase auth errors into user-friendly messages
 * @param {Error} error
 * @returns {Error}
 */
const processAuthError = (error) => {
  let message = 'An error occurred during authentication';

  // Firebase Auth errors
  if (error.code) {
    switch (error.code) {
      case 'auth/email-already-in-use':
        message = 'This email is already registered';
        break;
      case 'auth/invalid-email':
        message = 'Please enter a valid email address';
        break;
      case 'auth/operation-not-allowed':
        message = 'Email/password authentication is not enabled';
        break;
      case 'auth/weak-password':
        message = 'Password should be at least 6 characters';
        break;
      case 'auth/user-disabled':
        message = 'This account has been disabled';
        break;
      case 'auth/user-not-found':
        message = 'No account found with this email';
        break;
      case 'auth/wrong-password':
        message = 'Incorrect password';
        break;
      case 'auth/invalid-credential':
        message = 'Invalid email or password';
        break;
      case 'auth/too-many-requests':
        message = 'Too many failed attempts. Please try again later';
        break;
      case 'auth/network-request-failed':
        message = 'Network error. Please check your connection';
        break;
      default:
        message = error.message || message;
    }
  } else if (error.response && error.response.data && error.response.data.message) {
    // Backend API errors
    message = error.response.data.message;
  } else if (error.message) {
    message = error.message;
  }

  const processedError = new Error(message);
  processedError.code = error.code;
  return processedError;
};
