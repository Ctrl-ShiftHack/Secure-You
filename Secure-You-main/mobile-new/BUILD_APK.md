# 📱 Build APK - Complete Guide

## Prerequisites

1. **Node.js** installed (v18 or higher)
2. **Expo Account** (free) - Sign up at expo.dev
3. **EAS CLI** installed globally

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install EAS CLI

```bash
npm install -g eas-cli
```

### Step 2: Login to Expo

```bash
eas login
```

Enter your Expo credentials (or create account at expo.dev)

### Step 3: Build APK

```bash
cd mobile-new
eas build --platform android --profile preview
```

✅ **Done!** Your APK will be built in the cloud (5-10 minutes)

---

## 📋 Detailed Instructions

### 1. **Setup Expo Account**

```bash
# Login to Expo
eas login

# Or create new account
eas register
```

### 2. **Configure Project**

```bash
# Initialize EAS in your project
eas build:configure
```

This will:
- Create `eas.json` (already provided)
- Link your project to Expo
- Generate project ID

### 3. **Create App Icons** (Important!)

Before building, you need app icons:

#### Option A: Quick Setup (Recommended)
```bash
# Use your logo to generate all icons
# Visit: https://www.appicon.co/
# Upload: assets/images/logo-light.png
# Download and replace in assets/images/
```

#### Option B: Use Existing (Temporary)
```bash
# Copy logo as temporary icon
cp assets/images/logo-light.png assets/images/icon.png
cp assets/images/logo-light.png assets/images/adaptive-icon.png
cp assets/images/logo-light.png assets/images/splash.png
```

### 4. **Build APK**

#### For Testing (Preview Build):
```bash
eas build --platform android --profile preview
```

#### For Production Release:
```bash
eas build --platform android --profile production
```

### 5. **Download APK**

After build completes:
- Open link provided in terminal
- Or visit: https://expo.dev/accounts/[your-account]/projects/secure-you/builds
- Download APK file
- Install on Android device

---

## 🎯 Build Profiles

### Preview (Testing):
- **Build Type**: APK
- **Distribution**: Internal testing
- **Signed**: Yes (auto-signed by Expo)
- **Use For**: Testing on devices

### Production (Release):
- **Build Type**: APK or AAB
- **Distribution**: Google Play Store
- **Signed**: Yes (your keystore)
- **Use For**: Publishing to store

---

## 🔧 Troubleshooting

### Error: "No credentials found"
```bash
# Configure credentials
eas credentials
```

### Error: "Icon not found"
```bash
# Make sure these files exist:
ls -la assets/images/icon.png
ls -la assets/images/adaptive-icon.png
ls -la assets/images/splash.png
```

### Error: "Build failed"
```bash
# Check build logs
eas build:list
# Click on failed build to see logs
```

---

## 📦 What Gets Built

Your APK will include:
- ✅ All app screens (Login, Register, Contacts, etc.)
- ✅ All dependencies (React Native, Expo Router, etc.)
- ✅ All assets (images, fonts)
- ✅ Biometric authentication support
- ✅ Network permissions
- ✅ Signed and ready to install

**File Size**: ~40-60 MB

---

## 🚀 Alternative: Local Build (Advanced)

If you want to build locally without Expo servers:

### Install Android Studio:
1. Download from developer.android.com
2. Install Android SDK
3. Set up environment variables

### Build Locally:
```bash
# Generate native Android project
npx expo prebuild

# Build APK with Gradle
cd android
./gradlew assembleRelease
```

**APK Location**: `android/app/build/outputs/apk/release/app-release.apk`

---

## 📱 Install APK on Device

### Method 1: Direct Install
1. Transfer APK to Android device
2. Open file
3. Allow "Install from unknown sources"
4. Install app

### Method 2: ADB Install
```bash
# Connect device via USB
adb devices

# Install APK
adb install path/to/app.apk
```

---

## ⏱️ Build Time Estimates

| Build Type | Time | Server |
|------------|------|--------|
| Preview APK | 5-10 min | Expo Cloud |
| Production APK | 10-15 min | Expo Cloud |
| Local Build | 3-5 min | Your Computer |

---

## 🎉 Success Checklist

After successful build:
- ✅ APK file downloaded
- ✅ File size ~40-60 MB
- ✅ Can install on Android device
- ✅ App opens and shows splash screen
- ✅ Can navigate all screens
- ✅ Login/Register works
- ✅ Contacts screen loads

---

## 🔐 App Signing

### For Testing (Auto-signed):
- Expo handles signing automatically
- No setup needed
- Use for internal testing

### For Production (Your Keystore):
```bash
# Generate keystore
keytool -genkey -v -keystore secure-you.keystore \
  -alias secure-you -keyalg RSA -keysize 2048 -validity 10000

# Configure in eas.json
eas credentials
```

---

## 📊 Build Status

Check your builds:
```bash
# List all builds
eas build:list

# View specific build
eas build:view [build-id]

# Cancel running build
eas build:cancel
```

---

## 🌐 Publish Updates (OTA)

After publishing APK, you can push updates:
```bash
# Publish update (no new APK needed)
eas update --branch production --message "Bug fixes"
```

Users get updates automatically without reinstalling!

---

## 💡 Pro Tips

1. **Test Preview Build First**: Always test preview build before production
2. **Check Icon Sizes**: Make sure icons are correct sizes
3. **Test on Real Device**: Emulator may not show all issues
4. **Enable Auto-Updates**: Users get bug fixes automatically
5. **Monitor Build Queue**: Builds may queue during peak times

---

## 📞 Support

- **Expo Docs**: docs.expo.dev
- **EAS Build**: docs.expo.dev/build/introduction
- **Discord**: expo.dev/discord
- **Forums**: forums.expo.dev

---

## 🎯 Next Steps After APK Build

1. ✅ Test APK on multiple devices
2. ✅ Check all features work offline
3. ✅ Test biometric login
4. ✅ Verify API connections
5. ✅ Test emergency contacts
6. ✅ Prepare for Play Store submission

---

**🎉 Ready to build your Secure You APK!**

Run: `eas build --platform android --profile preview`

And wait 5-10 minutes for your APK! 🚀
