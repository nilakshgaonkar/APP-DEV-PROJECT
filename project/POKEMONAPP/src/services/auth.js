import auth from '@react-native-firebase/auth';
import {initializeUserProfile} from './profileService';

/**
 * Sign up a new user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} username - User username (optional)
 * @returns {Promise<UserCredential>} Promise that resolves to user credential
 */
export const signUp = async (email, password, username = null) => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    // Create user profile (best effort, don't block signup)
    try {
      await initializeUserProfile(userCredential.user, username);
    } catch (profileError) {
      console.warn('Profile initialization failed on sign up:', profileError);
    }
    return userCredential;
  } catch (error) {
    console.error('signUp error', error);
    let errorMessage = 'An error occurred during sign up.';
    
    if (error.code === 'auth/email-already-in-use') {
      errorMessage = 'This email is already registered.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/weak-password') {
      errorMessage = 'Password should be at least 6 characters.';
    } else if (error.code === 'auth/operation-not-allowed') {
      errorMessage = 'Email/password accounts are not enabled.';
    } else if (error.message) {
      // Remove the error code prefix from the message if present
      errorMessage = error.message.replace(/\[auth\/[^\]]+\]\s*/g, '');
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Sign in an existing user with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<UserCredential>} Promise that resolves to user credential
 */
export const signIn = async (email, password) => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    // Initialize profile if doesn't exist (best effort)
    try {
      await initializeUserProfile(userCredential.user);
    } catch (profileError) {
      console.warn('Profile initialization failed on sign in:', profileError);
    }
    return userCredential;
  } catch (error) {
    console.error('signIn error', error);
    let errorMessage = 'An error occurred during sign in.';
    
    if (error.code === 'auth/invalid-credential') {
      errorMessage = 'Invalid email or password. Please check your credentials and try again.';
    } else if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/wrong-password') {
      errorMessage = 'Incorrect password.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    } else if (error.code === 'auth/user-disabled') {
      errorMessage = 'This account has been disabled.';
    } else if (error.code === 'auth/too-many-requests') {
      errorMessage = 'Too many failed attempts. Please try again later.';
    } else if (error.message) {
      // Remove the error code prefix from the message if present
      errorMessage = error.message.replace(/\[auth\/[^\]]+\]\s*/g, '');
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Sign out the current user
 * @returns {Promise<void>}
 */
export const signOut = async () => {
  try {
    await auth().signOut();
  } catch (error) {
    throw new Error('Failed to sign out. Please try again.');
  }
};

/**
 * Send password reset email
 * @param {string} email - User email
 * @returns {Promise<void>}
 */
export const sendPasswordReset = async (email) => {
  try {
    await auth().sendPasswordResetEmail(email);
  } catch (error) {
    let errorMessage = 'Failed to send password reset email.';
    
    if (error.code === 'auth/user-not-found') {
      errorMessage = 'No account found with this email.';
    } else if (error.code === 'auth/invalid-email') {
      errorMessage = 'Invalid email address.';
    }
    
    throw new Error(errorMessage);
  }
};

