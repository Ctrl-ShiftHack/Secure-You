# 🚀 Quick APK Build Guide for SecureYou

## ⚡ Fastest Method: Use Online Build Service

### EAS Build (Expo Application Services) - FREE

```powershell
# Install EAS CLI
npm install -g eas-cli

# Login (create free account at expo.dev)
eas login

# Build APK online (no local setup needed!)
eas build --platform android --profile preview
```

Your APK will be built in the cloud and downloadable via link!

---

## 🏗️ Local Build (Requires Setup)

### Step 1: Install Java JDK 17

```powershell
# Using Chocolatey (recommended)
choco install microsoft-openjdk17

# Or download manually from:
# https://adoptium.net/temurin/releases/
```

### Step 2: Install Android SDK

**Option A: Install Android Studio (Easiest)**
- Download: https://developer.android.com/studio
- Install with default settings
- SDK will be installed automatically

**Option B: SDK Command Line Tools Only**
```powershell
# Download from: https://developer.android.com/studio#command-tools
# Extract to: C:\Android\cmdline-tools
```

### Step 3: Set Environment Variables

```powershell
# Set permanently in PowerShell
[System.Environment]::SetEnvironmentVariable('JAVA_HOME', 'C:\Program Files\Eclipse Adoptium\jdk-17.0.11.9-hotspot', 'User')
[System.Environment]::SetEnvironmentVariable('ANDROID_HOME', "$env:LOCALAPPDATA\Android\Sdk", 'User')

# Add to PATH
$currentPath = [System.Environment]::GetEnvironmentVariable('Path', 'User')
$newPath = "$currentPath;$env:JAVA_HOME\bin;$env:ANDROID_HOME\platform-tools;$env:ANDROID_HOME\tools"
[System.Environment]::SetEnvironmentVariable('Path', $newPath, 'User')

# Restart PowerShell after this!
```

### Step 4: Build APK

```powershell
# Build debug APK
npm run apk

# Find your APK at:
# android\app\build\outputs\apk\debug\app-debug.apk
```

---

## 📦 Alternative: Use APK Builder Tool

### Capacitor APK Builder (No Android Studio)

```powershell
npm install -g @capacitor/apk-builder

# Build APK
npx cap-apk-builder build
```

---

## 🔥 Easiest Option: Use AppGyver / Capacitor Cloud Build

1. **Ionic Appflow** (https://ionic.io/appflow)
   - Free tier available
   - Cloud builds
   - No local setup

2. **Capacitor Live Updates**
   ```powershell
   npm install @capacitor/live-updates
   ```

---

## 📱 Install APK on Phone

### Method 1: Direct Transfer
1. Copy `app-debug.apk` to phone
2. Enable "Install Unknown Apps" in Settings
3. Open APK and install

### Method 2: ADB Install
```powershell
# Install ADB
choco install adb

# Connect phone via USB (enable USB Debugging)
adb devices

# Install APK
adb install android\app\build\outputs\apk\debug\app-debug.apk
```

### Method 3: Email/Cloud
1. Email APK to yourself
2. Download on phone
3. Install

---

## 🎯 Recommended: Use Capacitor with Android Studio

1. **Install Android Studio** (15-20 minutes)
   - https://developer.android.com/studio
   - Accept all defaults during installation

2. **Open Android Project**
   ```powershell
   npm run android:open
   ```

3. **Build in Android Studio**
   - Wait for Gradle sync
   - Build → Build Bundle(s) / APK(s) → Build APK(s)
   - APK will be generated automatically

4. **Run on Connected Device**
   - Connect Android phone via USB
   - Enable USB Debugging
   - Click ▶️ Run button in Android Studio

---

## 🐛 Troubleshooting

### "JAVA_HOME not set"
```powershell
# Find Java installation
Get-ChildItem "C:\Program Files" -Filter "jdk*" -Recurse -ErrorAction SilentlyContinue

# Set JAVA_HOME to found path
$env:JAVA_HOME = "C:\Program Files\Eclipse Adoptium\jdk-17.0.11.9-hotspot"
```

### "Gradle not found"
```powershell
# Let Android Studio install it automatically, or:
choco install gradle
```

### "SDK not found"
```powershell
# Set ANDROID_HOME
$env:ANDROID_HOME = "$env:LOCALAPPDATA\Android\Sdk"
```

### Build fails
```powershell
# Clean and rebuild
cd android
.\gradlew clean
.\gradlew assembleDebug
```

---

## 📊 Build Size Optimization

For smaller APK (production build):

```powershell
# Build release APK
npm run android:build:release

# APK will be at:
# android\app\build\outputs\apk\release\app-release-unsigned.apk
```

To sign APK for Play Store:
- Create keystore
- Add signing config to `android/app/build.gradle`
- Use `assembleRelease` task

---

## ✅ Current Status

Your Android project is ready at:
```
android/
```

**Next step:** Install Java JDK 17 and Android Studio, then run:
```powershell
npm run apk
```

Your APK will be ready in ~5-10 minutes!
