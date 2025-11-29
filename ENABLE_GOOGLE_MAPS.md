# ⚡ Google Maps API - Quick Enable Links

## 🚀 Click These Links to Enable ALL APIs (2 Minutes)

**Your Project:** Open https://console.cloud.google.com/ first

### Required APIs - Click to Enable:

1. **Maps JavaScript API** ⭐ MOST IMPORTANT
   ```
   https://console.cloud.google.com/apis/library/maps-backend.googleapis.com
   ```
   Click "ENABLE" button

2. **Places API** (Emergency Facilities)
   ```
   https://console.cloud.google.com/apis/library/places-backend.googleapis.com
   ```
   Click "ENABLE" button

3. **Geocoding API** (Address Lookup)
   ```
   https://console.cloud.google.com/apis/library/geocoding-backend.googleapis.com
   ```
   Click "ENABLE" button

4. **Directions API** (Navigation)
   ```
   https://console.cloud.google.com/apis/library/directions-backend.googleapis.com
   ```
   Click "ENABLE" button

5. **Distance Matrix API** (Distances)
   ```
   https://console.cloud.google.com/apis/library/distance-matrix-backend.googleapis.com
   ```
   Click "ENABLE" button

---

## ✅ Current Status

**Your API Key:** `AIzaSyDaJCPWlBivtoJ1vgGUSPUofVR8IWCx7cM`

**Issue:** APIs not enabled for this key

**Solution:** 
1. Go to Google Cloud Console
2. Select the project that owns this API key
3. Click the 5 links above
4. Click "Enable" on each
5. Wait 2 minutes
6. Hard refresh browser (Ctrl+Shift+R)

---

## 🎯 What Each API Does

| API | Feature | Example |
|-----|---------|---------|
| **Maps JavaScript API** | Interactive maps | Map display, zoom, pan |
| **Places API** | Find locations | Hospitals, police, restaurants |
| **Geocoding API** | Address conversion | "123 Main St" → coordinates |
| **Directions API** | Routes & navigation | A to B driving directions |
| **Distance Matrix API** | Travel times | Distance to multiple destinations |

---

## 🔧 After Enabling APIs

### Update Your App:

**1. Restart Dev Server:**
```powershell
# Press Ctrl+C in terminal
npm run dev
```

**2. Hard Refresh Browser:**
- Chrome/Edge: `Ctrl + Shift + R`
- Firefox: `Ctrl + F5`

**3. Clear Service Worker:**
- F12 → Application → Service Workers → Unregister
- Clear Storage → Clear site data

---

## 💡 Alternative: Create New API Key

If you can't access that project:

**Create New Key:**
1. https://console.cloud.google.com/apis/credentials
2. Click "Create Credentials" → "API Key"
3. Copy the new key
4. Update `.env`:
   ```env
   VITE_GOOGLE_MAPS_API_KEY=YOUR_NEW_KEY
   ```
5. Update `index.html` line 33
6. Enable all 5 APIs above
7. Restart dev server

---

## 📊 Features That Will Work

After enabling all APIs:

✅ **Map Display** - Interactive Google Maps
✅ **Live Location** - Real-time tracking
✅ **Emergency Facilities** - Find hospitals/police/fire
✅ **Navigation** - Turn-by-turn directions
✅ **Geocoding** - Address ↔ Coordinates
✅ **Distance Calculator** - Distance to contacts
✅ **Traffic Layer** - Real-time traffic
✅ **Street View** - 360° panorama
✅ **Place Search** - Find any place type
✅ **Contact Markers** - Show contacts on map

---

## 🐛 Troubleshooting

### Error: "ApiNotActivatedMapError"
→ Maps JavaScript API not enabled
→ Go to: https://console.cloud.google.com/apis/library/maps-backend.googleapis.com

### Error: "This API project is not authorized"
→ Enable the specific API mentioned in error
→ Use links above

### Map shows but features don't work
→ Enable Places API and Geocoding API
→ Restart dev server

### "Google Maps not loaded" errors
→ Wait 2-3 minutes after enabling APIs
→ Hard refresh browser
→ Check API key is correct

---

## 💰 Cost (FREE for Your App)

- **$200 FREE credit every month**
- Your expected usage: ~$30-40/month
- **You pay: $0** (under free credit)

Set billing alert at $150 to be safe.

---

## 🎯 Next Steps

1. ✅ Read GOOGLE_MAPS_SETUP.md for detailed guide
2. ✅ Enable 5 APIs using links above
3. ✅ Wait 2 minutes
4. ✅ Restart dev server
5. ✅ Test map - should work perfectly!

**Need help?** Check GOOGLE_MAPS_SETUP.md for full configuration guide.
