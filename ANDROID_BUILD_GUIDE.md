# 📱 Android APK Build Guide - SecureYou

Complete guide to build a production-ready Android APK from this project.

---

## 📋 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```powershell
   node --version  # Should be v18+
   ```

2. **Java Development Kit (JDK) 17**
   - Download: https://adoptium.net/temurin/releases/?version=17
   - Set `JAVA_HOME` environment variable
   ```powershell
   # Verify installation
   java -version
   ```

3. **Android Studio**
   - Download: https://developer.android.com/studio
   - Install Android SDK (API 33+)
   - Install Android SDK Build-Tools
   - Install Android SDK Command-line Tools

4. **Gradle** (comes with Android Studio)
   ```powershell
   # Verify installation
   gradle --version
   ```

### Environment Variables Setup

```powershell
# Set JAVA_HOME (adjust path to your JDK installation)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"

# Set ANDROID_HOME
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"

# Add to PATH
$env:Path += ";$env:JAVA_HOME\bin"
$env:Path += ";$env:ANDROID_HOME\platform-tools"
$env:Path += ";$env:ANDROID_HOME\tools"
$env:Path += ";$env:ANDROID_HOME\build-tools\33.0.0"

# Verify
echo $env:JAVA_HOME
echo $env:ANDROID_HOME
```

**Make these permanent:**
1. Open System Properties → Environment Variables
2. Add `JAVA_HOME` and `ANDROID_HOME` to System Variables
3. Update `Path` variable

---

## 🚀 Quick Build (One Command)

```powershell
# Navigate to project
cd C:\Users\user\Downloads\Secure-You-main

# Build APK (runs all steps automatically)
npm run android:build

# Or for release build
npm run android:build:release
```

The APK will be located at:
- **Debug:** `android\app\build\outputs\apk\debug\app-debug.apk`
- **Release:** `android\app\build\outputs\apk\release\app-release-unsigned.apk`

---

## 📝 Step-by-Step Build Process

### Step 1: Install Dependencies

```powershell
cd C:\Users\user\Downloads\Secure-You-main

# Install Node.js dependencies
npm install

# Install Capacitor CLI globally (optional)
npm install -g @capacitor/cli
```

### Step 2: Build Web Assets

```powershell
# Build production web assets
npm run build

# Verify dist/ folder was created
ls dist
```

**Expected output:**
- `dist/index.html`
- `dist/assets/` folder with JS/CSS bundles

### Step 3: Sync Capacitor (Copy Web Assets to Android)

```powershell
# Sync web assets to Android project
npx cap sync android

# Or use npm script
npm run android:sync
```

This copies `dist/` contents to `android/app/src/main/assets/public/`

### Step 4: Open Android Studio (Optional)

```powershell
# Open Android project in Android Studio
npx cap open android

# Or use npm script
npm run android:open
```

**In Android Studio:**
1. Wait for Gradle sync to complete
2. Build → Make Project
3. Build → Build Bundle(s) / APK(s) → Build APK(s)

### Step 5: Build APK via Command Line

```powershell
# Navigate to android directory
cd android

# Build Debug APK
.\gradlew assembleDebug

# Build Release APK
.\gradlew assembleRelease

# Clean build (if needed)
.\gradlew clean assembleDebug
```

### Step 6: Locate the APK

**Debug APK:**
```
android\app\build\outputs\apk\debug\app-debug.apk
```

**Release APK (unsigned):**
```
android\app\build\outputs\apk\release\app-release-unsigned.apk
```

---

## 🔐 Signing the APK (Production)

For production release, you need to sign the APK.

### Step 1: Generate Keystore

```powershell
# Navigate to android/app
cd android\app

# Generate keystore
keytool -genkey -v -keystore secureyou-release-key.keystore `
  -alias secureyou `
  -keyalg RSA `
  -keysize 2048 `
  -validity 10000

