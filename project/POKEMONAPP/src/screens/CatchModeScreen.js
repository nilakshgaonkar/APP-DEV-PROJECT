import React, {useState, useEffect, useRef} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Image,
  ActivityIndicator,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {getPokemonByNameOrId} from '../services/api';
import {saveCaughtPokemon} from '../services/storageService';
import {trackCatch} from '../services/badgeService';
import BadgeNotification from '../components/BadgeNotification';

const CatchModeScreen = ({navigation}) => {
  const [pokemon, setPokemon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [catching, setCatching] = useState(false);
  const [caught, setCaught] = useState(false);
  const [showSilhouette, setShowSilhouette] = useState(true);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  // Animations
  const silhouetteOpacity = useRef(new Animated.Value(1)).current;
  const pokemonOpacity = useRef(new Animated.Value(0)).current;
  const pokeballScale = useRef(new Animated.Value(1)).current;
  const pokeballY = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadRandomPokemon();
  }, []);

  const loadRandomPokemon = async () => {
    try {
      setLoading(true);
      setCaught(false);
      setShowSilhouette(true);
      
      // Reset animations
      silhouetteOpacity.setValue(1);
      pokemonOpacity.setValue(0);
      pokeballScale.setValue(1);
      pokeballY.setValue(0);
      successScale.setValue(0);

      const randomId = Math.floor(Math.random() * 1010) + 1;
      const pokemonData = await getPokemonByNameOrId(randomId.toString());
      setPokemon(pokemonData);
    } catch (error) {
      console.error('Error loading Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleThrowPokeball = async () => {
    if (catching || caught) return;

    setCatching(true);

    // Pokeball throw animation
    Animated.sequence([
      // Shake and scale up
      Animated.parallel([
        Animated.timing(pokeballScale, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(pokeballY, {
          toValue: -20,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      // Throw up
      Animated.timing(pokeballY, {
        toValue: -300,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Catch animation
      setTimeout(() => {
        // Hide silhouette, show Pokemon
        Animated.parallel([
          Animated.timing(silhouetteOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(pokemonOpacity, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setShowSilhouette(false);
          setCaught(true);
          setCatching(false);

          // Success animation
          Animated.spring(successScale, {
            toValue: 1,
            tension: 50,
            friction: 7,
            useNativeDriver: true,
          }).start();

          // Save caught Pokemon
          savePokemonToStorage();
        });
      }, 300);
    });
  };

  const savePokemonToStorage = async () => {
    try {
      const user = auth().currentUser;
      if (!user || !pokemon) return;

      await saveCaughtPokemon(user.uid, pokemon);

      // Track catch for badges
      const newBadges = await trackCatch(user.uid);
      if (newBadges.length > 0) {
        setEarnedBadge(newBadges[0]);
        setShowBadgeModal(true);
      }
    } catch (error) {
      console.error('Error saving caught Pokemon:', error);
    }
  };

  const handleTryAgain = () => {
    loadRandomPokemon();
  };

  const handleViewStorage = () => {
    navigation.navigate('PokemonStorage');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Finding a wild Pokémon...</Text>
      </View>
    );
  }

  return (
    <>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Wild Pokémon Appeared!</Text>
          {!caught && !catching && (
            <Text style={styles.subtitle}>Who's that Pokémon?</Text>
          )}
        </View>

        {/* Pokemon Display Area */}
        <View style={styles.pokemonContainer}>
          {showSilhouette && (
            <Animated.View
              style={[
                styles.silhouetteContainer,
                {opacity: silhouetteOpacity},
              ]}>
              <Image
                source={{uri: pokemon?.sprites?.front_default}}
                style={styles.silhouette}
                resizeMode="contain"
              />
              <View style={styles.silhouetteOverlay} />
            </Animated.View>
          )}

          <Animated.View
            style={[styles.pokemonImageContainer, {opacity: pokemonOpacity}]}>
            <Image
              source={{uri: pokemon?.sprites?.front_default}}
              style={styles.pokemonImage}
              resizeMode="contain"
            />
          </Animated.View>
        </View>

        {/* Pokeball or Success Message */}
        <View style={styles.middleSection}>
          {!caught ? (
            <Animated.View
              style={[
                styles.pokeballContainer,
                {
                  transform: [
                    {scale: pokeballScale},
                    {translateY: pokeballY},
                  ],
                },
              ]}>
              <Text style={styles.pokeball}>⚾</Text>
            </Animated.View>
          ) : (
            <Animated.View
              style={[
                styles.successContainer,
                {transform: [{scale: successScale}]},
              ]}>
              <Text style={styles.successEmoji}>🎉</Text>
              <Text style={styles.successTitle}>
                Congratulations Trainer!
              </Text>
              <Text style={styles.successMessage}>
                You caught{' '}
                <Text style={styles.pokemonName}>
                  {pokemon?.name?.charAt(0).toUpperCase() +
                    pokemon?.name?.slice(1)}
                </Text>
                !
              </Text>
              <Text style={styles.successSubtext}>
                #{String(pokemon?.id).padStart(3, '0')}
              </Text>
            </Animated.View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          {!caught ? (
            <>
              <TouchableOpacity
                style={[
                  styles.button,
                  styles.throwButton,
                  catching && styles.buttonDisabled,
                ]}
                onPress={handleThrowPokeball}
                disabled={catching}>
                {catching ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={styles.buttonEmoji}>🎯</Text>
                    <Text style={styles.buttonText}>Throw Poké Ball</Text>
                  </>
                )}
              </TouchableOpacity>
              {!catching && (
                <Text style={styles.hintText}>
                  Tap to catch this Pokémon!
                </Text>
              )}
            </>
          ) : (
            <>
              <TouchableOpacity
                style={[styles.button, styles.tryAgainButton]}
                onPress={handleTryAgain}>
                <Text style={styles.buttonEmoji}>🔄</Text>
                <Text style={styles.buttonText}>Catch Another</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.storageButton]}
                onPress={handleViewStorage}>
                <Text style={styles.buttonEmoji}>📦</Text>
                <Text style={styles.buttonText}>View Storage</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.detailsButton]}
                onPress={() => navigation.navigate('Details', {pokemon})}>
                <Text style={styles.buttonEmoji}>ℹ️</Text>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <BadgeNotification
        badge={earnedBadge}
        visible={showBadgeModal}
        onClose={() => setShowBadgeModal(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e8f5e9',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e8f5e9',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 10,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#2e7d32',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1b5e20',
    marginTop: 8,
  },
  pokemonContainer: {
    height: 280,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  silhouetteContainer: {
    position: 'absolute',
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  silhouette: {
    width: 220,
    height: 220,
  },
  silhouetteOverlay: {
    position: 'absolute',
    width: 220,
    height: 220,
    backgroundColor: '#000',
    opacity: 0.8,
    borderRadius: 110,
  },
  pokemonImageContainer: {
    width: 220,
    height: 220,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pokemonImage: {
    width: 220,
    height: 220,
  },
  middleSection: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  pokeballContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokeball: {
    fontSize: 70,
  },
  successContainer: {
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginHorizontal: 20,
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  successEmoji: {
    fontSize: 50,
    marginBottom: 8,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 8,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  pokemonName: {
    fontWeight: 'bold',
    color: '#2e7d32',
    textTransform: 'capitalize',
  },
  successSubtext: {
    fontSize: 14,
    color: '#666',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  throwButton: {
    backgroundColor: '#f4511e',
  },
  tryAgainButton: {
    backgroundColor: '#4caf50',
  },
  storageButton: {
    backgroundColor: '#1976d2',
  },
  detailsButton: {
    backgroundColor: '#9c27b0',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonEmoji: {
    fontSize: 22,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },
  hintText: {
    fontSize: 13,
    color: '#666',
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 8,
  },
});

export default CatchModeScreen;
