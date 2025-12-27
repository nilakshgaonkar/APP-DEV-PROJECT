import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {getPokemonByNameOrId} from '../services/api';
import {savePokemonToCache, getCachedPokemon} from '../utils/pokemonCache';
import {
  findSimilarPokemon,
  COMMON_POKEMON_NAMES,
} from '../utils/pokemonSuggestions';
import {trackSearch} from '../services/badgeService';
import BadgeNotification from '../components/BadgeNotification';

const HomeScreen = ({navigation}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [errorType, setErrorType] = useState(null); // '404' or 'network'
  const [cachedPokemon, setCachedPokemon] = useState([]);
  const [loadingCache, setLoadingCache] = useState(true);
  const [userId, setUserId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    const currentUser = auth().currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
      loadCachedPokemon(currentUser.uid);
    }
  }, []);

  // Reload cache when screen comes into focus (in case user switched accounts)
  useFocusEffect(
    React.useCallback(() => {
      const currentUser = auth().currentUser;
      if (currentUser && currentUser.uid !== userId) {
        setUserId(currentUser.uid);
        loadCachedPokemon(currentUser.uid);
      } else if (currentUser) {
        loadCachedPokemon(currentUser.uid);
      }
    }, [userId]),
  );

  const loadCachedPokemon = async (userUid) => {
    try {
      setLoadingCache(true);
      if (!userUid) {
        setCachedPokemon([]);
        return;
      }
      const cached = await getCachedPokemon(userUid);
      setCachedPokemon(cached);
    } catch (error) {
      console.error('Error loading cached Pokemon:', error);
      setCachedPokemon([]);
    } finally {
      setLoadingCache(false);
    }
  };

  const handleSearch = async (term = null) => {
    const searchValue = term || searchTerm.trim();
    if (!searchValue) {
      setError('Please enter a Pokemon name or ID');
      setErrorType(null);
      return;
    }

    setLoading(true);
    setError('');
    setErrorType(null);

    try {
      const pokemon = await getPokemonByNameOrId(searchValue);
      // Save to cache for current user
      const currentUser = auth().currentUser;
      if (currentUser) {
        await savePokemonToCache(currentUser.uid, pokemon);
        // Reload cache to show updated list
        await loadCachedPokemon(currentUser.uid);
        
        // Track search and check for badges
        const newBadges = await trackSearch(currentUser.uid);
        if (newBadges.length > 0) {
          setEarnedBadge(newBadges[0]);
          setShowBadgeModal(true);
        }
      }
      setLoading(false);
      navigation.navigate('Details', {pokemon});
    } catch (err) {
      setLoading(false);
      setError(err.message);
      if (err.is404) {
        setErrorType('404');
        // Try to find similar Pokemon names
        const similarNames = findSimilarPokemon(
          searchValue,
          COMMON_POKEMON_NAMES,
          5,
        );
        setSuggestions(similarNames);
      } else if (err.isNetworkError) {
        setErrorType('network');
        setSuggestions([]);
      } else {
        setErrorType(null);
        setSuggestions([]);
      }
    }
  };

  const handleRandomPokemon = async () => {
    const randomId = Math.floor(Math.random() * 1010) + 1;
    setSearchTerm(randomId.toString());
    await handleSearch(randomId.toString());
  };

  const handleCachedPokemonPress = async (pokemon) => {
    await handleSearch(pokemon.name);
  };

  return (
    <>
      <ScrollView
        contentContainerStyle={styles.scrollContainer}
        keyboardShouldPersistTaps="handled">
        <View style={styles.container}>
        <Text style={styles.title}>PokeSearch App</Text>
        <Text style={styles.subtitle}>Search for your favorite Pokemon</Text>

        <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Enter Pokemon name or ID"
              placeholderTextColor="#999"
              value={searchTerm}
              onChangeText={(text) => {
                setSearchTerm(text);
                setError('');
                setSuggestions([]);
              }}
              editable={!loading}
              autoCapitalize="none"
              autoCorrect={true}
              spellCheck={true}
            />
        </View>

        {/* Loading State */}
        {loading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#f4511e" />
            <Text style={styles.loadingText}>Searching for Pokemon...</Text>
          </View>
        )}

        {/* Error States */}
        {error && !loading && (
          <View style={styles.errorContainer}>
            {errorType === '404' ? (
              <>
                <Text style={styles.errorIcon}>🔍</Text>
                <Text style={styles.errorTitle}>Pokémon not found</Text>
                <Text style={styles.errorText}>
                  We couldn't find a Pokemon with that name or ID.
                  {suggestions.length > 0
                    ? ' Did you mean one of these?'
                    : ' Please try again with a different search term.'}
                </Text>
                {suggestions.length > 0 && (
                  <View style={styles.suggestionsErrorContainer}>
                    {suggestions.map((suggestion, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.suggestionButton}
                        onPress={() => handleSearch(suggestion)}
                        disabled={loading}>
                        <Text style={styles.suggestionButtonText}>
                          {suggestion}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </>
            ) : errorType === 'network' ? (
              <>
                <Text style={styles.errorIcon}>📡</Text>
                <Text style={styles.errorTitle}>Check your internet connection</Text>
                <Text style={styles.errorText}>
                  Unable to connect to the server. Please check your internet
                  connection and try again.
                </Text>
                <TouchableOpacity
                  style={styles.retryButton}
                  onPress={() => handleSearch()}
                  disabled={loading}>
                  <Text style={styles.retryButtonText}>Retry</Text>
                </TouchableOpacity>
              </>
            ) : (
              <Text style={styles.errorText}>{error}</Text>
            )}
          </View>
        )}

        {/* Buttons */}
        {!loading && (
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.searchButton]}
              onPress={() => handleSearch()}
              disabled={loading}>
              <Text style={styles.buttonText}>Search</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.randomButton]}
              onPress={handleRandomPokemon}
              disabled={loading}>
              <Text style={styles.buttonText}>Random Pokémon</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.favoritesButton]}
              onPress={() => navigation.navigate('Favorites')}
              disabled={loading}>
              <Text style={styles.buttonText}>Favorites</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Cached Pokemon Suggestions */}
        {!loading && cachedPokemon.length > 0 && (
          <View style={styles.suggestionsContainer}>
            <Text style={styles.suggestionsTitle}>Recent Searches</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.suggestionsList}>
              {cachedPokemon.map((pokemon, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionItem}
                  onPress={() => handleCachedPokemonPress(pokemon)}
                  disabled={loading}>
                  {pokemon.sprite ? (
                    <Image
                      source={{uri: pokemon.sprite}}
                      style={styles.suggestionSprite}
                      resizeMode="contain"
                    />
                  ) : (
                    <View style={styles.suggestionPlaceholder}>
                      <Text style={styles.suggestionPlaceholderText}>?</Text>
                    </View>
                  )}
                  <Text style={styles.suggestionName} numberOfLines={1}>
                    {pokemon.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}
      </View>
    </ScrollView>
    
    <BadgeNotification
      badge={earnedBadge}
      visible={showBadgeModal}
      onClose={() => setShowBadgeModal(false)}
    />
  </>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  inputContainer: {
    width: '100%',
    marginBottom: 20,
  },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  loadingContainer: {
    alignItems: 'center',
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  errorContainer: {
    width: '100%',
    backgroundColor: '#ffebee',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    alignItems: 'center',
  },
  errorIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
    textAlign: 'center',
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
  },
  retryButton: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    gap: 15,
  },
  button: {
    width: '100%',
    height: 50,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  searchButton: {
    backgroundColor: '#f4511e',
  },
  randomButton: {
    backgroundColor: '#4caf50',
  },
  favoritesButton: {
    backgroundColor: '#1976d2',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  suggestionsContainer: {
    width: '100%',
    marginTop: 30,
  },
  suggestionsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  suggestionsList: {
    paddingVertical: 10,
  },
  suggestionItem: {
    alignItems: 'center',
    marginRight: 15,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    minWidth: 100,
    maxWidth: 100,
  },
  suggestionSprite: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  suggestionPlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  suggestionPlaceholderText: {
    fontSize: 24,
    color: '#999',
  },
  suggestionName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  suggestionsErrorContainer: {
    width: '100%',
    marginTop: 12,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  suggestionButtonText: {
    color: '#f4511e',
    fontSize: 14,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
});

export default HomeScreen;
