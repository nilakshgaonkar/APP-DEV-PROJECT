import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import auth from '@react-native-firebase/auth';

const USERS_COLLECTION = 'users';

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {Object} profileData - Profile data (name, email, photoURL, etc.)
 * @returns {Promise<Object>} Created/updated profile
 */
export const createOrUpdateProfile = async (userId, profileData) => {
  try {
    const userRef = firestore().collection(USERS_COLLECTION).doc(userId);
    const userDoc = await userRef.get();

    const profile = {
      ...profileData,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    if (!userDoc.exists) {
      // Create new profile
      profile.createdAt = firestore.FieldValue.serverTimestamp();
      await userRef.set(profile);
    } else {
      // Update existing profile
      await userRef.update(profile);
    }

    return profile;
  } catch (error) {
    console.error('Error creating/updating profile:', error);
    throw new Error('Failed to save profile. Please try again.');
  }
};

/**
 * Get user profile
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} User profile or null if not found
 */
export const getUserProfile = async (userId) => {
  try {
    const userDoc = await firestore()
      .collection(USERS_COLLECTION)
      .doc(userId)
      .get();

    if (userDoc.exists) {
      return {id: userDoc.id, ...userDoc.data()};
    }
    return null;
  } catch (error) {
    console.error('Error getting profile from Firestore:', error);
    // Don't throw error, return null so we can fall back to auth user data
    return null;
  }
};

/**
 * Upload profile photo to Firebase Storage
 * @param {string} userId - User ID
 * @param {string} imageUri - Local image URI
 * @returns {Promise<string>} Download URL of uploaded image
 */
export const uploadProfilePhoto = async (userId, imageUri) => {
  try {
    const filename = `profile_${userId}_${Date.now()}.jpg`;
    const reference = storage().ref(`profile_photos/${filename}`);

    // Upload the file
    await reference.putFile(imageUri);

    // Get download URL
    const downloadURL = await reference.getDownloadURL();
    return downloadURL;
  } catch (error) {
    console.error('Error uploading profile photo:', error);
    throw new Error('Failed to upload photo. Please try again.');
  }
};

/**
 * Delete profile photo from Firebase Storage
 * @param {string} photoURL - Photo URL to delete
 */
export const deleteProfilePhoto = async (photoURL) => {
  try {
    if (photoURL && photoURL.includes('firebasestorage.googleapis.com')) {
      const imageRef = storage().refFromURL(photoURL);
      await imageRef.delete();
    }
  } catch (error) {
    console.error('Error deleting profile photo:', error);
    // Don't throw error, just log it
  }
};

/**
 * Initialize user profile on first login/signup
 * @param {Object} user - Firebase auth user object
 * @param {string} username - Optional username to set
 * @returns {Promise<Object>} User profile
 */
export const initializeUserProfile = async (user, username = null) => {
  try {
    const existingProfile = await getUserProfile(user.uid);

    if (!existingProfile) {
      // Create new profile
      const profileData = {
        email: user.email,
        displayName: username || user.displayName || user.email?.split('@')[0] || 'User',
        username: username || null,
        photoURL: user.photoURL || null,
      };

      return await createOrUpdateProfile(user.uid, profileData);
    }

    return existingProfile;
  } catch (error) {
    console.error('Error initializing profile:', error);
    throw error;
  }
};

