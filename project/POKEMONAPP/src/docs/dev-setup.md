# Development Setup Guide

## Running Metro Bundler

Metro is the JavaScript bundler for React Native. You can run it in several ways:

### Start Metro
```bash
npm start
# or
npx react-native start
```

### Start Metro with cache cleared
```bash
npm start -- --reset-cache
```

### Start Metro on a specific port
```bash
npm start -- --port 8082
```

### Common Metro Commands
- **Clear cache and restart**: `npm start -- --reset-cache`
- **Run in verbose mode**: `npm start -- --verbose`
- **Run on custom port**: `npm start -- --port <PORT>`

## Common Android Errors

### SDK Errors

#### Error: SDK location not found
**Solution:**
1. Set `ANDROID_HOME` environment variable:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk
   export PATH=$PATH:$ANDROID_HOME/emulator
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   export PATH=$PATH:$ANDROID_HOME/tools
   export PATH=$PATH:$ANDROID_HOME/tools/bin
   ```
2. Add to `~/.zshrc` or `~/.bash_profile` for persistence
3. Verify: `echo $ANDROID_HOME`

#### Error: Android SDK not found
**Solution:**
1. Install Android Studio
2. Open Android Studio → Preferences → Appearance & Behavior → System Settings → Android SDK
3. Note the SDK location (usually `~/Library/Android/sdk`)
4. Install required SDK platforms and build tools

#### Error: Build tools not found
**Solution:**
```bash
# Install via Android Studio SDK Manager or command line
sdkmanager "build-tools;33.0.0" "platforms;android-33"
```

### Gradle Errors

#### Error: No space left on device
**Solution:**
1. Clean build artifacts:
   ```bash
   cd android
   ./gradlew clean
   cd ..
   rm -rf android/build android/app/build android/.gradle
   ```
2. Clear Gradle cache:
   ```bash
   rm -rf ~/.gradle/caches
   ```
3. Reduce build architectures in `android/gradle.properties`:
   ```
   reactNativeArchitectures=arm64-v8a
   ```
4. Free up disk space (see general tips below)

#### Error: Gradle daemon failed
**Solution:**
1. Stop all Gradle daemons:
   ```bash
   cd android
   ./gradlew --stop
   ```
2. Disable daemon in `android/gradle.properties`:
   ```
   org.gradle.daemon=false
   ```
3. Run with `--no-daemon` flag:
   ```bash
   ./gradlew build --no-daemon
   ```

#### Error: Gradle sync failed
**Solution:**
1. Clean project:
   ```bash
   cd android
   ./gradlew clean
   ```
2. Delete `.gradle` folder:
   ```bash
   rm -rf .gradle
   ```
3. Rebuild:
   ```bash
   ./gradlew build
   ```

#### Error: CMake or NDK not found
**Solution:**
1. Install NDK via Android Studio SDK Manager
2. Set `ANDROID_NDK_HOME`:
   ```bash
   export ANDROID_NDK_HOME=$ANDROID_HOME/ndk/<version>
   ```
3. Or specify in `android/local.properties`:
   ```
   ndk.dir=/path/to/ndk
   ```

## Port Issues

### Error: Port 8081 already in use

**Solution 1: Kill the process using the port**
```bash
# Find process using port 8081
lsof -ti:8081

# Kill the process
kill -9 $(lsof -ti:8081)

# Or on Windows
netstat -ano | findstr :8081
taskkill /PID <PID> /F
```

**Solution 2: Use a different port**
```bash
# Start Metro on different port
npm start -- --port 8082

# Then run Android with custom port
npm run android -- --port 8082
```

**Solution 3: Reset Metro cache**
```bash
npm start -- --reset-cache --port 8081
```

### Error: ADB server port (5037) in use

**Solution:**
```bash
# Kill ADB server
adb kill-server

# Restart ADB
adb start-server

# Or kill the specific process
kill -9 $(lsof -ti:5037)
```

## Permission Issues

### Error: Permission denied (Android)

**Solution:**
1. Check file permissions:
   ```bash
   chmod +x android/gradlew
   ```
2. Check Android device permissions:
   - Enable USB debugging
   - Allow installation from unknown sources (if needed)
   - Check device developer options

### Error: Permission denied (Metro/Node)

**Solution:**
```bash
# Fix npm permissions (avoid using sudo)
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Or use nvm to avoid permission issues
```

### Error: EACCES permission denied (macOS)

**Solution:**
```bash
# Fix permissions for project directory
sudo chown -R $(whoami) /path/to/PokemonApp

# Fix Android SDK permissions
sudo chown -R $(whoami) $ANDROID_HOME
```

## General Troubleshooting Tips

### Free Up Disk Space
```bash
# Clean Android builds
cd android && ./gradlew clean && cd ..
rm -rf android/build android/app/build

# Clean Gradle cache
rm -rf ~/.gradle/caches

# Clean npm cache
npm cache clean --force

# Clean Xcode derived data
rm -rf ~/Library/Developer/Xcode/DerivedData

# Clean iOS build
rm -rf ios/build ios/Pods
```

### Reset Everything
```bash
# Clean all caches and builds
npm cache clean --force
rm -rf node_modules
rm -rf android/build android/app/build android/.gradle
rm -rf ios/build ios/Pods ios/Podfile.lock
npm install
cd ios && pod install && cd ..
```

### Verify Setup
```bash
# Check Node version (should be >= 20)
node --version

# Check React Native CLI
npx react-native --version

# Check Android setup
adb devices
echo $ANDROID_HOME

# Check Java version (should be 17 or 21)
java -version
```

## Quick Reference

| Issue | Quick Fix |
|-------|-----------|
| Metro won't start | `npm start -- --reset-cache` |
| Port in use | `kill -9 $(lsof -ti:8081)` |
| Gradle build fails | `cd android && ./gradlew clean` |
| No space on device | Clean build artifacts, reduce architectures |
| SDK not found | Set `ANDROID_HOME` environment variable |
| Permission denied | `chmod +x android/gradlew` |

