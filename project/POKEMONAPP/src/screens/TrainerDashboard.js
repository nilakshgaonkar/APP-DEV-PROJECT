import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {getTrainerProfile} from '../services/trainerService';
import {getCachedPokemon} from '../utils/pokemonCache';
import useFavorites from '../hooks/useFavorites';
import {getPokemonByNameOrId} from '../services/api';
import {savePokemonToCache} from '../utils/pokemonCache';
import {trackCatch, getAllBadges, getBadgeById} from '../services/badgeService';
import BadgeNotification from '../components/BadgeNotification';

const AVATAR_EMOJIS = {
  male1: '👨',
  male2: '🧑',
  female1: '👩',
  female2: '👧',
  neutral1: '🧒',
  neutral2: '🧑‍🦰',
};

const TrainerDashboard = ({navigation}) => {
  const [trainerProfile, setTrainerProfile] = useState(null);
  const [recentPokemon, setRecentPokemon] = useState([]);
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [catchingPokemon, setCatchingPokemon] = useState(false);
  const {favorites} = useFavorites();

  useEffect(() => {
    loadDashboardData();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadDashboardData();
    }, []),
  );

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      // Load trainer profile
      const profile = await getTrainerProfile(user.uid);
      setTrainerProfile(profile);

      // Load recent searches
      const cached = await getCachedPokemon(user.uid);
      setRecentPokemon(cached.slice(0, 6));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCatchRandomPokemon = async () => {
    try {
      setCatchingPokemon(true);
      const randomId = Math.floor(Math.random() * 1010) + 1;
      const pokemon = await getPokemonByNameOrId(randomId.toString());
      
      // Save to cache
      const user = auth().currentUser;
      if (user) {
        await savePokemonToCache(user.uid, pokemon);
        
        // Track catch and check for badges
        const newBadges = await trackCatch(user.uid);
        if (newBadges.length > 0) {
          setEarnedBadge(newBadges[0]);
          setShowBadgeModal(true);
        }
      }
      
      // Navigate to details
      navigation.navigate('Details', {pokemon, isCaught: true});
    } catch (error) {
      console.error('Error catching random Pokemon:', error);
    } finally {
      setCatchingPokemon(false);
    }
  };

  const handlePokemonPress = (pokemon) => {
    navigation.navigate('Details', {pokemon});
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading Trainer HQ...</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Trainer Card Header */}
      <View style={styles.trainerCard}>
        <View style={styles.trainerHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarEmoji}>
              {trainerProfile?.avatar
                ? AVATAR_EMOJIS[trainerProfile.avatar] || '👤'
                : '👤'}
            </Text>
          </View>
          <View style={styles.trainerInfo}>
            <Text style={styles.trainerName}>
              {trainerProfile?.trainerName || 'Trainer'}
            </Text>
            <Text style={styles.trainerRegion}>
              {trainerProfile?.region || 'Unknown'} Region
            </Text>
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {trainerProfile?.pokemonCaught || 0}
                </Text>
                <Text style={styles.statLabel}>Caught</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>
                  {trainerProfile?.badges?.length || 0}
                </Text>
                <Text style={styles.statLabel}>Badges</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Badges Section */}
        {trainerProfile?.badges && trainerProfile.badges.length > 0 && (
          <View style={styles.badgesSection}>
            <Text style={styles.sectionTitle}>🏆 Badges Earned</Text>
            <View style={styles.badgesContainer}>
              {trainerProfile.badges.map((badgeId, index) => {
                const badge = getBadgeById(badgeId);
                return (
                  <View key={index} style={styles.badge}>
                    <Text style={styles.badgeEmoji}>{badge?.emoji || '🏅'}</Text>
                    <Text style={styles.badgeText}>{badge?.name || badgeId}</Text>
                  </View>
                );
              })}
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      <View style={styles.quickActions}>
        <TouchableOpacity
          style={[styles.quickActionButton, styles.catchModeButton]}
          onPress={() => navigation.navigate('CatchMode')}>
          <Text style={styles.quickActionEmoji}>⚾</Text>
          <Text style={styles.quickActionText}>Catch Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.quickActionButton, styles.profileButton]}
          onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.quickActionEmoji}>👤</Text>
          <Text style={styles.quickActionText}>Profile</Text>
        </TouchableOpacity>
      </View>

      {/* Favorite Pokemon */}
      {favorites.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>❤️ Favorite Pokémon</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Favorites')}>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pokemonList}>
            {favorites.slice(0, 6).map((pokemon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pokemonCard}
                onPress={() => handlePokemonPress(pokemon)}>
                {pokemon.sprite ? (
                  <Image
                    source={{uri: pokemon.sprite}}
                    style={styles.pokemonSprite}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.pokemonPlaceholder}>
                    <Text style={styles.pokemonPlaceholderText}>?</Text>
                  </View>
                )}
                <Text style={styles.pokemonName} numberOfLines={1}>
                  {pokemon.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Recent Searches */}
      {recentPokemon.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔍 Recently Searched</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.pokemonList}>
            {recentPokemon.map((pokemon, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pokemonCard}
                onPress={() => handlePokemonPress(pokemon)}>
                {pokemon.sprite ? (
                  <Image
                    source={{uri: pokemon.sprite}}
                    style={styles.pokemonSprite}
                    resizeMode="contain"
                  />
                ) : (
                  <View style={styles.pokemonPlaceholder}>
                    <Text style={styles.pokemonPlaceholderText}>?</Text>
                  </View>
                )}
                <Text style={styles.pokemonName} numberOfLines={1}>
                  {pokemon.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Empty State */}
      {recentPokemon.length === 0 && favorites.length === 0 && (
        <View style={styles.emptyState}>
          <Text style={styles.emptyStateEmoji}>🎒</Text>
          <Text style={styles.emptyStateTitle}>Start Your Adventure!</Text>
          <Text style={styles.emptyStateText}>
            Search for Pokémon or catch a random one to begin your journey
          </Text>
        </View>
      )}
    </ScrollView>
    
    <BadgeNotification
      badge={earnedBadge}
      visible={showBadgeModal}
      onClose={() => {
        setShowBadgeModal(false);
        loadDashboardData(); // Reload to show new badge
      }}
    />
  </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#666',
  },
  trainerCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  trainerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#fff5f2',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#f4511e',
    marginRight: 16,
  },
  avatarEmoji: {
    fontSize: 48,
  },
  trainerInfo: {
    flex: 1,
  },
  trainerName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  trainerRegion: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#f4511e',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  badgesSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff5f2',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f4511e',
  },
  badgeEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    color: '#f4511e',
    fontWeight: '600',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  quickActionButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  catchModeButton: {
    backgroundColor: '#4caf50',
  },
  profileButton: {
    backgroundColor: '#9c27b0',
  },
  quickActionEmoji: {
    fontSize: 28,
    marginBottom: 4,
  },
  quickActionText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  seeAllText: {
    fontSize: 14,
    color: '#f4511e',
    fontWeight: '600',
  },
  pokemonList: {
    paddingVertical: 4,
  },
  pokemonCard: {
    width: 100,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  pokemonSprite: {
    width: 70,
    height: 70,
    marginBottom: 8,
  },
  pokemonPlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  pokemonPlaceholderText: {
    fontSize: 24,
    color: '#999',
  },
  pokemonName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    textTransform: 'capitalize',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    paddingHorizontal: 40,
  },
});

export default TrainerDashboard;
