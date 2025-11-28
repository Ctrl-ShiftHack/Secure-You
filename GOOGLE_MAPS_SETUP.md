# 🗺️ Google Maps Integration - Setup Guide

## Overview
Google Maps API has been integrated for live location tracking, real-time map display, and location sharing with emergency contacts.

---

## 🚀 Quick Setup

### Step 1: Get Google Maps API Key

1. **Go to Google Cloud Console:**
   - Visit: https://console.cloud.google.com/

2. **Create/Select Project:**
   - Click "Select a Project" → "New Project"
   - Name: "Secure You" (or any name)
   - Click "Create"

3. **Enable APIs:**
   - Go to: https://console.cloud.google.com/apis/library
   - Search and enable these APIs:
     - **Maps JavaScript API** ✅ (Required)
     - **Geocoding API** ✅ (Optional, for address lookup)
     - **Geolocation API** ✅ (Optional, for better accuracy)

4. **Create API Key:**
   - Go to: https://console.cloud.google.com/apis/credentials
   - Click "Create Credentials" → "API Key"
   - Copy the generated API key

5. **Secure Your API Key (Recommended):**
   - Click "Edit API key"
   - Under "API restrictions" → "Restrict key"
   - Select "Maps JavaScript API"
   - Under "Website restrictions":
     - Add: `https://secure-you.vercel.app/*`
     - Add: `http://localhost:5173/*` (for development)
   - Click "Save"

---

### Step 2: Add API Key to Project

**Local Development:**

Edit `.env` file:
```env
VITE_SUPABASE_URL=https://xgytbxirkeqkstofupvd.supabase.co
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

# Add this line with your actual API key:
VITE_GOOGLE_MAPS_API_KEY=AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXX
```

**Vercel (Production):**

1. Go to: https://vercel.com/dashboard
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add new variable:
   - Name: `VITE_GOOGLE_MAPS_API_KEY`
   - Value: Your Google Maps API key
   - Select all environments (Production, Preview, Development)
5. Click "Save"
6. **Redeploy** the application

---

### Step 3: Test Integration

1. **Restart dev server** (if running):
   ```powershell
   npm run dev
   ```

2. **Open Map page:**
   - Navigate to: http://localhost:5173/map
   - Or click "Map" in bottom navigation

3. **Allow location access:**
   - Browser will ask for permission
   - Click "Allow"

4. **Verify:**
   - ✅ Map loads with your current location
   - ✅ Blue marker shows your position
   - ✅ Address displays below map
   - ✅ "Start Tracking" button works
   - ✅ "Share Location" copies link to clipboard

---

## 🎯 Features Implemented

### 1. **Interactive Google Maps**
- ✅ Real-time map rendering
- ✅ Current location marker (blue dot)
- ✅ Accuracy circle (50m radius)
- ✅ Zoom/pan controls
- ✅ Fullscreen mode
- ✅ Smooth animations

### 2. **Live Location Tracking**
- ✅ Toggle live tracking on/off
- ✅ Updates location every 5 seconds
- ✅ Visual "Live Tracking" indicator
- ✅ Battery-efficient (high accuracy mode)
- ✅ Auto-centers map on location updates

### 3. **Location Sharing**
- ✅ Share with emergency contacts
- ✅ Generates Google Maps link
- ✅ Copies link to clipboard
- ✅ Shows contact count
- ✅ Warning if no contacts added

### 4. **Address Lookup**
- ✅ Reverse geocoding (coordinates → address)
- ✅ Uses OpenStreetMap (free)
- ✅ Displays full address
- ✅ Shows lat/lng coordinates

### 5. **User Experience**
- ✅ Loading states
- ✅ Permission denied handling
- ✅ Error messages
- ✅ "Center on location" button
- ✅ "Open in Google Maps" button
- ✅ Responsive design

---

## 📱 Usage

### For Users:

**View Current Location:**
1. Navigate to Map page
2. Allow location access
3. See your position on map

**Start Live Tracking:**
1. Click "Start Tracking" button
2. Your location updates automatically
3. Map follows your movement

**Share Location:**
1. Click "Share Location with Contacts"
2. Link copied to clipboard
3. Send link to emergency contacts via SMS/WhatsApp

**Open in Google Maps:**
1. Click "Open in Maps" button
2. Opens Google Maps app or website
3. Full navigation available

---

## 🔧 Component API

### GoogleMapComponent Props:

```typescript
interface GoogleMapComponentProps {
  // Map container height
  height?: string; // default: '400px'
  
  // Show user's current location
  showCurrentLocation?: boolean; // default: true
  
  // Custom markers to display
  markers?: Array<{
    id: string;
    position: { lat: number; lng: number };
    label: string;
    icon?: string;
  }>;
  
  // Callback when location updates
  onLocationUpdate?: (location: { lat: number; lng: number }) => void;
  
  // Enable real-time tracking
  enableLiveTracking?: boolean; // default: false
  
  // Initial zoom level
  zoom?: number; // default: 15
}
```

### Usage Example:

```tsx
import GoogleMapComponent from '@/components/GoogleMap';

<GoogleMapComponent
  height="500px"
  showCurrentLocation={true}
  enableLiveTracking={true}
  onLocationUpdate={(loc) => console.log(loc)}
  zoom={16}
  markers={[
    {
      id: '1',
      position: { lat: 23.8103, lng: 90.4125 },
      label: 'Emergency Contact Location'
    }
  ]}
/>
```

---

## 🔒 Security Best Practices

### API Key Protection:

