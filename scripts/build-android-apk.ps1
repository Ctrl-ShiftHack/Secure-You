# ============================================
# SecureYou - Complete Android APK Builder
# Automated build script for production APK
# ============================================

param(
    [switch]$Release,
    [switch]$Clean,
    [switch]$SkipBuild
)

Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "🚀 SecureYou Android APK Builder" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\user\Downloads\Secure-You-main"
Set-Location $projectRoot

# Check prerequisites
Write-Host "📋 Step 1: Checking prerequisites..." -ForegroundColor Yellow
Write-Host ""

# Check Node.js
try {
    $nodeVersion = node --version
    Write-Host "  ✅ Node.js: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Node.js not found! Install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check Java
try {
    $javaVersion = java -version 2>&1 | Select-String "version" | Select-Object -First 1
    Write-Host "  ✅ Java: $javaVersion" -ForegroundColor Green
} catch {
    Write-Host "  ⚠️  Java not found - required for Gradle builds" -ForegroundColor Yellow
    Write-Host "     Download JDK 17 from https://adoptium.net" -ForegroundColor Gray
}

# Check JAVA_HOME
if ($env:JAVA_HOME) {
    Write-Host "  ✅ JAVA_HOME: $env:JAVA_HOME" -ForegroundColor Green
} else {
    Write-Host "  ⚠️  JAVA_HOME not set" -ForegroundColor Yellow
}

# Check ANDROID_HOME
if ($env:ANDROID_HOME) {
    Write-Host "  ✅ ANDROID_HOME: $env:ANDROID_HOME" -ForegroundColor Green
} else {
    $androidSdk = "$env:LOCALAPPDATA\Android\Sdk"
    if (Test-Path $androidSdk) {
        $env:ANDROID_HOME = $androidSdk
        Write-Host "  ✅ ANDROID_HOME auto-detected: $androidSdk" -ForegroundColor Green
    } else {
        Write-Host "  ⚠️  ANDROID_HOME not set" -ForegroundColor Yellow
    }
}

Write-Host ""

# Clean build (if requested)
if ($Clean) {
    Write-Host "🧹 Step 2: Cleaning previous builds..." -ForegroundColor Yellow
    
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "  ✅ Cleaned dist/" -ForegroundColor Green
    }
    
    if (Test-Path "android\app\build") {
        Remove-Item -Recurse -Force "android\app\build"
        Write-Host "  ✅ Cleaned android/app/build/" -ForegroundColor Green
    }
    
    Write-Host ""
}

# Install dependencies
Write-Host "📦 Step 3: Installing dependencies..." -ForegroundColor Yellow

if (-not (Test-Path "node_modules")) {
    Write-Host "  → Running npm install..." -ForegroundColor Gray
    npm install
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Dependencies installed" -ForegroundColor Green
    } else {
        Write-Host "  ❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "  ✅ Dependencies already installed" -ForegroundColor Green
}

Write-Host ""

# Build web assets
if (-not $SkipBuild) {
    Write-Host "🔨 Step 4: Building web assets..." -ForegroundColor Yellow
    Write-Host "  → Running vite build..." -ForegroundColor Gray
    
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Web assets built successfully" -ForegroundColor Green
        
        # Check dist size
        $distSize = (Get-ChildItem -Recurse dist | Measure-Object -Property Length -Sum).Sum / 1MB
        Write-Host "  📊 Bundle size: $([math]::Round($distSize, 2)) MB" -ForegroundColor Cyan
    } else {
        Write-Host "  ❌ Build failed!" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "⏭️  Step 4: Skipping web build (using existing dist/)" -ForegroundColor Yellow
}

Write-Host ""

# Sync Capacitor
Write-Host "🔄 Step 5: Syncing Capacitor..." -ForegroundColor Yellow
Write-Host "  → Copying web assets to Android..." -ForegroundColor Gray

npx cap sync android

