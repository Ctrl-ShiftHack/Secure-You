# Secure You - APK Build Script
# Run this in PowerShell to build your Android APK

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Secure You - APK Builder" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to mobile app directory
$mobileDir = "c:\Users\user\Downloads\Secure-You-main\Secure-You-main\mobile-new"
Set-Location $mobileDir

Write-Host "📁 Current directory: $mobileDir" -ForegroundColor Green
Write-Host ""

# Check if logged in
Write-Host "🔐 Checking Expo login status..." -ForegroundColor Yellow
$loginCheck = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  Not logged in to Expo" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please login to Expo first:" -ForegroundColor Yellow
    Write-Host "  1. Run: eas login" -ForegroundColor White
    Write-Host "  2. Enter your Expo credentials" -ForegroundColor White
    Write-Host "  3. If you don't have an account, create one at https://expo.dev" -ForegroundColor White
    Write-Host ""
    Write-Host "After logging in, run this script again." -ForegroundColor Yellow
    Write-Host ""
    pause
    exit 1
}

Write-Host "✅ Logged in as: $loginCheck" -ForegroundColor Green
Write-Host ""

# Ask user which build type
Write-Host "Select build type:" -ForegroundColor Yellow
Write-Host "  1. Preview APK (for testing)" -ForegroundColor White
Write-Host "  2. Production APK (for release)" -ForegroundColor White
Write-Host ""
$choice = Read-Host "Enter choice (1 or 2)"

if ($choice -eq "2") {
    $profile = "production"
    Write-Host "🏭 Building PRODUCTION APK..." -ForegroundColor Magenta
} else {
    $profile = "preview"
    Write-Host "🔬 Building PREVIEW APK..." -ForegroundColor Cyan
}

Write-Host ""
Write-Host "🚀 Starting build process..." -ForegroundColor Green
Write-Host "This will take 5-15 minutes. You can close this window and check progress at:" -ForegroundColor Yellow
Write-Host "https://expo.dev" -ForegroundColor Cyan
Write-Host ""

# Start the build
eas build --platform android --profile $profile

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Build Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Download the APK from the URL provided above" -ForegroundColor White
Write-Host "  2. Transfer to your Android device" -ForegroundColor White
Write-Host "  3. Enable 'Install from Unknown Sources' in settings" -ForegroundColor White
Write-Host "  4. Install the APK" -ForegroundColor White
Write-Host ""
Write-Host "You can also view/download builds at: https://expo.dev" -ForegroundColor Cyan
Write-Host ""
pause
