# Catch Mode Feature

## Overview
Catch Mode is an interactive feature that simulates catching wild Pokemon with animations and a fun user experience. Caught Pokemon are stored in a dedicated Pokemon Storage system.

## Features

### 1. Catch Mode Screen
**Interactive catching experience:**
- Random wild Pokemon appears as silhouette
- "Who's that Pokemon?" mystery element
- Throw Poke Ball animation
- Reveal animation when caught
- Success celebration message
- Multiple action options after catching

### 2. Pokemon Storage
**Dedicated storage system:**
- View all caught Pokemon
- Statistics (total caught, unique species)
- Release Pokemon functionality
- Caught date tracking
- Quick access to catch more

### 3. Animations
**Smooth, engaging animations:**
- Silhouette mystery effect
- Poke Ball throw animation
- Pokemon reveal fade-in
- Success celebration scale animation
- Smooth transitions between states

## User Experience

### Catching Flow

**1. Enter Catch Mode**
- Tap "Catch Mode" button on dashboard
- Or navigate from storage screen

**2. Wild Pokemon Appears**
- Pokemon appears as dark silhouette
- "Who's that Pokemon?" text displayed
- Poke Ball ready at bottom

**3. Throw Poke Ball**
- Tap "Throw Poké Ball" button
- Poke Ball shakes and scales up
- Poke Ball flies upward
- Brief suspense moment

**4. Catch Success**
- Silhouette fades out
- Pokemon reveals with fade-in animation
- Success message appears:
  - "🎉 Congratulations Trainer!"
  - "You caught [Pokemon Name]!"
  - Pokemon ID displayed

**5. Post-Catch Options**
- **Catch Another** - Start new catch immediately
- **View Storage** - See all caught Pokemon
- **View Details** - See full Pokemon details

### Storage Management

**View Storage:**
- Shows all caught Pokemon in list
- Displays sprite, name, ID, caught date
- Statistics at top (total/unique)
- "Catch More" button for quick access

**Release Pokemon:**
- Tap "Release" button on any Pokemon
- Removes from storage
- Updates statistics

## Technical Implementation

### Catch Mode Screen

**State Management:**
```javascript
const [pokemon, setPokemon] = useState(null);
const [catching, setCatching] = useState(false);
const [caught, setCaught] = useState(false);
const [showSilhouette, setShowSilhouette] = useState(true);
```

**Animations:**
```javascript
const silhouetteOpacity = useRef(new Animated.Value(1)).current;
const pokemonOpacity = useRef(new Animated.Value(0)).current;
const pokeballScale = useRef(new Animated.Value(1)).current;
const pokeballY = useRef(new Animated.Value(0)).current;
const successScale = useRef(new Animated.Value(0)).current;
```

**Animation Sequence:**
1. Poke Ball shake and scale (200ms)
2. Poke Ball throw upward (500ms)
3. Silhouette fade out (300ms)
4. Pokemon fade in (800ms)
5. Success message scale in (spring animation)

### Storage Service

**storageService.js** provides:
- `saveCaughtPokemon(userId, pokemon)` - Save to Firestore
- `getCaughtPokemon(userId)` - Get all caught Pokemon
- `removeCaughtPokemon(userId, caughtId)` - Release Pokemon
- `getStorageStats(userId)` - Get statistics
- `isPokemonInStorage(userId, pokemonId)` - Check if caught
- `getPokemonCount(userId, pokemonId)` - Count duplicates

### Data Structure

**Firestore Collection:** `pokemonStorage/{userId}/caught`

**Document Structure:**
```javascript
{
  id: number,              // Pokemon ID
  name: string,            // Pokemon name
  sprite: string,          // Image URL
  types: array,            // Pokemon types
  caughtAt: timestamp,     // When caught
}
```

### Integration with Badge System

Catching Pokemon tracks toward badges:
- 💧 Water Badge (5 catches)
- 👻 Soul Badge (10 catches)
- 🌍 Earth Badge (25 catches)

Badge notification appears after successful catch if threshold reached.

## Navigation Flow

```
Dashboard
  ├─ Catch Mode
  │   ├─ Catch Pokemon
  │   ├─ View Details
  │   └─ View Storage
  └─ Storage
      ├─ Catch More (→ Catch Mode)
      └─ View Details
```

## UI Components

### Catch Mode Screen

**Layout:**
- Title: "Wild Pokémon Appeared!"
- Pokemon display area (center)
- Poke Ball (animated)
- Action buttons (bottom)
- Hint text

