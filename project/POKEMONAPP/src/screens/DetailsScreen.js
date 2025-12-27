import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import auth from '@react-native-firebase/auth';
import useFavorites from '../hooks/useFavorites';
import {
  getPokemonSpecies,
  getEvolutionChain,
  getPokemonByNameOrId,
  getMoveDetails,
} from '../services/api';
import {trackFavorite} from '../services/badgeService';
import BadgeNotification from '../components/BadgeNotification';

const DetailsScreen = ({navigation, route}) => {
  const pokemon = route?.params?.pokemon;
  const {addFavorite, removeFavorite, isFavorite, favorites} = useFavorites();
  const [favorite, setFavorite] = useState(
    pokemon ? isFavorite(pokemon.id) : false,
  );
  const [loadingEvolution, setLoadingEvolution] = useState(false);
  const [evolutionChain, setEvolutionChain] = useState([]);
  const [evolutionError, setEvolutionError] = useState('');
  const [selectedMovesTab, setSelectedMovesTab] = useState('level-up'); // 'level-up' | 'machine'
  const [levelUpMoves, setLevelUpMoves] = useState([]);
  const [tmMoves, setTmMoves] = useState([]);
  const [selectedMove, setSelectedMove] = useState(null);
  const [moveDetails, setMoveDetails] = useState(null);
  const [loadingMove, setLoadingMove] = useState(false);
  const [moveError, setMoveError] = useState('');
  const [earnedBadge, setEarnedBadge] = useState(null);
  const [showBadgeModal, setShowBadgeModal] = useState(false);

  useEffect(() => {
    if (pokemon?.id) {
      fetchEvolutionChain();
      setFavorite(isFavorite(pokemon.id));
      extractMoves();
    }
  }, [pokemon?.id, isFavorite]);

  const extractMoves = () => {
    if (!pokemon?.moves) {
      setLevelUpMoves([]);
      setTmMoves([]);
      return;
    }

    const lvlMap = new Map();
    const tmMap = new Map();

    pokemon.moves.forEach((moveEntry) => {
      const name = moveEntry.move?.name;
      if (!name || !Array.isArray(moveEntry.version_group_details)) {
        return;
      }

      moveEntry.version_group_details.forEach((vg) => {
        const method = vg.move_learn_method?.name;
        const level = vg.level_learned_at || 0;

        if (method === 'level-up') {
          if (!lvlMap.has(name) || lvlMap.get(name).level > level) {
            lvlMap.set(name, {name, level});
          }
        } else if (method === 'machine') {
          if (!tmMap.has(name)) {
            tmMap.set(name, {name});
          }
        }
      });
    });

    const lvlList = Array.from(lvlMap.values()).sort(
      (a, b) => a.level - b.level || a.name.localeCompare(b.name),
    );
    const tmList = Array.from(tmMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    );

    setLevelUpMoves(lvlList);
    setTmMoves(tmList);
  };

  const handleSelectMove = async (moveName) => {
    try {
      setSelectedMove(moveName);
      setMoveError('');
      setLoadingMove(true);
      const data = await getMoveDetails(moveName);
      setMoveDetails(data);
    } catch (error) {
      setMoveDetails(null);
      setMoveError(error.message);
    } finally {
      setLoadingMove(false);
    }
  };

  const toggleFavorite = async () => {
    if (!pokemon) {
      return;
    }
    try {
      const user = auth().currentUser;
      if (favorite) {
        await removeFavorite(pokemon.id);
        setFavorite(false);
        
        // Track favorites count (decreased)
        if (user) {
          await trackFavorite(user.uid, favorites.length - 1);
        }
      } else {
        await addFavorite(pokemon);
        setFavorite(true);
        
        // Track favorites count and check for badges (increased)
        if (user) {
          const newBadges = await trackFavorite(user.uid, favorites.length + 1);
          if (newBadges.length > 0) {
            setEarnedBadge(newBadges[0]);
            setShowBadgeModal(true);
          }
        }
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
    }
  };

  const fetchEvolutionChain = async () => {
    setLoadingEvolution(true);
    setEvolutionError('');

    try {
      const species = await getPokemonSpecies(pokemon.id);
      if (species.evolution_chain?.url) {
        const chainData = await getEvolutionChain(species.evolution_chain.url);
        const chain = parseEvolutionChain(chainData.chain);
        setEvolutionChain(chain);
      }
    } catch (err) {
      setEvolutionError(err.message);
    } finally {
      setLoadingEvolution(false);
    }
  };

  const parseEvolutionChain = (chain) => {
    const evolutionList = [];

    const traverse = (node) => {
      if (node.species) {
        const pokemonName = node.species.name;
        const pokemonId = node.species.url.split('/').filter(Boolean).pop();
        evolutionList.push({
          name: pokemonName,
          id: pokemonId,
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`,
        });
      }

      if (node.evolves_to && node.evolves_to.length > 0) {
        node.evolves_to.forEach((evolution) => traverse(evolution));
      }
    };

    traverse(chain);
    return evolutionList;
  };

  const handleEvolutionPress = async (pokemonName) => {
    try {
      setLoadingEvolution(true);
      const evolutionPokemon = await getPokemonByNameOrId(pokemonName);
      navigation.navigate('Details', {pokemon: evolutionPokemon});
    } catch (err) {
      setEvolutionError(err.message);
    } finally {
      setLoadingEvolution(false);
    }
  };

  const getTypeColor = (type) => {
    const typeColors = {
      normal: '#A8A878',
      fire: '#F08030',
      water: '#6890F0',
      electric: '#F8D030',
      grass: '#78C850',
      ice: '#98D8D8',
      fighting: '#C03028',
      poison: '#A040A0',
      ground: '#E0C068',
      flying: '#A890F0',
      psychic: '#F85888',
      bug: '#A8B820',
      rock: '#B8A038',
      ghost: '#705898',
      dragon: '#7038F8',
      dark: '#705848',
      steel: '#B8B8D0',
      fairy: '#EE99AC',
    };
    return typeColors[type] || '#A8A878';
  };

  const getStatName = (statName) => {
    const statMap = {
      hp: 'HP',
      attack: 'Attack',
      defense: 'Defense',
      'special-attack': 'Sp. Atk',
      'special-defense': 'Sp. Def',
      speed: 'Speed',
    };
    return statMap[statName] || statName;
  };

  const getSpriteData = () => {
    const sprites = pokemon?.sprites || {};
    return [
      {
        uri: sprites.front_default,
        label: 'Front',
        isShiny: false,
      },
      {
        uri: sprites.back_default,
        label: 'Back',
        isShiny: false,
      },
      {
        uri: sprites.front_shiny,
        label: 'Front Shiny',
        isShiny: true,
      },
      {
        uri: sprites.back_shiny,
        label: 'Back Shiny',
        isShiny: true,
      },
    ];
  };

  const renderSpriteItem = (spriteData, index) => {
    const hasSprite = spriteData.uri !== null && spriteData.uri !== undefined;

    return (
      <View key={index} style={styles.spriteCarouselItem}>
        {hasSprite ? (
          <Image
            source={{uri: spriteData.uri}}
            style={styles.spriteCarouselImage}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.spritePlaceholder}>
            <Text style={styles.spritePlaceholderText}>No Image</Text>
          </View>
        )}
        <Text style={styles.spriteLabel}>{spriteData.label}</Text>
      </View>
    );
  };

  if (!pokemon) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Pokemon Details</Text>
        <Text style={styles.errorText}>No Pokemon data available</Text>
      </View>
    );
  }

  return (
    <>
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header with Name and ID */}
      <View style={styles.header}>
        <View style={styles.headerTextContainer}>
          <Text style={styles.name}>{pokemon.name}</Text>
          <Text style={styles.id}>#{String(pokemon.id).padStart(3, '0')}</Text>
        </View>
        <TouchableOpacity
          style={styles.favoriteButton}
          onPress={toggleFavorite}>
          <Text style={styles.favoriteIcon}>{favorite ? '💖' : '🤍'}</Text>
        </TouchableOpacity>
      </View>

      {/* Sprite Carousel */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Sprites</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.spriteCarouselContainer}>
          {getSpriteData().map((spriteData, index) =>
            renderSpriteItem(spriteData, index),
          )}
        </ScrollView>
      </View>

      {/* Types */}
      {pokemon.types && pokemon.types.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Types</Text>
          <View style={styles.typesContainer}>
            {pokemon.types.map((typeItem, index) => (
              <View
                key={index}
                style={[
                  styles.typeBadge,
                  {backgroundColor: getTypeColor(typeItem.type.name)},
                ]}>
                <Text style={styles.typeText}>{typeItem.type.name}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* Base Stats */}
      {pokemon.stats && pokemon.stats.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Base Stats</Text>
          {pokemon.stats.map((statItem, index) => (
            <View key={index} style={styles.statRow}>
              <Text style={styles.statLabel}>
                {getStatName(statItem.stat.name)}:
              </Text>
              <Text style={styles.statValue}>{statItem.base_stat}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Abilities */}
      {pokemon.abilities && pokemon.abilities.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Abilities</Text>
          {pokemon.abilities.map((abilityItem, index) => (
            <View key={index} style={styles.abilityItem}>
              <Text style={styles.abilityText}>
                {abilityItem.ability.name}
                {abilityItem.is_hidden && (
                  <Text style={styles.hiddenAbility}> (Hidden)</Text>
                )}
              </Text>
            </View>
          ))}
        </View>
      )}

      {/* Moves */}
      {(levelUpMoves.length > 0 || tmMoves.length > 0) && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Moves</Text>
          <View style={styles.moveTabs}>
            <TouchableOpacity
              style={[
                styles.moveTab,
                selectedMovesTab === 'level-up' && styles.moveTabActive,
              ]}
              onPress={() => setSelectedMovesTab('level-up')}>
              <Text
                style={[
                  styles.moveTabText,
                  selectedMovesTab === 'level-up' && styles.moveTabTextActive,
                ]}>
                Level-up
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.moveTab,
                selectedMovesTab === 'machine' && styles.moveTabActive,
              ]}
              onPress={() => setSelectedMovesTab('machine')}>
              <Text
                style={[
                  styles.moveTabText,
                  selectedMovesTab === 'machine' && styles.moveTabTextActive,
                ]}>
                TM / Machine
              </Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={selectedMovesTab === 'level-up' ? levelUpMoves : tmMoves}
            keyExtractor={(item) => item.name}
            style={styles.movesList}
            renderItem={({item}) => (
              <TouchableOpacity
                style={[
                  styles.moveItem,
                  selectedMove === item.name && styles.moveItemSelected,
                ]}
                onPress={() => handleSelectMove(item.name)}>
                <Text style={styles.moveName}>{item.name}</Text>
                {item.level !== undefined && (
                  <Text style={styles.moveLevel}>Lv. {item.level}</Text>
                )}
              </TouchableOpacity>
            )}
          />

          {/* Move details */}
          <View style={styles.moveDetailsContainer}>
            {loadingMove && (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#f4511e" />
                <Text style={styles.loadingText}>Loading move...</Text>
              </View>
            )}
            {moveError ? (
              <Text style={styles.errorText}>{moveError}</Text>
            ) : (
              moveDetails && (
                <View style={styles.moveDetailsCard}>
                  <Text style={styles.moveDetailsTitle}>
                    {moveDetails.name} (Type:{' '}
                    {moveDetails.type?.name || 'unknown'})
                  </Text>
                  <View style={styles.moveDetailsRow}>
                    <Text style={styles.moveDetailsLabel}>Damage Class</Text>
                    <Text style={styles.moveDetailsValue}>
                      {moveDetails.damage_class?.name || '-'}
                    </Text>
                  </View>
                  <View style={styles.moveDetailsRow}>
                    <Text style={styles.moveDetailsLabel}>Power</Text>
                    <Text style={styles.moveDetailsValue}>
                      {moveDetails.power ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.moveDetailsRow}>
                    <Text style={styles.moveDetailsLabel}>Accuracy</Text>
                    <Text style={styles.moveDetailsValue}>
                      {moveDetails.accuracy ?? '-'}
                    </Text>
                  </View>
                  <View style={styles.moveDetailsRow}>
                    <Text style={styles.moveDetailsLabel}>PP</Text>
                    <Text style={styles.moveDetailsValue}>
                      {moveDetails.pp ?? '-'}
                    </Text>
                  </View>
                </View>
              )
            )}
          </View>
        </View>
      )}

      {/* Evolution Chain */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Evolution Chain</Text>
        {loadingEvolution ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#f4511e" />
            <Text style={styles.loadingText}>Loading evolution chain...</Text>
          </View>
        ) : evolutionError ? (
          <Text style={styles.errorText}>{evolutionError}</Text>
        ) : evolutionChain.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.evolutionContainer}>
            {evolutionChain.map((evolution, index) => (
              <TouchableOpacity
                key={index}
                style={styles.evolutionItem}
                onPress={() => handleEvolutionPress(evolution.name)}
                disabled={loadingEvolution}>
                <Image
                  source={{uri: evolution.sprite}}
                  style={styles.evolutionSprite}
                  resizeMode="contain"
                />
                <Text style={styles.evolutionName}>{evolution.name}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        ) : (
          <Text style={styles.noEvolutionText}>No evolution chain available</Text>
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  headerTextContainer: {
    flexDirection: 'column',
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    textTransform: 'capitalize',
    marginBottom: 5,
  },
  id: {
    fontSize: 18,
    color: '#666',
  },
  favoriteButton: {
    padding: 8,
  },
  favoriteIcon: {
    fontSize: 28,
  },
  spriteContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  sprite: {
    width: 200,
    height: 200,
  },
  spriteCarouselContainer: {
    paddingVertical: 10,
  },
  spriteCarouselItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    minWidth: 150,
  },
  spriteCarouselImage: {
    width: 150,
    height: 150,
    marginBottom: 8,
  },
  spritePlaceholder: {
    width: 150,
    height: 150,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 8,
  },
  spritePlaceholderText: {
    color: '#999',
    fontSize: 12,
  },
  spriteLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  typesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  typeBadge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    marginBottom: 8,
  },
  typeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  statRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  statLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  abilityItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  abilityText: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
  },
  hiddenAbility: {
    color: '#666',
    fontStyle: 'italic',
  },
  evolutionContainer: {
    paddingVertical: 10,
  },
  evolutionItem: {
    alignItems: 'center',
    marginRight: 20,
    padding: 10,
    borderRadius: 10,
    backgroundColor: '#f9f9f9',
    minWidth: 100,
  },
  evolutionSprite: {
    width: 80,
    height: 80,
    marginBottom: 8,
  },
  evolutionName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    textTransform: 'capitalize',
    textAlign: 'center',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  loadingText: {
    marginLeft: 10,
    color: '#666',
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  noEvolutionText: {
    color: '#666',
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
  },
  moveTabs: {
    flexDirection: 'row',
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    padding: 4,
    alignSelf: 'flex-start',
  },
  moveTab: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
  },
  moveTabActive: {
    backgroundColor: '#f4511e',
  },
  moveTabText: {
    fontSize: 14,
    color: '#555',
    fontWeight: '500',
  },
  moveTabTextActive: {
    color: '#fff',
    fontWeight: '700',
  },
  movesList: {
    maxHeight: 220,
    marginBottom: 12,
  },
  moveItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  moveItemSelected: {
    backgroundColor: '#fff3e0',
  },
  moveName: {
    fontSize: 16,
    color: '#333',
    textTransform: 'capitalize',
    flex: 1,
  },
  moveLevel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  moveDetailsContainer: {
    marginTop: 8,
  },
  moveDetailsCard: {
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#f0f0f0',
    padding: 12,
    backgroundColor: '#fafafa',
  },
  moveDetailsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  moveDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  moveDetailsLabel: {
    fontSize: 14,
    color: '#666',
  },
  moveDetailsValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
});

export default DetailsScreen;