# Enter password and details when prompted
```

**Save this information securely:**
- Keystore file: `secureyou-release-key.keystore`
- Alias: `secureyou`
- Password: (whatever you entered)

### Step 2: Configure Signing

Create `android/app/keystore.properties`:

```properties
storeFile=secureyou-release-key.keystore
storePassword=YOUR_KEYSTORE_PASSWORD
keyAlias=secureyou
keyPassword=YOUR_KEY_PASSWORD
```

**⚠️ IMPORTANT:** Add to `.gitignore`:
```gitignore
# Keystore (never commit!)
*.keystore
keystore.properties
```

### Step 3: Update build.gradle

Edit `android/app/build.gradle`:

```gradle
// Add before android { } block
def keystorePropertiesFile = rootProject.file("app/keystore.properties")
def keystoreProperties = new Properties()
if (keystorePropertiesFile.exists()) {
    keystoreProperties.load(new FileInputStream(keystorePropertiesFile))
}

android {
    // ... existing config ...

    signingConfigs {
        release {
            if (keystorePropertiesFile.exists()) {
                keyAlias keystoreProperties['keyAlias']
                keyPassword keystoreProperties['keyPassword']
                storeFile file(keystoreProperties['storeFile'])
                storePassword keystoreProperties['storePassword']
            }
        }
    }

    buildTypes {
        release {
            signingConfig signingConfigs.release
            minifyEnabled true
            proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
        }
    }
}
```

### Step 4: Build Signed APK

```powershell
cd android
.\gradlew assembleRelease

# Signed APK will be at:
# android\app\build\outputs\apk\release\app-release.apk
```

---

## 📦 Build Android App Bundle (AAB) for Google Play

Google Play requires AAB format (not APK).

```powershell
cd android

# Build AAB
.\gradlew bundleRelease

# AAB will be at:
# android\app\build\outputs\bundle\release\app-release.aab
```

**Upload to Google Play Console:**
1. Go to https://play.google.com/console
2. Create app or select existing
3. Release → Production → Create release
4. Upload `app-release.aab`
5. Fill in release notes
6. Review and rollout

---

## 🔧 Troubleshooting

### "JAVA_HOME not set"
```powershell
# Check JAVA_HOME
echo $env:JAVA_HOME

# Set it if missing
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.x"
```

### "SDK location not found"
Create `android/local.properties`:
```properties
sdk.dir=C:\\Users\\user\\AppData\\Local\\Android\\Sdk
```

### "Gradle build failed"
```powershell
# Clean and rebuild
cd android
.\gradlew clean
.\gradlew assembleDebug --stacktrace
```

### "Capacitor not synced"
```powershell
# Re-sync
npx cap sync android --force
```

### "Build tools not found"
Open Android Studio → SDK Manager → SDK Tools → Install:
- Android SDK Build-Tools 33.0.0+
- Android SDK Command-line Tools
- Android SDK Platform-Tools

### "Out of memory" during build
Edit `android/gradle.properties`:
```properties
org.gradle.jvmargs=-Xmx4096m -XX:MaxPermSize=512m -XX:+HeapDumpOnOutOfMemoryError
```

---

## 📱 Testing the APK

### Install on Physical Device

1. **Enable Developer Mode:**
   - Settings → About Phone
   - Tap "Build Number" 7 times
   - Developer Options unlocked

2. **Enable USB Debugging:**
   - Settings → Developer Options
   - Enable "USB Debugging"

3. **Install APK:**
   ```powershell
   # Connect device via USB
   adb devices  # Verify device connected

   # Install APK
   adb install android\app\build\outputs\apk\debug\app-debug.apk

   # Or install release
   adb install android\app\build\outputs\apk\release\app-release.apk
   ```

### Install via File Manager

1. Copy APK to phone (USB, email, cloud)
2. Open file manager on phone
3. Tap the APK file
4. Allow "Install from Unknown Sources" if prompted
5. Install

### Test on Emulator

```powershell
# Create emulator in Android Studio
# Or use CLI:
avdmanager create avd -n Pixel_5 -k "system-images;android-33;google_apis;x86_64"

# Start emulator
emulator -avd Pixel_5

# Install APK
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

---

