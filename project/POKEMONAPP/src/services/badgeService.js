import firestore from '@react-native-firebase/firestore';
import {getTrainerProfile, updateTrainerProfile} from './trainerService';

const BADGES = {
  BOULDER: {
    id: 'boulder',
    name: 'Boulder Badge',
    emoji: '🪨',
    description: 'Search 10 Pokémon',
    requirement: 'searches',
    threshold: 10,
  },
  WATER: {
    id: 'water',
    name: 'Water Badge',
    emoji: '💧',
    description: 'Catch 5 random Pokémon',
    requirement: 'catches',
    threshold: 5,
  },
  THUNDER: {
    id: 'thunder',
    name: 'Thunder Badge',
    emoji: '⚡',
    description: 'Add 3 Pokémon to favorites',
    requirement: 'favorites',
    threshold: 3,
  },
  RAINBOW: {
    id: 'rainbow',
    name: 'Rainbow Badge',
    emoji: '🌈',
    description: 'Search 25 Pokémon',
    requirement: 'searches',
    threshold: 25,
  },
  SOUL: {
    id: 'soul',
    name: 'Soul Badge',
    emoji: '👻',
    description: 'Catch 10 random Pokémon',
    requirement: 'catches',
    threshold: 10,
  },
  MARSH: {
    id: 'marsh',
    name: 'Marsh Badge',
    emoji: '🌿',
    description: 'Add 10 Pokémon to favorites',
    requirement: 'favorites',
    threshold: 10,
  },
  VOLCANO: {
    id: 'volcano',
    name: 'Volcano Badge',
    emoji: '🔥',
    description: 'Search 50 Pokémon',
    requirement: 'searches',
    threshold: 50,
  },
  EARTH: {
    id: 'earth',
    name: 'Earth Badge',
    emoji: '🌍',
    description: 'Catch 25 random Pokémon',
    requirement: 'catches',
    threshold: 25,
  },
};

/**
 * Get all available badges
 */
export const getAllBadges = () => {
  return Object.values(BADGES);
};

/**
 * Get badge by ID
 */
export const getBadgeById = (badgeId) => {
  return Object.values(BADGES).find(badge => badge.id === badgeId);
};

/**
 * Check and award badges based on user stats
 * @param {string} userId - User ID
 * @param {Object} stats - User stats {searches, catches, favorites}
 * @returns {Promise<Array>} Array of newly earned badges
 */
export const checkAndAwardBadges = async (userId, stats) => {
  try {
    const profile = await getTrainerProfile(userId);
    if (!profile) return [];

    const currentBadges = profile.badges || [];
    const newBadges = [];

    // Check each badge
    for (const badge of Object.values(BADGES)) {
      // Skip if already earned
      if (currentBadges.includes(badge.id)) continue;

      // Check if requirement is met
      const statValue = stats[badge.requirement] || 0;
      if (statValue >= badge.threshold) {
        newBadges.push(badge);
      }
    }

    // Award new badges
    if (newBadges.length > 0) {
      const updatedBadges = [...currentBadges, ...newBadges.map(b => b.id)];
      await updateTrainerProfile(userId, {badges: updatedBadges});
    }

    return newBadges;
  } catch (error) {
    console.error('Error checking badges:', error);
    return [];
  }
};

/**
 * Track search action and check for badges
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Newly earned badges
 */
export const trackSearch = async (userId) => {
  try {
    const statsRef = firestore().collection('trainerStats').doc(userId);
    const statsDoc = await statsRef.get();

    let searches = 1;
    if (statsDoc.exists) {
      searches = (statsDoc.data().searches || 0) + 1;
      await statsRef.update({
        searches,
        lastSearchAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await statsRef.set({
        searches: 1,
        catches: 0,
        favorites: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastSearchAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    // Check for new badges
    const stats = statsDoc.exists ? statsDoc.data() : {searches: 1, catches: 0, favorites: 0};
    stats.searches = searches;
    return await checkAndAwardBadges(userId, stats);
  } catch (error) {
    console.error('Error tracking search:', error);
    return [];
  }
};

/**
 * Track catch action and check for badges
 * @param {string} userId - User ID
 * @returns {Promise<Array>} Newly earned badges
 */
export const trackCatch = async (userId) => {
  try {
    const statsRef = firestore().collection('trainerStats').doc(userId);
    const statsDoc = await statsRef.get();

    let catches = 1;
    if (statsDoc.exists) {
      catches = (statsDoc.data().catches || 0) + 1;
      await statsRef.update({
        catches,
        lastCatchAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await statsRef.set({
        searches: 0,
        catches: 1,
        favorites: 0,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastCatchAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    // Check for new badges
    const stats = statsDoc.exists ? statsDoc.data() : {searches: 0, catches: 1, favorites: 0};
    stats.catches = catches;
    return await checkAndAwardBadges(userId, stats);
  } catch (error) {
    console.error('Error tracking catch:', error);
    return [];
  }
};

/**
 * Track favorite action and check for badges
 * @param {string} userId - User ID
 * @param {number} totalFavorites - Total number of favorites
 * @returns {Promise<Array>} Newly earned badges
 */
export const trackFavorite = async (userId, totalFavorites) => {
  try {
    const statsRef = firestore().collection('trainerStats').doc(userId);
    const statsDoc = await statsRef.get();

    if (statsDoc.exists) {
      await statsRef.update({
        favorites: totalFavorites,
        lastFavoriteAt: firestore.FieldValue.serverTimestamp(),
      });
    } else {
      await statsRef.set({
        searches: 0,
        catches: 0,
        favorites: totalFavorites,
        createdAt: firestore.FieldValue.serverTimestamp(),
        lastFavoriteAt: firestore.FieldValue.serverTimestamp(),
      });
    }

    // Check for new badges
    const stats = statsDoc.exists ? statsDoc.data() : {searches: 0, catches: 0, favorites: totalFavorites};
    stats.favorites = totalFavorites;
    return await checkAndAwardBadges(userId, stats);
  } catch (error) {
    console.error('Error tracking favorite:', error);
    return [];
  }
};

/**
 * Get user stats
 * @param {string} userId - User ID
 * @returns {Promise<Object>} User stats
 */
export const getUserStats = async (userId) => {
  try {
    const statsDoc = await firestore()
      .collection('trainerStats')
      .doc(userId)
      .get();

    if (statsDoc.exists) {
      return statsDoc.data();
    }

    return {searches: 0, catches: 0, favorites: 0};
  } catch (error) {
    console.error('Error getting user stats:', error);
    return {searches: 0, catches: 0, favorites: 0};
  }
};

/**
 * Get badge progress for a specific badge
 * @param {Object} badge - Badge object
 * @param {Object} stats - User stats
 * @returns {Object} Progress info {current, required, percentage, earned}
 */
export const getBadgeProgress = (badge, stats) => {
  const current = stats[badge.requirement] || 0;
  const required = badge.threshold;
  const percentage = Math.min((current / required) * 100, 100);
  const earned = current >= required;

  return {
    current,
    required,
    percentage,
    earned,
  };
};
