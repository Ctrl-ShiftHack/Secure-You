# Quick APK Build Guide - Secure You Mobile App

## 🚀 Fastest Method: Use EAS Build (Cloud Build)

This method doesn't require Android Studio and works on any computer.

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```
- If you don't have an account, create one at https://expo.dev (it's free!)
- Enter your username and password

### Step 3: Build the APK
```bash
cd "c:\Users\user\Downloads\Secure-You-main\Secure-You-main\mobile-new"
eas build --platform android --profile preview
```

### Step 4: Wait and Download
- The build will take 5-15 minutes
- You'll get a URL to download the APK
- Or check: https://expo.dev/accounts/YOUR_USERNAME/projects/secure-you/builds

### Step 5: Install on Phone
- Download the APK to your phone or transfer it
- Enable "Install from Unknown Sources" in Android settings
- Tap the APK to install

---

## 📱 Alternative: Local Build (Requires Android Studio)

### Prerequisites:
1. **Install Android Studio**: https://developer.android.com/studio
2. **Install Java JDK 17**: https://www.oracle.com/java/technologies/downloads/

### Steps:

1. **Prebuild the Android project**:
```bash
cd "c:\Users\user\Downloads\Secure-You-main\Secure-You-main\mobile-new"
npx expo prebuild --platform android
```

2. **Build the APK**:
```bash
cd android
.\gradlew assembleRelease
```

3. **Find your APK**:
```
android\app\build\outputs\apk\release\app-release.apk
```

---

## 🔧 Testing Without Building

You can test the app without building an APK:

### Method 1: Expo Go App (Easiest)
1. Install "Expo Go" from Play Store
2. Run: `npm start` in the mobile-new directory
3. Scan the QR code with Expo Go app

### Method 2: Development Build on Phone
1. Connect your Android phone via USB
2. Enable USB Debugging in Developer Options
3. Run: `npm run android`

---

## 📦 What's in This Build?

Your APK will include:
- ✅ Full authentication (signup/login/logout)
- ✅ User profile management
- ✅ Emergency SOS features
- ✅ Contact management
- ✅ Location tracking
- ✅ Dashboard with quick actions
- ✅ Offline support

---

## 🐛 Troubleshooting

### "eas: command not found"
```bash
npm install -g eas-cli
```

### "Not logged in"
```bash
eas login
```

### "Build failed"
1. Check your internet connection
2. Make sure you're in the mobile-new directory
3. Try: `npm install` first
4. Check build logs on expo.dev

### "APK won't install"
1. Go to Settings → Security → Enable "Unknown Sources"
2. Or Settings → Apps → Special Access → Install Unknown Apps
3. Enable for your file manager/browser

---

## 🎯 Quick Command Summary

```bash
# Navigate to mobile app
cd "c:\Users\user\Downloads\Secure-You-main\Secure-You-main\mobile-new"

# Install dependencies
npm install

# Build APK (cloud)
eas build --platform android --profile preview

# Check build status
eas build:list

# Test locally (no APK needed)
npm start
```

---

## 📲 After Installation

1. **Open the app** on your Android device
2. **Allow permissions** when prompted (location, notifications)
3. **Sign up** for a new account or **login**
4. **Add emergency contacts** in the Contacts section
5. **Test the SOS button** (it won't actually send alerts in test mode)

---

## 🚀 Production Release

When ready to publish to Google Play Store:

```bash
# Build production APK
eas build --platform android --profile production

# Submit to Play Store (requires Google Play Developer account)
eas submit --platform android
```

---

## 💡 Tips

- **First build takes longer** (10-15 min) - subsequent builds are faster
- **Free Expo account** gives you limited builds per month
- **APK size** will be around 50-70 MB
- **Test thoroughly** before distributing to users

---

## 📞 Need Help?

- Expo Documentation: https://docs.expo.dev
- EAS Build Docs: https://docs.expo.dev/build/setup/
- Expo Forum: https://forums.expo.dev

---

**You're all set! 🎉**

Your Secure You app is ready to be built and installed on Android devices.
