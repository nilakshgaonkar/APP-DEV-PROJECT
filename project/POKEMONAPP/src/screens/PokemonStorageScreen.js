import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import auth from '@react-native-firebase/auth';
import {getCaughtPokemon, removeCaughtPokemon} from '../services/storageService';

const PokemonStorageScreen = ({navigation}) => {
  const [caughtPokemon, setCaughtPokemon] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({total: 0, unique: 0});

  useEffect(() => {
    loadCaughtPokemon();
  }, []);

  useFocusEffect(
    React.useCallback(() => {
      loadCaughtPokemon();
    }, []),
  );

  const loadCaughtPokemon = async () => {
    try {
      setLoading(true);
      const user = auth().currentUser;
      if (!user) return;

      const pokemon = await getCaughtPokemon(user.uid);
      setCaughtPokemon(pokemon);

      // Calculate stats
      const uniqueIds = new Set(pokemon.map(p => p.id));
      setStats({
        total: pokemon.length,
        unique: uniqueIds.size,
      });
    } catch (error) {
      console.error('Error loading caught Pokemon:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePokemonPress = (pokemon) => {
    navigation.navigate('Details', {pokemon});
  };

  const handleRelease = async (pokemonId, caughtId) => {
    try {
      const user = auth().currentUser;
      if (!user) return;

      await removeCaughtPokemon(user.uid, caughtId);
      await loadCaughtPokemon();
    } catch (error) {
      console.error('Error releasing Pokemon:', error);
    }
  };

  const renderPokemonItem = ({item}) => {
    const caughtDate = item.caughtAt?.toDate
      ? item.caughtAt.toDate().toLocaleDateString()
      : 'Unknown';

    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => handlePokemonPress(item)}>
        <View style={styles.cardContent}>
          {item.sprite ? (
            <Image
              source={{uri: item.sprite}}
              style={styles.sprite}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholder}>
              <Text style={styles.placeholderText}>?</Text>
            </View>
          )}
          <View style={styles.info}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.id}>#{String(item.id).padStart(3, '0')}</Text>
            <Text style={styles.date}>Caught: {caughtDate}</Text>
          </View>
        </View>
        <TouchableOpacity
          style={styles.releaseButton}
          onPress={() => handleRelease(item.id, item.caughtId)}>
          <Text style={styles.releaseText}>Release</Text>
        </TouchableOpacity>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#f4511e" />
        <Text style={styles.loadingText}>Loading your Pokémon...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Stats Header */}
      <View style={styles.statsContainer}>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total Caught</Text>
        </View>
        <View style={styles.statBox}>
          <Text style={styles.statValue}>{stats.unique}</Text>
          <Text style={styles.statLabel}>Unique Species</Text>
        </View>
      </View>

      {/* Action Buttons */}
      <View style={styles.actionBar}>
        <TouchableOpacity
          style={styles.catchButton}
          onPress={() => navigation.navigate('CatchMode')}>
          <Text style={styles.catchButtonText}>⚾ Catch More</Text>
        </TouchableOpacity>
      </View>

      {/* Pokemon List */}
      {caughtPokemon.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>📦</Text>
          <Text style={styles.emptyTitle}>Storage is Empty</Text>
          <Text style={styles.emptyText}>
            You haven't caught any Pokémon yet.
          </Text>
          <Text style={styles.emptySubtext}>
            Use Catch Mode to start your collection!
          </Text>
        </View>
      ) : (
        <FlatList
          data={caughtPokemon}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderPokemonItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
  },
  statBox: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#f4511e',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  actionBar: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  catchButton: {
    backgroundColor: '#4caf50',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  catchButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  listContent: {
    padding: 16,
    paddingTop: 0,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sprite: {
    width: 80,
    height: 80,
    marginRight: 16,
  },
  placeholder: {
    width: 80,
    height: 80,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  placeholderText: {
    fontSize: 32,
    color: '#999',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 4,
  },
  id: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
  releaseButton: {
    backgroundColor: '#ffebee',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#ef5350',
  },
  releaseText: {
    color: '#d32f2f',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyEmoji: {
    fontSize: 80,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 4,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

export default PokemonStorageScreen;