if ($LASTEXITCODE -eq 0) {
    Write-Host "  ✅ Capacitor synced successfully" -ForegroundColor Green
} else {
    Write-Host "  ❌ Capacitor sync failed!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Build Android APK
Write-Host "📱 Step 6: Building Android APK..." -ForegroundColor Yellow

Set-Location "android"

$buildType = if ($Release) { "Release" } else { "Debug" }
$gradleTask = if ($Release) { "assembleRelease" } else { "assembleDebug" }

Write-Host "  → Build type: $buildType" -ForegroundColor Cyan
Write-Host "  → Running Gradle: $gradleTask..." -ForegroundColor Gray
Write-Host ""

# Run Gradle build
.\gradlew $gradleTask

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "  ✅ Android APK built successfully!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "  ❌ Gradle build failed!" -ForegroundColor Red
    Set-Location $projectRoot
    exit 1
}

Set-Location $projectRoot

Write-Host ""

# Locate APK
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "✅ BUILD COMPLETE!" -ForegroundColor Green
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

if ($Release) {
    $apkPath = "android\app\build\outputs\apk\release\app-release.apk"
    if (-not (Test-Path $apkPath)) {
        $apkPath = "android\app\build\outputs\apk\release\app-release-unsigned.apk"
    }
} else {
    $apkPath = "android\app\build\outputs\apk\debug\app-debug.apk"
}

if (Test-Path $apkPath) {
    $apkSize = (Get-Item $apkPath).Length / 1MB
    Write-Host "📦 APK Location:" -ForegroundColor Yellow
    Write-Host "   $apkPath" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 APK Size:" -ForegroundColor Yellow
    Write-Host "   $([math]::Round($apkSize, 2)) MB" -ForegroundColor Cyan
    Write-Host ""
    
    # Open folder
    Write-Host "📂 Opening APK folder..." -ForegroundColor Yellow
    $apkFolder = Split-Path $apkPath -Parent
    explorer $apkFolder
    
    Write-Host ""
    Write-Host "🎉 SUCCESS! APK is ready to install on Android devices!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📱 Installation methods:" -ForegroundColor Yellow
    Write-Host "   1. USB: adb install $apkPath" -ForegroundColor Gray
    Write-Host "   2. File transfer: Copy APK to phone and install" -ForegroundColor Gray
    Write-Host "   3. Email/Cloud: Send APK and download on phone" -ForegroundColor Gray
} else {
    Write-Host "⚠️  APK file not found at expected location" -ForegroundColor Yellow
    Write-Host "   Expected: $apkPath" -ForegroundColor Gray
    Write-Host ""
    Write-Host "   Searching for APK files..." -ForegroundColor Gray
    Get-ChildItem -Recurse "android\app\build\outputs\apk" -Filter "*.apk" | ForEach-Object {
        Write-Host "   Found: $($_.FullName)" -ForegroundColor Cyan
    }
}

Write-Host ""
Write-Host "═══════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

# Display next steps
Write-Host "📝 Next Steps:" -ForegroundColor Yellow
Write-Host ""

if ($Release) {
    Write-Host "  For Google Play Store:" -ForegroundColor Cyan
    Write-Host "  1. Sign the APK with your keystore (see ANDROID_BUILD_GUIDE.md)" -ForegroundColor Gray
    Write-Host "  2. Or build AAB: cd android ; .\gradlew bundleRelease" -ForegroundColor Gray
    Write-Host "  3. Upload to Google Play Console" -ForegroundColor Gray
} else {
    Write-Host "  For testing:" -ForegroundColor Cyan
    Write-Host "  1. Install on device: adb install $apkPath" -ForegroundColor Gray
    Write-Host "  2. Test all features thoroughly" -ForegroundColor Gray
    Write-Host "  3. For production: Run with -Release flag" -ForegroundColor Gray
}

Write-Host ""
Write-Host "📖 Full guide: ANDROID_BUILD_GUIDE.md" -ForegroundColor Gray
Write-Host ""
