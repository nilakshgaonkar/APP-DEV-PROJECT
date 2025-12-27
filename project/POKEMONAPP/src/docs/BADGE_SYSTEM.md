# Gym Badges Achievement System

## Overview
The Badge System rewards users for their interactions with the app, similar to earning gym badges in Pokemon games. Badges are automatically awarded when users reach specific milestones.

## Available Badges

### 🪨 Boulder Badge
- **Requirement**: Search 10 Pokémon
- **Tracks**: Total searches
- **Awarded**: Automatically when threshold is reached

### 💧 Water Badge
- **Requirement**: Catch 5 random Pokémon
- **Tracks**: Random catches from dashboard
- **Awarded**: Automatically when threshold is reached

### ⚡ Thunder Badge
- **Requirement**: Add 3 Pokémon to favorites
- **Tracks**: Total favorites count
- **Awarded**: Automatically when threshold is reached

### 🌈 Rainbow Badge
- **Requirement**: Search 25 Pokémon
- **Tracks**: Total searches
- **Awarded**: Automatically when threshold is reached

### 👻 Soul Badge
- **Requirement**: Catch 10 random Pokémon
- **Tracks**: Random catches
- **Awarded**: Automatically when threshold is reached

### 🌿 Marsh Badge
- **Requirement**: Add 10 Pokémon to favorites
- **Tracks**: Total favorites count
- **Awarded**: Automatically when threshold is reached

### 🔥 Volcano Badge
- **Requirement**: Search 50 Pokémon
- **Tracks**: Total searches
- **Awarded**: Automatically when threshold is reached

### 🌍 Earth Badge
- **Requirement**: Catch 25 random Pokémon
- **Tracks**: Random catches
- **Awarded**: Automatically when threshold is reached

## How It Works

### Tracking System
The app tracks three main activities:
1. **Searches** - Every Pokemon search (from Pokédex Search screen)
2. **Catches** - Every random Pokemon catch (from Dashboard)
3. **Favorites** - Total number of favorited Pokemon

### Data Storage
**Firestore Collection**: `trainerStats`
**Document ID**: User's Firebase Auth UID

**Fields**:
```javascript
{
  searches: number,      // Total searches
  catches: number,       // Total random catches
  favorites: number,     // Total favorites
  createdAt: timestamp,
  lastSearchAt: timestamp,
  lastCatchAt: timestamp,
  lastFavoriteAt: timestamp
}
```

### Badge Storage
Badges are stored in the trainer profile:
**Collection**: `trainers`
**Field**: `badges` (array of badge IDs)

Example:
```javascript
{
  trainerName: "Ash",
  badges: ["boulder", "water", "thunder"],
  // ... other fields
}
```

## User Experience

### Earning a Badge
1. User performs an action (search, catch, or favorite)
2. System tracks the action in `trainerStats`
3. System checks if any badge thresholds are met
4. If threshold reached, badge is awarded
5. Animated notification appears
6. Badge is added to trainer profile
7. Badge appears on Trainer Dashboard

### Badge Notification
When a badge is earned:
- 🎉 Animated modal appears
- Shows badge emoji and name
- Displays achievement description
- Auto-closes after 3 seconds
- Can be manually closed by tapping

### Viewing Badges
Badges are displayed on the Trainer Dashboard:
- Shows in "Badges Earned" section
- Each badge shows emoji and name
- Only visible if user has earned badges
- Badge count shown in trainer stats

## Technical Implementation

### Services

**badgeService.js** provides:
- `trackSearch(userId)` - Track search and check badges
- `trackCatch(userId)` - Track catch and check badges
- `trackFavorite(userId, totalFavorites)` - Track favorites and check badges
- `checkAndAwardBadges(userId, stats)` - Check all badges
- `getUserStats(userId)` - Get user statistics
- `getAllBadges()` - Get all available badges
- `getBadgeById(badgeId)` - Get specific badge info
- `getBadgeProgress(badge, stats)` - Get progress for a badge

### Components

**BadgeNotification.js**:
- Animated modal component
- Shows when badge is earned
- Spring animation for badge appearance
- Auto-closes after 3 seconds
- Accepts badge object and visibility props

### Integration Points

**1. HomeScreen (Pokédex Search)**
```javascript
// After successful search
const newBadges = await trackSearch(currentUser.uid);
if (newBadges.length > 0) {
  setEarnedBadge(newBadges[0]);
  setShowBadgeModal(true);
}
```

