import firestore from '@react-native-firebase/firestore';

const TRAINERS_COLLECTION = 'trainers';

/**
 * Create trainer profile
 * @param {string} userId - User ID
 * @param {Object} trainerData - Trainer data (trainerName, avatar, region)
 * @returns {Promise<Object>} Created trainer profile
 */
export const createTrainerProfile = async (userId, trainerData) => {
  try {
    console.log('Creating trainer profile for userId:', userId);
    console.log('Trainer data:', trainerData);
    
    const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);

    const profile = {
      ...trainerData,
      badges: [],
      pokemonCaught: 0,
      favoritePokemon: [],
      createdAt: firestore.FieldValue.serverTimestamp(),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    };

    console.log('Attempting to write profile to Firestore...');
    await trainerRef.set(profile);
    console.log('Trainer profile created successfully');
    return profile;
  } catch (error) {
    console.error('Error creating trainer profile:', error);
    console.error('Error code:', error.code);
    console.error('Error message:', error.message);
    
    // Provide more specific error messages
    if (error.code === 'permission-denied') {
      throw new Error('Permission denied. Please check Firestore security rules.');
    } else if (error.code === 'unavailable') {
      throw new Error('Network error. Please check your internet connection.');
    } else {
      throw new Error(`Failed to create trainer profile: ${error.message}`);
    }
  }
};

/**
 * Get trainer profile
 * @param {string} userId - User ID
 * @returns {Promise<Object|null>} Trainer profile or null if not found
 */
export const getTrainerProfile = async (userId) => {
  try {
    const trainerDoc = await firestore()
      .collection(TRAINERS_COLLECTION)
      .doc(userId)
      .get();

    if (trainerDoc.exists) {
      return {id: trainerDoc.id, ...trainerDoc.data()};
    }
    return null;
  } catch (error) {
    console.error('Error getting trainer profile:', error);
    return null;
  }
};

/**
 * Update trainer profile
 * @param {string} userId - User ID
 * @param {Object} updates - Fields to update
 * @returns {Promise<void>}
 */
export const updateTrainerProfile = async (userId, updates) => {
  try {
    const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);
    await trainerRef.update({
      ...updates,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating trainer profile:', error);
    throw new Error('Failed to update trainer profile. Please try again.');
  }
};

/**
 * Check if trainer profile exists
 * @param {string} userId - User ID
 * @returns {Promise<boolean>} True if profile exists
 */
export const trainerProfileExists = async (userId) => {
  try {
    const trainerDoc = await firestore()
      .collection(TRAINERS_COLLECTION)
      .doc(userId)
      .get();
    return trainerDoc.exists;
  } catch (error) {
    console.error('Error checking trainer profile:', error);
    return false;
  }
};

/**
 * Add badge to trainer profile
 * @param {string} userId - User ID
 * @param {string} badgeName - Badge name
 * @returns {Promise<void>}
 */
export const addBadge = async (userId, badgeName) => {
  try {
    const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);
    await trainerRef.update({
      badges: firestore.FieldValue.arrayUnion(badgeName),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error adding badge:', error);
    throw new Error('Failed to add badge. Please try again.');
  }
};

/**
 * Increment pokemon caught count
 * @param {string} userId - User ID
 * @returns {Promise<void>}
 */
export const incrementPokemonCaught = async (userId) => {
  try {
    const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);
    await trainerRef.update({
      pokemonCaught: firestore.FieldValue.increment(1),
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
  } catch (error) {
    console.error('Error incrementing pokemon caught:', error);
    throw new Error('Failed to update pokemon count. Please try again.');
  }
};
