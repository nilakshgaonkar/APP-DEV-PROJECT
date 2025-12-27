import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import {getPokemonByNameOrId} from '../services/api';
import {savePokemonToCache} from '../utils/pokemonCache';
import {saveCaughtPokemon} from '../services/storageService';
import {trackCatch} from '../services/badgeService';
import BadgeNotification from '../components/BadgeNotification';

const QuickCatchScreen = ({navigation}) => {
  const [pokemon, setPokemon] = useState(null);
  const [catching, setCatching] = useState(false);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  const handleQuickCatch = async () => {
    try {
      setCatching(true);
      setPokemon(null);

      const randomId = Math.floor(Math.random() * 1010) + 1;
      const pokemonData = await getPokemonByNameOrId(randomId.toString());
      setPokemon(pokemonData);

      // Save to cache and storage
      const user = auth().currentUser;
      if (user) {
        await savePokemonToCache(user.uid, pokemonData);
        await saveCaughtPokemon(user.uid, pokemonData);

        // Track catch and check for badges
        const newBadges = await trackCatch(user.uid);
        if (newBadges.length > 0) {
          setEarnedBadge(newBadges[0]);
          setShowBadgeModal(true);
        }
      }
    } catch (error) {
      console.error('Error catching Pokemon:', error);
    } finally {
      setCatching(false);
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>⚡ Quick Catch</Text>
          <Text style={styles.subtitle}>
            Instantly catch a random Pokémon!
          </Text>
        </View>

        {/* Pokemon Display */}
        <View style={styles.pokemonContainer}>
          {catching ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#f4511e" />
              <Text style={styles.loadingText}>Catching Pokémon...</Text>
            </View>
          ) : pokemon ? (
            <View style={styles.pokemonCard}>
              <Image
                source={{uri: pokemon.sprites?.front_default}}
                style={styles.pokemonImage}
                resizeMode="contain"
              />
              <Text style={styles.pokemonName}>{pokemon.name}</Text>
              <Text style={styles.pokemonId}>
                #{String(pokemon.id).padStart(3, '0')}
              </Text>
              <View style={styles.typesContainer}>
                {pokemon.types?.map((type, index) => (
                  <View key={index} style={styles.typeTag}>
                    <Text style={styles.typeText}>{type.type.name}</Text>
                  </View>
                ))}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyEmoji}>⚾</Text>
              <Text style={styles.emptyText}>
                Tap the button below to catch a Pokémon!
              </Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.button, styles.catchButton, catching && styles.buttonDisabled]}
            onPress={handleQuickCatch}
            disabled={catching}>
            {catching ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonEmoji}>⚡</Text>
                <Text style={styles.buttonText}>
                  {pokemon ? 'Catch Another' : 'Quick Catch'}
                </Text>
              </>
            )}
          </TouchableOpacity>

          {pokemon && !catching && (
            <>
              <TouchableOpacity
                style={[styles.button, styles.detailsButton]}
                onPress={() => navigation.navigate('Details', {pokemon})}>
                <Text style={styles.buttonEmoji}>ℹ️</Text>
                <Text style={styles.buttonText}>View Details</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.button, styles.catchModeButton]}
                onPress={() => navigation.navigate('CatchMode')}>
                <Text style={styles.buttonEmoji}>⚾</Text>
                <Text style={styles.buttonText}>Try Catch Mode</Text>
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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 30,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  pokemonContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  pokemonCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 30,
    alignItems: 'center',
    width: '100%',
    maxWidth: 350,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  pokemonImage: {
    width: 200,
    height: 200,
    marginBottom: 20,
  },
  pokemonName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 8,
  },
  pokemonId: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
  },
  typesContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  typeTag: {
    backgroundColor: '#f4511e',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  typeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  emptyState: {
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  buttonContainer: {
    padding: 20,
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catchButton: {
    backgroundColor: '#4caf50',
  },
  detailsButton: {
    backgroundColor: '#1976d2',
  },
  catchModeButton: {
    backgroundColor: '#9c27b0',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default QuickCatchScreen;