**2. TrainerDashboard (Catch Random)**
```javascript
// After catching random Pokemon
const newBadges = await trackCatch(user.uid);
if (newBadges.length > 0) {
  setEarnedBadge(newBadges[0]);
  setShowBadgeModal(true);
}
```

**3. DetailsScreen (Add Favorite)**
```javascript
// After adding to favorites
const newBadges = await trackFavorite(user.uid, favorites.length + 1);
if (newBadges.length > 0) {
  setEarnedBadge(newBadges[0]);
  setShowBadgeModal(true);
}
```

**4. TrainerDashboard (Display Badges)**
```javascript
{trainerProfile.badges.map((badgeId) => {
  const badge = getBadgeById(badgeId);
  return (
    <View style={styles.badge}>
      <Text>{badge.emoji}</Text>
      <Text>{badge.name}</Text>
    </View>
  );
})}
```

## Firebase Setup

### Firestore Rules
Add to `firestore.rules`:
```javascript
match /trainerStats/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### Collections Structure

**trainerStats/{userId}**:
- Tracks user activity statistics
- Updated on each action
- Used to check badge eligibility

**trainers/{userId}**:
- Contains `badges` array field
- Updated when badges are earned
- Read by dashboard to display badges

## Badge Progression

### Early Game (Beginner)
- 🪨 Boulder Badge (10 searches)
- 💧 Water Badge (5 catches)
- ⚡ Thunder Badge (3 favorites)

### Mid Game (Intermediate)
- 🌈 Rainbow Badge (25 searches)
- 👻 Soul Badge (10 catches)
- 🌿 Marsh Badge (10 favorites)

### Late Game (Advanced)
- 🔥 Volcano Badge (50 searches)
- 🌍 Earth Badge (25 catches)

## Future Enhancements

### Planned Features:
1. **Badge Details Screen**
   - View all badges (earned and locked)
   - Show progress towards each badge
   - Display unlock requirements

2. **Badge Rewards**
   - Unlock special features
   - Exclusive Pokemon access
   - Custom avatars or themes

3. **More Badge Types**
   - Type-specific badges (catch 10 Fire types)
   - Streak badges (7-day login streak)
   - Social badges (share with friends)
   - Collection badges (complete Pokedex regions)

4. **Badge Levels**
   - Bronze, Silver, Gold tiers
   - Upgrade existing badges
   - Higher rewards for higher tiers

5. **Achievements Page**
   - Dedicated screen for all achievements
   - Progress bars for each badge
   - Statistics dashboard
   - Share achievements

6. **Notifications**
   - Push notifications for badge progress
   - "Almost there!" reminders
   - Daily challenge notifications

## Testing

### Test Scenarios:

**1. Search Badge (Boulder)**
- Search 10 different Pokemon
- Verify badge notification appears
- Check badge shows on dashboard

**2. Catch Badge (Water)**
- Catch 5 random Pokemon
- Verify badge notification appears
- Check badge shows on dashboard

**3. Favorite Badge (Thunder)**
- Add 3 Pokemon to favorites
- Verify badge notification appears
- Check badge shows on dashboard

**4. Multiple Badges**
- Earn multiple badges in one session
- Verify each shows notification
- Check all appear on dashboard

**5. Badge Persistence**
- Earn badge, log out, log back in
- Verify badge still shows
- Check stats are maintained

## Troubleshooting

### Badge Not Appearing
1. Check Firestore rules are updated
2. Verify user is authenticated
3. Check console for errors
4. Ensure stats are being tracked

### Stats Not Updating
1. Check network connection
2. Verify Firestore permissions
3. Check console for write errors
4. Ensure user ID is correct

### Notification Not Showing
1. Check if badge was already earned
2. Verify modal state management
3. Check component is rendered
4. Look for JavaScript errors

## Files

### New Files:
- `src/services/badgeService.js` - Badge logic and tracking
- `src/components/BadgeNotification.js` - Badge notification UI

### Modified Files:
- `src/screens/HomeScreen.js` - Track searches
- `src/screens/TrainerDashboard.js` - Track catches, display badges
- `src/screens/DetailsScreen.js` - Track favorites
- `firestore.rules` - Added trainerStats rules

## Summary

The Badge System adds gamification to the Pokemon app, encouraging users to:
- Search for more Pokemon
- Use the random catch feature
- Build their favorites collection
- Engage with the app regularly

Badges provide visual rewards and a sense of progression, making the app more engaging and fun to use!
