# 🎮 Pokemon Trainer App

A React Native mobile application for Pokemon trainers to catch, collect, and manage their Pokemon journey!

## ✨ Features

- 🔐 **User Authentication** - Beautiful login and registration screens with Firebase Auth
- 👤 **Trainer Profile** - Create and customize your trainer profile
- 🎯 **Catch Mode** - Interactive Pokemon catching experience
- 📊 **Trainer Dashboard** - View your Pokemon collection and stats
- 🏆 **Badge System** - Earn and display trainer badges
- 📱 **Responsive Design** - Optimized for various screen sizes
- 🎨 **Modern UI** - Gradient backgrounds and smooth animations

## 🛠️ Tech Stack

- **React Native** 0.82.1
- **React Navigation** - Bottom tabs and stack navigation
- **Firebase** - Authentication, Firestore, and Storage
- **React Native Linear Gradient** - Beautiful gradient effects
- **React Native Vector Icons** - Icon library
- **Axios** - HTTP client for Pokemon API

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (>= 20)
- npm or yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development - macOS only)
- Java Development Kit (JDK)

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nilakshgaonkar/PokemonApp.git
cd PokemonApp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Firebase Setup

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Authentication (Email/Password)
3. Create a Firestore database
4. Enable Storage

**For Android:**
- Download `google-services.json` from Firebase Console
- Place it in `android/app/` directory

**For iOS:**
- Download `GoogleService-Info.plist` from Firebase Console
- Add it to your Xcode project

### 4. Install iOS dependencies (macOS only)

```bash
cd ios
pod install
cd ..
```

### 5. Run the app

**For Android:**
```bash
npm run android
```

**For iOS:**
```bash
npm run ios
```

## 📱 App Structure

```
PokemonApp/
├── src/
│   ├── screens/          # App screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── TrainerRegistrationScreen.js
│   │   ├── CatchModeScreen.js
│   │   └── TrainerDashboardScreen.js
│   ├── services/         # API and Firebase services
│   │   ├── auth.js
│   │   ├── trainerService.js
│   │   └── pokemonService.js
│   ├── navigation/       # Navigation configuration
│   └── components/       # Reusable components
├── android/              # Android native code
├── ios/                  # iOS native code
└── App.tsx              # Root component
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the root directory (if needed for additional configs):

```env
API_URL=https://pokeapi.co/api/v2
```

### Firestore Rules

Update your Firestore security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /trainers/{trainerId} {
      allow read, write: if request.auth != null && request.auth.uid == trainerId;
    }
    match /caughtPokemon/{pokemonId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🎨 UI Improvements

Recent UI enhancements include:
- Gradient backgrounds for authentication screens
- Enhanced input fields with focus states
- Improved button designs with gradients
- Better error handling and display
- Responsive layouts for all screen sizes

See [AUTH_UI_IMPROVEMENTS.md](AUTH_UI_IMPROVEMENTS.md) for details.

## 🐛 Troubleshooting

### Metro Bundler Issues
```bash
npx react-native start --reset-cache
```

### Android Build Issues
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Issues
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## 📝 Available Scripts

- `npm start` - Start Metro bundler
- `npm run android` - Run on Android
- `npm run ios` - Run on iOS
- `npm test` - Run tests
- `npm run lint` - Run ESLint

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- [PokeAPI](https://pokeapi.co/) for Pokemon data
- [React Native](https://reactnative.dev/) community
- [Firebase](https://firebase.google.com/) for backend services

## 📧 Contact

Your Name - [@your_twitter](https://twitter.com/your_twitter)

Project Link: [https://github.com/nilakshgaonkar/PokemonApp](https://github.com/YOUR_USERNAME/PokemonApp)

---

Made with ❤️ by Pokemon Trainers, for Pokemon Trainers
