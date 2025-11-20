# SecureYou Mobile App Setup Guide

## Prerequisites
- Node.js 18+ installed
- iOS: Mac with Xcode
- Android: Android Studio
- Expo Go app (for testing)

## Initial Setup

### 1. Install Dependencies
```bash
cd mobile-new
npm install
```

### 2. Configure Environment
Edit `.env` file with your Supabase credentials:
```
EXPO_PUBLIC_SUPABASE_URL=https://xgytbxirkeqkstofupvd.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Run Development Server
```bash
# Start Expo
npm start

# Or run directly on device
npm run android  # For Android
npm run ios      # For iOS (Mac only)
```

## Testing on Physical Device

### Method 1: Expo Go (Quickest)
1. Install Expo Go from App Store/Play Store
2. Run `npm start`
3. Scan QR code with:
   - iOS: Camera app
   - Android: Expo Go app

### Method 2: Development Build (Recommended for Production)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login to Expo
eas login

# Configure project
eas build:configure

# Build for device
eas build --platform android --profile development
eas build --platform ios --profile development
```

## Building for Production

### Android APK
```bash
eas build --platform android --profile production
```

### iOS App Store
```bash
# Requires Apple Developer Account ($99/year)
eas build --platform ios --profile production
eas submit --platform ios
```

### Google Play Store
```bash
eas build --platform android --profile production
eas submit --platform android
```

## Project Structure
```
mobile-new/
├── app/
│   ├── (auth)/          # Login & Register screens
│   ├── (app)/           # Main app screens (Home, Contacts, Incidents, Profile)
│   └── _layout.tsx      # Root navigation
├── contexts/
│   └── AuthContext.tsx  # Authentication state
├── lib/
│   └── supabase.ts      # Supabase client
├── types/
│   └── database.types.ts # TypeScript types
└── .env                 # Environment variables
```

## Key Features Implemented
✅ User authentication (Login/Register)
✅ Home screen with SOS button
✅ Emergency contacts management
✅ Incident reporting (view posts)
✅ User profile & settings
✅ Supabase integration
✅ Tab navigation

## Next Steps
1. Add Supabase anon key to `.env`
2. Test authentication flow
3. Enable location permissions
4. Test SOS functionality
5. Build and test on real device

## Troubleshooting

### "Unable to resolve module"
```bash
npm install
npx expo start --clear
```

### Metro bundler issues
```bash
rm -rf node_modules
npm install
npx expo start --clear
```

### iOS build issues
- Ensure Xcode is up to date
- Run `npx pod-install` in ios/ folder

### Android build issues
- Ensure Android Studio SDK is configured
- Check Java version (needs Java 11+)

## Publishing

### Expo Updates (OTA)
```bash
eas update --auto
```

### Store Submission Checklist
- [ ] App icons (all sizes)
- [ ] Splash screen
- [ ] Privacy policy URL
- [ ] App description
- [ ] Screenshots
- [ ] Version number updated
- [ ] Store listing ready

## Resources
- [Expo Documentation](https://docs.expo.dev/)
- [React Native Paper](https://reactnativepaper.com/)
- [Supabase React Native](https://supabase.com/docs/guides/getting-started/tutorials/with-expo-react-native)
