# Build Android APK for Secure You

## Prerequisites

1. **Node.js and npm** (Already installed ✓)
2. **Expo CLI** - Install globally:
   ```bash
   npm install -g expo-cli eas-cli
   ```
3. **Expo Account** - Create a free account at https://expo.dev

## Build Options

### Option 1: EAS Build (Cloud Build - Recommended)

This is the easiest method and doesn't require local Android SDK setup.

#### Steps:

1. **Login to Expo**:
   ```bash
   npx eas login
   ```

2. **Configure the project** (if not already done):
   ```bash
   npx eas build:configure
   ```

3. **Build the APK**:
   ```bash
   npx eas build --platform android --profile preview
   ```

4. **Wait for the build** (5-15 minutes):
   - The build happens on Expo's cloud servers
   - You'll get a URL to download the APK when complete
   - You can also check the build status at https://expo.dev

5. **Download and Install**:
   - Download the APK from the provided URL
   - Transfer to your Android device
   - Enable "Install from Unknown Sources" in settings
   - Install the APK

### Option 2: Local Build (Requires Android Studio)

This requires more setup but gives you more control.

#### Prerequisites:
- **Android Studio** with SDK installed
- **Java Development Kit (JDK) 17**
- **Environment variables** configured (ANDROID_HOME, JAVA_HOME)

#### Steps:

1. **Prebuild the native Android project**:
   ```bash
   npx expo prebuild --platform android
   ```

2. **Build the APK locally**:
   ```bash
   cd android
   ./gradlew assembleRelease
   ```
   (On Windows: `.\gradlew.bat assembleRelease`)

3. **Find the APK**:
   - Located at: `android/app/build/outputs/apk/release/app-release.apk`

## Quick Commands

```bash
# Navigate to mobile app directory
cd "c:\Users\user\Downloads\Secure-You-main\Secure-You-main\mobile-new"

# Install dependencies (already done)
npm install

# Build with EAS (recommended)
npx eas build --platform android --profile preview

# Check build status
npx eas build:list

# Start development server
npm start

# Run on Android emulator
npm run android
```

## Testing the App

### On a Physical Device:
1. Install the APK on your Android phone
2. Make sure you have internet connection
3. The app will connect to your Supabase backend

### On Emulator:
1. Install Android Studio
2. Create a virtual device
3. Run: `npm run android`

## Troubleshooting

### "Network error" when using the app:
- Make sure your Supabase credentials are correct in the config files
- Check that your backend is running

### Build fails:
- Make sure you're logged into Expo: `npx eas login`
- Check your app.json configuration
- Verify all dependencies are installed

### APK won't install:
- Enable "Install from Unknown Sources" on your Android device
- Make sure you downloaded the complete APK file

## Production Build

For a production-ready build to publish on Play Store:

```bash
npx eas build --platform android --profile production
```

Then submit to Google Play:
```bash
npx eas submit --platform android
```

## Support

- Expo Documentation: https://docs.expo.dev
- EAS Build: https://docs.expo.dev/build/setup/
- React Native: https://reactnative.dev
