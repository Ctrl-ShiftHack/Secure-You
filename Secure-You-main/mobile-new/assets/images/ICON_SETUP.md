# App Icons Setup

## Required Images

You need to create these images from your logo:

### 1. **icon.png** (1024x1024)
- Square app icon
- Use your logo-light.png on purple background
- Background: #667eea
- Logo centered

### 2. **adaptive-icon.png** (1024x1024)
- Android adaptive icon (foreground)
- Transparent background
- Logo in center (safe area: 660x660)

### 3. **splash.png** (1284x2778)
- Splash screen image
- Use your logo centered
- Background will be #667eea (set in app.json)

### 4. **favicon.png** (48x48)
- Small icon for web
- Just your logo scaled down

## Quick Setup with Online Tools

### Option 1: Use Expo's Asset Generator
```bash
npx expo install expo-asset
```

### Option 2: Use Online Tools
1. **AppIcon.co** - Generate all sizes
2. **MakeAppIcon.com** - Free icon generator
3. Upload your logo-light.png
4. Download generated assets

## Manual Setup

If you want to create manually:

1. Open your logo-light.png in an image editor
2. Create 1024x1024 canvas with #667eea background
3. Center your logo
4. Export as icon.png
5. Repeat for other sizes

## Current Status

- ✅ logo-dark.png (provided)
- ✅ logo-light.png (provided)
- ⚠️ icon.png (need to create)
- ⚠️ adaptive-icon.png (need to create)
- ⚠️ splash.png (need to create)
- ⚠️ favicon.png (need to create)