**Colors:**
- Background: Light green (#e8f5e9)
- Title: Dark green (#2e7d32)
- Buttons: Various (orange, green, blue, purple)

### Storage Screen

**Layout:**
- Statistics cards (top)
- "Catch More" button
- Pokemon list (scrollable)
- Empty state (if no Pokemon)

**List Items:**
- Pokemon sprite
- Name and ID
- Caught date
- Release button

## Features in Detail

### Silhouette Effect
- Pokemon image with black overlay (80% opacity)
- Creates mystery before reveal
- Fades out smoothly when caught

### Poke Ball Animation
- Starts at normal size (scale: 1)
- Shakes and grows (scale: 1.2)
- Flies upward (translateY: -300)
- Smooth spring physics

### Success Celebration
- Large emoji (🎉)
- Bold congratulations message
- Pokemon name highlighted
- Spring animation entrance

### Badge Integration
- Automatically tracks catches
- Shows badge notification if earned
- Updates trainer stats
- Syncs with dashboard

## Storage Statistics

**Tracked Metrics:**
- **Total Caught**: All Pokemon in storage (including duplicates)
- **Unique Species**: Number of different Pokemon
- **Caught Date**: When each Pokemon was caught

**Display:**
- Two stat cards at top of storage
- Large numbers with labels
- Updates in real-time

## User Actions

### In Catch Mode:
1. **Throw Poké Ball** - Catch the Pokemon
2. **Catch Another** - New random Pokemon
3. **View Storage** - See collection
4. **View Details** - Full Pokemon info

### In Storage:
1. **Catch More** - Go to Catch Mode
2. **Tap Pokemon** - View details
3. **Release** - Remove from storage

## Error Handling

**Loading States:**
- "Finding a wild Pokémon..." while loading
- Activity indicator during catch
- Smooth transitions

**Error Cases:**
- Failed to load Pokemon: Retry automatically
- Failed to save: Error logged, user can try again
- Network issues: Graceful degradation

## Future Enhancements

### Planned Features:

1. **Catch Difficulty**
   - Different catch rates per Pokemon
   - Multiple throw attempts
   - Shake animation (1-3 shakes)
   - Escape possibility

2. **Different Poke Balls**
   - Great Ball, Ultra Ball, Master Ball
   - Different catch rates
   - Unlock through achievements
   - Visual variations

3. **Pokemon Rarity**
   - Common, Uncommon, Rare, Legendary
   - Different spawn rates
   - Special animations for rare catches
   - Rarity indicators

4. **Catch Combos**
   - Streak bonuses
   - Increased shiny odds
   - Special rewards
   - Combo counter

5. **Shiny Pokemon**
   - Rare shiny variants
   - Special sparkle animation
   - Shiny indicator in storage
   - Shiny collection tracking

6. **Location-Based Spawns**
   - Different Pokemon in different areas
   - Time-based spawns
   - Weather effects
   - Special events

7. **Storage Upgrades**
   - Organize by type, region, etc.
   - Search and filter
   - Sort options
   - Box system (like main games)

8. **Trading System**
   - Trade with friends
   - Trade evolution support
   - Trade history
   - Special trade Pokemon

## Testing

### Test Scenarios:

**1. Basic Catch Flow**
- Enter Catch Mode
- Throw Poke Ball
- Verify animations play
- Check success message
- Confirm saved to storage

**2. Multiple Catches**
- Catch several Pokemon
- Verify each saves correctly
- Check statistics update
- Confirm no duplicates lost

**3. Storage Management**
- View storage
- Release Pokemon
- Verify removal
- Check stats update

**4. Badge Integration**
- Catch 5 Pokemon
- Verify Water Badge earned
- Check notification appears
- Confirm badge on dashboard

**5. Navigation**
- Test all navigation paths
- Verify back button works
- Check deep linking
- Test state persistence

## Performance

**Optimizations:**
- Lazy loading of Pokemon data
- Cached sprites
- Efficient Firestore queries
- Smooth 60fps animations
- Minimal re-renders

**Best Practices:**
- useRef for animation values
- Memoized callbacks
- Optimized list rendering
- Proper cleanup on unmount

## Files

### New Files:
- `src/screens/CatchModeScreen.js` - Catch Mode UI
- `src/screens/PokemonStorageScreen.js` - Storage UI
- `src/services/storageService.js` - Storage operations

### Modified Files:
- `src/navigation/AppNavigator.js` - Added routes
- `src/screens/TrainerDashboard.js` - Added buttons
- `firestore.rules` - Added storage rules

## Summary

Catch Mode adds a fun, interactive element to the Pokemon app:
- ✅ Engaging catch animations
- ✅ Mystery silhouette reveal
- ✅ Dedicated storage system
- ✅ Badge integration
- ✅ Statistics tracking
- ✅ Multiple action options
- ✅ Smooth user experience

The feature makes catching Pokemon feel rewarding and encourages users to build their collection!
