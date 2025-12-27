# Trainer Profile Feature

## Overview
This feature allows users to create a Trainer Identity when they first register for the app, similar to starting a Pokemon game.

## What's Included

### 1. Trainer Registration Screen
**Location:** `src/screens/TrainerRegistrationScreen.js`

When a user signs up, they're prompted to create their Trainer Card with:
- **Trainer Name**: Custom name (3-20 characters)
- **Avatar Selection**: 6 avatar options (male, female, neutral)
- **Home Region**: Choose from 9 Pokemon regions (Kanto, Johto, Hoenn, Sinnoh, Unova, Kalos, Alola, Galar, Paldea)

### 2. Trainer Service
**Location:** `src/services/trainerService.js`

Firebase Firestore integration for trainer profiles:
- `createTrainerProfile()` - Creates new trainer profile
- `getTrainerProfile()` - Retrieves trainer data
- `updateTrainerProfile()` - Updates trainer info
- `trainerProfileExists()` - Checks if profile exists
- `addBadge()` - Add gym badges (for future features)
- `incrementPokemonCaught()` - Track caught Pokemon count

### 3. Updated Navigation Flow
**Location:** `src/navigation/AppNavigator.js`

New flow:
1. User signs up → TrainerRegistration screen
2. User logs in → Check if trainer profile exists
   - If yes → Home screen
   - If no → TrainerRegistration screen

### 4. Firebase Structure

**Collection:** `trainers`
**Document ID:** User's Firebase Auth UID

**Fields:**
```javascript
{
  trainerName: string,
  avatar: string,
  region: string,
  badges: array,
  pokemonCaught: number,
  favoritePokemon: array,
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## User Experience

### First Time Registration
1. User opens app
2. Clicks "Sign Up"
3. Enters email, password, username
4. After successful signup, sees: **"Welcome Trainer! Let's create your Trainer Card"**
5. Chooses trainer name, avatar, and region
6. Clicks "Start Your Journey!"
7. Redirected to Home screen

### Returning User Login
1. User logs in
2. System checks for trainer profile
3. If profile exists → Home screen
4. If no profile → Trainer Registration (for legacy users)

## Future Enhancements

The trainer profile is designed to support:
- **Gym Badges**: Track progress through different regions
- **Pokemon Caught Counter**: Automatically increment when catching Pokemon
- **Favorite Pokemon**: Store user's favorite Pokemon
- **Trainer Stats**: Battles won, distance traveled, etc.
- **Trainer Card Display**: Show full trainer card in Profile screen

## Testing

To test the feature:
1. Create a new account
2. Complete trainer registration
3. Log out and log back in
4. Verify you go directly to Home (not registration again)

## Notes

- Avatars currently use emoji (👨👩🧒) for simplicity
- Can be replaced with custom trainer sprite images later
- Trainer profile is stored separately from user auth profile
- All Firebase operations include error handling
