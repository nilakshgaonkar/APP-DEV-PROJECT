import axios from 'axios';

const BASE_URL = 'https://pokeapi.co/api/v2';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Get Pokemon by name or ID
 * @param {string|number} term - Pokemon name or ID
 * @returns {Promise<Object>} Promise that resolves to Pokemon JSON data
 */
export const getPokemonByNameOrId = async (term) => {
  try {
    const response = await api.get(`/pokemon/${term}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        const customError = new Error('Pokemon not found');
        customError.is404 = true;
        throw customError;
      }
      const customError = new Error(`Failed to fetch Pokemon: ${error.response.statusText}`);
      customError.is404 = false;
      throw customError;
    } else if (error.request) {
      const customError = new Error('Check your internet connection');
      customError.isNetworkError = true;
      throw customError;
    } else {
      const customError = new Error(`Error: ${error.message}`);
      customError.isNetworkError = false;
      throw customError;
    }
  }
};

/**
 * Get Pokemon species information by ID or name
 * @param {string|number} idOrName - Pokemon species ID or name
 * @returns {Promise<Object>} Promise that resolves to Pokemon species JSON data
 */
export const getPokemonSpecies = async (idOrName) => {
  try {
    const response = await api.get(`/pokemon-species/${idOrName}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Pokemon species not found. Please check the ID or name and try again.');
      }
      throw new Error(`Failed to fetch Pokemon species: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};

/**
 * Get evolution chain data from the provided URL
 * @param {string} url - Full URL to the evolution chain endpoint
 * @returns {Promise<Object>} Promise that resolves to evolution chain JSON data
 */
export const getEvolutionChain = async (url) => {
  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Evolution chain not found.');
      }
      throw new Error(`Failed to fetch evolution chain: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};

/**
 * Get move details by name or ID
 * @param {string|number} idOrName - Move ID or name
 * @returns {Promise<Object>} Promise that resolves to move JSON data
 */
export const getMoveDetails = async (idOrName) => {
  try {
    const response = await api.get(`/move/${idOrName}`);
    return response.data;
  } catch (error) {
    if (error.response) {
      if (error.response.status === 404) {
        throw new Error('Move not found.');
      }
      throw new Error(`Failed to fetch move details: ${error.response.statusText}`);
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection.');
    } else {
      throw new Error(`Error: ${error.message}`);
    }
  }
};

export default api;
