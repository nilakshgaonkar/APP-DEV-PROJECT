import firestore from '@react-native-firebase/firestore';

const STORAGE_COLLECTION = 'pokemonStorage';
const TRAINERS_COLLECTION = 'trainers';

/**
 * Save caught Pokemon to storage
 * @param {string} userId - User ID
 * @param {Object} pokemon - Pokemon data
 * @returns {Promise<void>}
 */
export const saveCaughtPokemon = async (userId, pokemon) => {
  try {
    const storageRef = firestore()
      .collection(STORAGE_COLLECTION)
      .doc(userId)
      .collection('caught');

    const caughtPokemon = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprites?.front_default || '',
      types: pokemon.types?.map(t => t.type.name) || [],
      caughtAt: firestore.FieldValue.serverTimestamp(),
    };

    await storageRef.add(caughtPokemon);
    console.log('Pokemon saved to storage:', pokemon.name);

    // Update trainer profile pokemon caught count
    try {
      const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);
      await trainerRef.update({
        pokemonCaught: firestore.FieldValue.increment(1),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Trainer profile updated with new catch count');
    } catch (profileError) {
      console.warn('Could not update trainer profile:', profileError);
      // Don't throw error, storage save was successful
    }
  } catch (error) {
    console.error('Error saving caught Pokemon:', error);
    throw new Error('Failed to save Pokemon to storage');
  }
};

/**
 * Get all caught Pokemon for a user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of caught Pokemon
 */
export const getCaughtPokemon = async (userId) => {
  try {
    const storageRef = firestore()
      .collection(STORAGE_COLLECTION)
      .doc(userId)
      .collection('caught')
      .orderBy('caughtAt', 'desc');

    const snapshot = await storageRef.get();
    
    if (snapshot.empty) {
      return [];
    }

    return snapshot.docs.map(doc => ({
      caughtId: doc.id,
      ...doc.data(),
    }));
  } catch (error) {
    console.error('Error getting caught Pokemon:', error);
    return [];
  }
};

/**
 * Remove a caught Pokemon from storage
 * @param {string} userId - User ID
 * @param {string} caughtId - Document ID of caught Pokemon
 * @returns {Promise<void>}
 */
export const removeCaughtPokemon = async (userId, caughtId) => {
  try {
    await firestore()
      .collection(STORAGE_COLLECTION)
      .doc(userId)
      .collection('caught')
      .doc(caughtId)
      .delete();
    
    console.log('Pokemon released from storage');

    // Update trainer profile pokemon caught count
    try {
      const trainerRef = firestore().collection(TRAINERS_COLLECTION).doc(userId);
      await trainerRef.update({
        pokemonCaught: firestore.FieldValue.increment(-1),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      });
      console.log('Trainer profile updated after release');
    } catch (profileError) {
      console.warn('Could not update trainer profile:', profileError);
      // Don't throw error, removal was successful
    }
  } catch (error) {
    console.error('Error removing caught Pokemon:', error);
    throw new Error('Failed to release Pokemon');
  }
};

/**
 * Get storage statistics
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Storage stats
 */
export const getStorageStats = async (userId) => {
  try {
    const pokemon = await getCaughtPokemon(userId);
    const uniqueIds = new Set(pokemon.map(p => p.id));

    return {
      total: pokemon.length,
      unique: uniqueIds.size,
      pokemon,
    };
  } catch (error) {
    console.error('Error getting storage stats:', error);
    return {total: 0, unique: 0, pokemon: []};
  }
};

/**
 * Check if a specific Pokemon is in storage
 * @param {string} userId - User ID
 * @param {number} pokemonId - Pokemon ID
 * @returns {Promise<boolean>}
 */
export const isPokemonInStorage = async (userId, pokemonId) => {
  try {
    const storageRef = firestore()
      .collection(STORAGE_COLLECTION)
      .doc(userId)
      .collection('caught')
      .where('id', '==', pokemonId)
      .limit(1);

    const snapshot = await storageRef.get();
    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking Pokemon in storage:', error);
    return false;
  }
};

/**
 * Get count of a specific Pokemon in storage
 * @param {string} userId - User ID
 * @param {number} pokemonId - Pokemon ID
 * @returns {Promise<number>}
 */
export const getPokemonCount = async (userId, pokemonId) => {
  try {
    const storageRef = firestore()
      .collection(STORAGE_COLLECTION)
      .doc(userId)
      .collection('caught')
      .where('id', '==', pokemonId);

    const snapshot = await storageRef.get();
    return snapshot.size;
  } catch (error) {
    console.error('Error getting Pokemon count:', error);
    return 0;
  }
};
