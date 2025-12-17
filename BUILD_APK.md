# Build Android APK for SecureYou

## Prerequisites

1. **Install Java Development Kit (JDK) 17**
   - Download: https://adoptium.net/temurin/releases/
   - Install and set JAVA_HOME environment variable

2. **Install Android Studio** (Optional - only if you want to use GUI)
   - Download: https://developer.android.com/studio
   - During installation, ensure Android SDK is installed

3. **Install Android SDK Command Line Tools** (Required)
   - Download SDK Platform-Tools
   - Add to PATH environment variable

## Capacitor Quick Start (Android Studio Friendly)

```powershell
# 1) Install dependencies
npm install

# 2) Build web assets
npm run build

# 3) Sync Capacitor Android platform
npm run android:sync

# 4) Open Android Studio (launches the android/ project)
npm run android:open
```

> Make sure your `.env` is set (VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY, VITE_GOOGLE_MAPS_API_KEY) **before** running the build so web assets include the correct keys.

## Quick Build (No Android Studio Required)

### Option 1: Build APK with npm script

```powershell
# Build debug APK (for testing)
npm run apk
```

The APK will be generated at:
```
android\app\build\outputs\apk\debug\app-debug.apk
```

### Option 2: Build Release APK (for production)

```powershell
# Build the app
npm run build

# Sync with Android
npx cap sync android

# Build release APK
cd android
.\gradlew assembleRelease
```

The release APK will be at:
```
android\app\build\outputs\apk\release\app-release-unsigned.apk
```

## Build with Android Studio

1. **Open Android Studio**
2. **Open the android folder** from your project
3. **Wait for Gradle sync** to complete
4. **Build → Build Bundle(s) / APK(s) → Build APK(s)**
5. APK location will be shown in notification

## Environment Setup for Windows

```powershell
# Set JAVA_HOME (adjust path to your JDK installation)
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.9.9-hotspot"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# Set ANDROID_HOME (adjust path to your SDK installation)
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
$env:PATH = "$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools;$env:PATH"
```

## Troubleshooting

### Gradle not found
Install Gradle manually or let Android Studio install it:
```powershell
choco install gradle
```

### SDK not found
Set ANDROID_HOME:
```powershell
$env:ANDROID_HOME = "C:\Users\YourUser\AppData\Local\Android\Sdk"
```

### Build fails
Clean and rebuild:
```powershell
cd android
.\gradlew clean
.\gradlew assembleDebug
```

## Install APK on Device

### Using ADB:
```powershell
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Manual Install:
1. Copy APK to phone
2. Enable "Unknown Sources" in Settings
3. Open APK file and install

## App Details

- **App Name:** SecureYou
- **Package ID:** com.secureyou.app
- **Version:** 1.0.0
- **Min SDK:** 22 (Android 5.1)
- **Target SDK:** Latest

## Permissions Included

- ✅ Location (Fine & Coarse)
- ✅ Background Location
- ✅ Phone Call
- ✅ Send SMS
- ✅ Internet Access
- ✅ Network State
- ✅ Vibrate
- ✅ Wake Lock