1. **Never commit `.env` file:**
   - Already in `.gitignore`
   - Never share API key publicly

2. **Use API restrictions:**
   - Restrict to specific domains
   - Restrict to specific APIs
   - Set usage quotas

3. **Monitor usage:**
   - Check Google Cloud Console
   - Set up billing alerts
   - Review API logs regularly

4. **Rotate keys:**
   - Change API key periodically
   - Revoke compromised keys immediately

---

## 💰 Pricing & Quotas

### Google Maps Pricing:

**Free Tier:**
- $200 credit per month
- 28,000 map loads/month (free)
- 40,000 geocoding requests/month (free)

**Map Loads:**
- Dynamic Maps: $7 per 1,000 loads
- Static Maps: $2 per 1,000 loads

**Typical Usage (1000 users):**
- Average: 10 map views per user/month
- Total: 10,000 map loads/month
- Cost: **FREE** (within $200 credit)

**Recommendation:**
- Monitor usage in Google Cloud Console
- Set billing alerts at $50, $100, $150
- Normal usage should stay within free tier

---

## 🐛 Troubleshooting

### Issue 1: "Google Maps API Key Required" Message

**Cause:** API key not set or invalid

**Fix:**
1. Check `.env` file has `VITE_GOOGLE_MAPS_API_KEY`
2. Verify key is correct (starts with `AIza`)
3. Restart dev server after adding key
4. Check browser console for errors

---

### Issue 2: Map Not Loading / Blank Screen

**Cause:** API restrictions or billing not enabled

**Fix:**
1. Go to Google Cloud Console
2. Check if "Maps JavaScript API" is enabled
3. Verify API key restrictions allow your domain
4. Enable billing (won't be charged within free tier)

---

### Issue 3: "This page can't load Google Maps correctly"

**Cause:** Domain restrictions or quota exceeded

**Fix:**
1. Edit API key in Google Cloud Console
2. Under "Website restrictions":
   - Add: `http://localhost:5173/*`
   - Add: `https://secure-you.vercel.app/*`
3. Save and wait 5 minutes
4. Clear browser cache
5. Reload page

---

### Issue 4: Location Permission Denied

**Cause:** Browser blocked location access

**Fix:**
1. Click lock icon in address bar
2. Find "Location" permission
3. Change to "Allow"
4. Reload page

**For different browsers:**
- **Chrome:** Settings → Privacy → Site Settings → Location
- **Firefox:** Settings → Privacy & Security → Permissions → Location
- **Safari:** Settings → Privacy → Location Services

---

### Issue 5: "Geocoding Error" / No Address Shown

**Cause:** Rate limit on OpenStreetMap API

**Fix:**
- This is normal (free service has limits)
- Coordinates still shown
- Wait a few seconds and try again
- Or enable Google Geocoding API (paid)

---

## 📊 Testing Checklist

### Map Display:
- [ ] Map loads correctly
- [ ] Current location marker appears
- [ ] Accuracy circle displayed
- [ ] Map controls work (zoom, pan)
- [ ] Fullscreen button works

### Live Tracking:
- [ ] "Start Tracking" button toggles
- [ ] Location updates in real-time
- [ ] "Live Tracking" indicator shows
- [ ] Map auto-centers on updates
- [ ] "Stop Tracking" stops updates

### Location Sharing:
- [ ] "Share Location" button works
- [ ] Link copied to clipboard
- [ ] Toast notification appears
- [ ] Link opens in Google Maps
- [ ] Shows correct coordinates

### Permission Handling:
- [ ] Permission prompt appears
- [ ] Works when "Allow" clicked
- [ ] Shows error when "Block" clicked
- [ ] Instructions displayed on error
- [ ] Retry button works

### UI/UX:
- [ ] Loading spinner shows
- [ ] Smooth animations
- [ ] Responsive on mobile
- [ ] Dark mode support
- [ ] Touch gestures work

---

## 🔄 Alternative: No API Key Mode

If you don't want to use Google Maps API, the app includes a fallback:

**What happens:**
- Shows placeholder with instructions
- Still gets location (browser geolocation)
- Can still share location links
- Uses OpenStreetMap for address lookup
- Links open in Google Maps web (no API needed)

**To keep fallback:**
- Don't add `VITE_GOOGLE_MAPS_API_KEY` to `.env`
- Component will show helpful message
- All other features work normally

---

## 📚 Additional Resources

**Google Maps Platform:**
- Documentation: https://developers.google.com/maps/documentation
- Pricing: https://mapsplatform.google.com/pricing/
- API Console: https://console.cloud.google.com/google/maps-apis

**React Google Maps:**
- Library Docs: https://react-google-maps-api-docs.netlify.app/
- Examples: https://github.com/JustFly1984/react-google-maps-api

**Browser Geolocation API:**
- MDN Docs: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation_API

---

## 🚀 Next Steps

### Enhancements to Consider:

1. **Route Planning:**
   - Directions API integration
   - ETA calculation
   - Multiple waypoints

2. **Geofencing:**
   - Safe zones
   - Alert when leaving area
   - Arrival notifications

3. **Location History:**
   - Track movement over time
   - Playback feature
   - Export GPX/KML

4. **Contact Locations:**
   - Show contacts on map
   - Distance to contacts
   - Nearest contact finder

5. **Offline Maps:**
   - Cache map tiles
   - Offline navigation
   - Saved locations

---

**Setup Complete!** 🎉

Once you add your Google Maps API key, the live location tracking feature will be fully functional!