## ✅ Pre-Release Checklist

Before building production APK:

### App Configuration
- [ ] Update version in `package.json`
- [ ] Update `versionCode` and `versionName` in `android/app/build.gradle`
- [ ] Update app name in `capacitor.config.ts`
- [ ] Set correct `appId` (e.g., `com.yourcompany.secureyou`)

### Permissions (android/app/src/main/AndroidManifest.xml)
- [ ] Verify all required permissions are declared
- [ ] Remove unused permissions
- [ ] Add permission descriptions

### Icons & Splash Screen
- [ ] Replace app icon: `android/app/src/main/res/mipmap-*/ic_launcher.png`
- [ ] Replace splash screen: `android/app/src/main/res/drawable/splash.png`
- [ ] Generate adaptive icons: `android/app/src/main/res/mipmap-*/ic_launcher_foreground.png`

### Build Configuration
- [ ] Set `minSdkVersion` (minimum 22)
- [ ] Set `targetSdkVersion` (33+)
- [ ] Enable ProGuard for release builds
- [ ] Configure signing with keystore

### Testing
- [ ] Test on multiple Android versions (8.0+)
- [ ] Test on different screen sizes
- [ ] Test all features (SOS, GPS, contacts, etc.)
- [ ] Test offline functionality
- [ ] Test permissions (location, camera, etc.)

### Security
- [ ] Remove console.log statements (or disable in production)
- [ ] Verify API keys are not hardcoded
- [ ] Enable HTTPS only
- [ ] Test security policies

### Performance
- [ ] Optimize images
- [ ] Enable code splitting
- [ ] Test app size (<50MB recommended)
- [ ] Test cold start time (<3 seconds)

---

## 📊 Build Output Summary

After successful build:

### Debug APK
- **Location:** `android/app/build/outputs/apk/debug/app-debug.apk`
- **Size:** ~15-25 MB
- **Use:** Testing, development
- **Signature:** Debug key (auto-generated)

### Release APK
- **Location:** `android/app/build/outputs/apk/release/app-release.apk`
- **Size:** ~10-20 MB (smaller due to minification)
- **Use:** Production distribution (not Google Play)
- **Signature:** Your release keystore

### Release AAB
- **Location:** `android/app/build/outputs/bundle/release/app-release.aab`
- **Size:** ~10-20 MB
- **Use:** Google Play Store upload
- **Signature:** Your release keystore

---

## 🚀 Deployment Options

### Option 1: Direct APK Distribution
- Share APK file directly
- Users download and install
- Requires "Unknown Sources" permission
- Good for: Beta testing, internal distribution

### Option 2: Google Play Store
- Upload AAB to Play Console
- Automatic updates
- Wider reach
- Good for: Public release

### Option 3: Alternative Stores
- Amazon Appstore
- Samsung Galaxy Store
- APKPure, F-Droid
- Upload APK or AAB

---

## 📝 Version Management

Update these before each release:

### package.json
```json
{
  "version": "1.0.0"
}
```

### android/app/build.gradle
```gradle
android {
    defaultConfig {
        versionCode 1      // Increment for each release
        versionName "1.0.0"  // User-visible version
    }
}
```

**Version scheme:**
- `versionCode`: Integer, increment by 1 for each release
- `versionName`: String, semantic versioning (1.0.0, 1.0.1, 1.1.0, etc.)

---

## 🎉 Success!

You now have a production-ready Android APK!

**Next steps:**
1. Test thoroughly on real devices
2. Sign the APK with your keystore
3. Upload to Google Play Console
4. Submit for review
5. Publish to the world! 🚀

---

**Need help?** Common commands:

```powershell
# Full build from scratch
npm install ; npm run build ; npx cap sync android ; cd android ; .\gradlew assembleRelease

# Quick rebuild (after code changes)
npm run build ; npx cap sync android ; cd android ; .\gradlew assembleDebug

# Clean everything and rebuild
cd android ; .\gradlew clean ; cd .. ; npm run build ; npx cap sync android ; cd android ; .\gradlew assembleDebug
```
