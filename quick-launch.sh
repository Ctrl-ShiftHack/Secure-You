#!/bin/bash

# 🚀 Quick Launch Script for SecureYou (Linux/Mac)

echo "🔐 SecureYou - Quick Launch Setup"
echo "================================="
echo ""

# Check if Node.js is installed
if command -v node &> /dev/null; then
    NODE_VERSION=$(node --version)
    echo "✅ Node.js installed: $NODE_VERSION"
else
    echo "❌ Node.js not found. Please install from https://nodejs.org"
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "⚠️  No .env file found"
    
    if [ -f ".env.example" ]; then
        echo "📋 Copying .env.example to .env..."
        cp .env.example .env
        echo "✅ Created .env file. Please update with your Supabase credentials!"
    else
        echo "❌ No .env.example found. Please create .env manually."
    fi
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

if [ $? -eq 0 ]; then
    echo "✅ Dependencies installed successfully!"
else
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check TypeScript errors
echo ""
echo "🔍 Checking TypeScript errors..."
npx tsc --noEmit

if [ $? -eq 0 ]; then
    echo "✅ No TypeScript errors!"
else
    echo "⚠️  TypeScript errors found. Please fix before deploying."
fi

# Build for production
echo ""
echo "🏗️  Building for production..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful! Files are in 'dist/' folder"
else
    echo "❌ Build failed"
    exit 1
fi

# Display next steps
echo ""
echo "🎉 Your app is ready to deploy!"
echo ""
echo "📱 Next Steps:"
echo "1. Deploy to web: vercel (or netlify deploy)"
echo "2. Users can install as PWA from browser"
echo "3. For native apps: npx cap add android/ios"
echo ""
echo "📖 Full guide: See DEPLOYMENT_GUIDE.md"
echo ""
