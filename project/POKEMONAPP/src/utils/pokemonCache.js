import AsyncStorage from '@react-native-async-storage/async-storage';

const CACHE_KEY_PREFIX = 'POKEMON_SEARCH_CACHE_';
const MAX_CACHE_SIZE = 10;

/**
 * Get cache key for a specific user
 * @param {string} userId - User ID
 * @returns {string} Cache key
 */
const getCacheKey = (userId) => {
  if (!userId) {
    throw new Error('User ID is required for cache operations');
  }
  return `${CACHE_KEY_PREFIX}${userId}`;
};

/**
 * Save a Pokemon to the search cache for a specific user
 * @param {string} userId - User ID
 * @param {Object} pokemon - Pokemon object to cache
 */
export const savePokemonToCache = async (userId, pokemon) => {
  try {
    if (!userId) {
      console.warn('Cannot save to cache: User ID is missing');
      return;
    }

    const cacheKey = getCacheKey(userId);
    const cached = await AsyncStorage.getItem(cacheKey);
    let cache = [];

    if (cached) {
      cache = JSON.parse(cached);
    }

    // Remove if already exists (to move to front)
    cache = cache.filter((item) => item.id !== pokemon.id);

    // Add to front
    const pokemonData = {
      id: pokemon.id,
      name: pokemon.name,
      sprite: pokemon.sprites?.front_default || '',
    };
    cache.unshift(pokemonData);

    // Keep only last 10
    if (cache.length > MAX_CACHE_SIZE) {
      cache = cache.slice(0, MAX_CACHE_SIZE);
    }

    await AsyncStorage.setItem(cacheKey, JSON.stringify(cache));
  } catch (error) {
    console.error('Error saving Pokemon to cache:', error);
  }
};

/**
 * Get cached Pokemon searches for a specific user
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Array of cached Pokemon
 */
export const getCachedPokemon = async (userId) => {
  try {
    if (!userId) {
      return [];
    }

    const cacheKey = getCacheKey(userId);
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached);
    }
    return [];
  } catch (error) {
    console.error('Error getting cached Pokemon:', error);
    return [];
  }
};

/**
 * Clear the Pokemon cache for a specific user
 * @param {string} userId - User ID
 */
export const clearPokemonCache = async (userId) => {
  try {
    if (!userId) {
      return;
    }
    const cacheKey = getCacheKey(userId);
    await AsyncStorage.removeItem(cacheKey);
  } catch (error) {
    console.error('Error clearing Pokemon cache:', error);
  }
};

/**
 * Clear all Pokemon caches (useful for cleanup)
 */
export const clearAllPokemonCaches = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(CACHE_KEY_PREFIX));
    await AsyncStorage.multiRemove(cacheKeys);
  } catch (error) {
    console.error('Error clearing all Pokemon caches:', error);
  }
};

