import {useState, useEffect, useCallback} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

const FAVORITES_KEY = 'FAVORITES';

const useFavorites = () => {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load favorites from AsyncStorage on mount
  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      setLoading(true);
      const data = await AsyncStorage.getItem(FAVORITES_KEY);
      if (data !== null) {
        setFavorites(JSON.parse(data));
      } else {
        setFavorites([]);
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
      setFavorites([]);
    } finally {
      setLoading(false);
    }
  };

  const saveFavorites = async (newFavorites) => {
    try {
      await AsyncStorage.setItem(FAVORITES_KEY, JSON.stringify(newFavorites));
      setFavorites(newFavorites);
    } catch (error) {
      console.error('Error saving favorites:', error);
      throw error;
    }
  };

  const addFavorite = useCallback(async (pokemon) => {
    try {
      const favoriteItem = {
        id: pokemon.id,
        name: pokemon.name,
        sprite: pokemon.sprites?.front_default || '',
      };

      // Check if already favorite
      const isAlreadyFavorite = favorites.some(
        (fav) => fav.id === favoriteItem.id,
      );

      if (!isAlreadyFavorite) {
        const newFavorites = [...favorites, favoriteItem];
        await saveFavorites(newFavorites);
      }
    } catch (error) {
      console.error('Error adding favorite:', error);
      throw error;
    }
  }, [favorites]);

  const removeFavorite = useCallback(async (id) => {
    try {
      const newFavorites = favorites.filter((fav) => fav.id !== id);
      await saveFavorites(newFavorites);
    } catch (error) {
      console.error('Error removing favorite:', error);
      throw error;
    }
  }, [favorites]);

  const isFavorite = useCallback(
    (id) => {
      return favorites.some((fav) => fav.id === id);
    },
    [favorites],
  );

  return {
    favorites,
    loading,
    addFavorite,
    removeFavorite,
    isFavorite,
  };
};

export default useFavorites;

