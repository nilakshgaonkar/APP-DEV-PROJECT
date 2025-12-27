/**
 * Calculate Levenshtein distance between two strings
 * Used for fuzzy matching Pokemon names
 */
const levenshteinDistance = (str1, str2) => {
  const m = str1.length;
  const n = str2.length;
  const dp = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) {
    dp[i][0] = i;
  }
  for (let j = 0; j <= n; j++) {
    dp[0][j] = j;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + 1, // substitution
        );
      }
    }
  }

  return dp[m][n];
};

/**
 * Find similar Pokemon names using fuzzy matching
 * @param {string} searchTerm - The search term with possible typos
 * @param {Array<string>} pokemonNames - Array of Pokemon names to search in
 * @param {number} maxResults - Maximum number of suggestions to return
 * @returns {Array<string>} Array of similar Pokemon names
 */
export const findSimilarPokemon = (searchTerm, pokemonNames, maxResults = 5) => {
  if (!searchTerm || !pokemonNames || pokemonNames.length === 0) {
    return [];
  }

  const searchLower = searchTerm.toLowerCase().trim();
  const results = [];

  for (const name of pokemonNames) {
    const nameLower = name.toLowerCase();
    
    // Exact match (case-insensitive)
    if (nameLower === searchLower) {
      return [name]; // Return exact match immediately
    }

    // Check if search term is contained in name
    if (nameLower.includes(searchLower) || searchLower.includes(nameLower)) {
      results.push({name, distance: 0, score: 100});
      continue;
    }

    // Calculate Levenshtein distance
    const distance = levenshteinDistance(searchLower, nameLower);
    const maxLength = Math.max(searchLower.length, nameLower.length);
    const similarity = ((maxLength - distance) / maxLength) * 100;

    // Only include if similarity is above 50%
    if (similarity >= 50) {
      results.push({name, distance, score: similarity});
    }
  }

  // Sort by score (highest first), then by distance (lowest first)
  results.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return a.distance - b.distance;
  });

  // Return top results
  return results.slice(0, maxResults).map((r) => r.name);
};

/**
 * Common Pokemon names for suggestion (first 151 + some popular ones)
 * This is a fallback list if we can't fetch from API
 */
export const COMMON_POKEMON_NAMES = [
  'bulbasaur', 'ivysaur', 'venusaur', 'charmander', 'charmeleon', 'charizard',
  'squirtle', 'wartortle', 'blastoise', 'caterpie', 'metapod', 'butterfree',
  'weedle', 'kakuna', 'beedrill', 'pidgey', 'pidgeotto', 'pidgeot',
  'rattata', 'raticate', 'spearow', 'fearow', 'ekans', 'arbok',
  'pikachu', 'raichu', 'sandshrew', 'sandslash', 'nidoran', 'nidorina',
  'nidoqueen', 'nidorino', 'nidoking', 'clefairy', 'clefable', 'vulpix',
  'ninetales', 'jigglypuff', 'wigglytuff', 'zubat', 'golbat', 'oddish',
  'gloom', 'vileplume', 'paras', 'parasect', 'venonat', 'venomoth',
  'diglett', 'dugtrio', 'meowth', 'persian', 'psyduck', 'golduck',
  'mankey', 'primeape', 'growlithe', 'arcanine', 'poliwag', 'poliwhirl',
  'poliwrath', 'abra', 'kadabra', 'alakazam', 'machop', 'machoke',
  'machamp', 'bellsprout', 'weepinbell', 'victreebel', 'tentacool', 'tentacruel',
  'geodude', 'graveler', 'golem', 'ponyta', 'rapidash', 'slowpoke',
  'slowbro', 'magnemite', 'magneton', 'farfetchd', 'doduo', 'dodrio',
  'seel', 'dewgong', 'grimer', 'muk', 'shellder', 'cloyster',
  'gastly', 'haunter', 'gengar', 'onix', 'drowzee', 'hypno',
  'krabby', 'kingler', 'voltorb', 'electrode', 'exeggcute', 'exeggutor',
  'cubone', 'marowak', 'hitmonlee', 'hitmonchan', 'lickitung', 'koffing',
  'weezing', 'rhyhorn', 'rhydon', 'chansey', 'tangela', 'kangaskhan',
  'horsea', 'seadra', 'goldeen', 'seaking', 'staryu', 'starmie',
  'mr-mime', 'scyther', 'jynx', 'electabuzz', 'magmar', 'pinsir',
  'tauros', 'magikarp', 'gyarados', 'lapras', 'ditto', 'eevee',
  'vaporeon', 'jolteon', 'flareon', 'porygon', 'omanyte', 'omastar',
  'kabuto', 'kabutops', 'aerodactyl', 'snorlax', 'articuno', 'zapdos',
  'moltres', 'dratini', 'dragonair', 'dragonite', 'mewtwo', 'mew',
  // Popular gen 2-3
  'chikorita', 'cyndaquil', 'totodile', 'lugia', 'ho-oh', 'mudkip',
  'torchic', 'treecko', 'rayquaza', 'groudon', 'kyogre',
  // Popular gen 4+
  'lucario', 'garchomp', 'dialga', 'palkia', 'giratina', 'arceus',
  'zoroark', 'reshiram', 'zekrom', 'kyurem', 'xerneas', 'yveltal',
  'zygarde', 'solgaleo', 'lunala', 'necrozma', 'zacian', 'zamazenta',
  'eternatus', 'koraidon', 'miraidon',
];

