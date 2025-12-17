# 🚀 Quick Launch Script for SecureYou

Write-Host "🔐 SecureYou - Quick Launch Setup" -ForegroundColor Cyan
Write-Host "=================================" -ForegroundColor Cyan
Write-Host ""

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js installed: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org" -ForegroundColor Red
    exit 1
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Write-Host "⚠️  No .env file found" -ForegroundColor Yellow
    
    if (Test-Path ".env.example") {
        Write-Host "📋 Copying .env.example to .env..." -ForegroundColor Yellow
        Copy-Item ".env.example" ".env"
        Write-Host "✅ Created .env file. Please update with your Supabase credentials!" -ForegroundColor Green
    } else {
        Write-Host "❌ No .env.example found. Please create .env manually." -ForegroundColor Red
    }
}

# Install dependencies
Write-Host ""
Write-Host "📦 Installing dependencies..." -ForegroundColor Cyan
npm install

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} else {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Check TypeScript errors
Write-Host ""
Write-Host "🔍 Checking TypeScript errors..." -ForegroundColor Cyan
npx tsc --noEmit

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ No TypeScript errors!" -ForegroundColor Green
} else {
    Write-Host "⚠️  TypeScript errors found. Please fix before deploying." -ForegroundColor Yellow
}

# Build for production
Write-Host ""
Write-Host "🏗️  Building for production..." -ForegroundColor Cyan
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Build successful! Files are in 'dist/' folder" -ForegroundColor Green
} else {
    Write-Host "❌ Build failed" -ForegroundColor Red
    exit 1
}

# Display next steps
Write-Host ""
Write-Host "🎉 Your app is ready to deploy!" -ForegroundColor Green
Write-Host ""
Write-Host "📱 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Deploy to web: vercel (or netlify deploy)" -ForegroundColor White
Write-Host "2. Users can install as PWA from browser" -ForegroundColor White
Write-Host "3. For native apps: npx cap add android/ios" -ForegroundColor White
Write-Host ""
Write-Host "📖 Full guide: See DEPLOYMENT_GUIDE.md" -ForegroundColor Yellow
Write-Host ""
