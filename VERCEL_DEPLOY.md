# 🚀 Deploy SecureYou to Vercel

## Quick Deploy Steps

### 1. Push to GitHub ✅
Your code is already on GitHub at: https://github.com/Ctrl-ShiftHack/Secure-You.git

### 2. Deploy to Vercel

#### Option A: One-Click Deploy (Easiest)
1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Click **"Import Git Repository"**
4. Select: `Ctrl-ShiftHack/Secure-You`
5. Click **"Import"**

#### Option B: Using Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (run from project root)
vercel
```

### 3. Configure Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

Add these variables:
```
VITE_SUPABASE_URL=https://xgytbxirkeqkstofupvd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhneXRieGlya2Vxa3N0b2Z1cHZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5Mjg4MTAsImV4cCI6MjA3NzUwNDgxMH0.iAJ6SEF--BIhJUvBOHgwCM9YNYIFo1KlKAkLoRrifis
```

### 4. Deploy Settings

**Framework Preset:** Vite  
**Build Command:** `npm run build`  
**Output Directory:** `dist`  
**Install Command:** `npm install`  
**Node Version:** 18.x or higher

### 5. Redeploy

After adding environment variables, click **"Redeploy"** button.

---

## 🎉 Your App Will Be Live!

After deployment, you'll get a URL like:
- `https://secure-you.vercel.app`
- `https://secure-you-ctrl-shifthack.vercel.app`

---

## Features Included

✅ Social Feed (Posts, Comments, Reactions)  
✅ Location Search (Bangladesh focused)  
✅ Image Upload  
✅ Real-time Updates (30s polling)  
✅ Dark/Light Theme  
✅ Multi-language (English, Bengali, Spanish)  
✅ Emergency SOS Features  
✅ Contact Management  
✅ Map Integration

---

## Troubleshooting

**Build fails?**
- Check Node version is 18+
- Verify environment variables are set
- Check build logs in Vercel dashboard

**App loads but features don't work?**
- Make sure environment variables are added
- Run SQL migrations in Supabase (see `add-social-feed.sql`)
- Check Supabase credentials are correct

**Need to update?**
```bash
git add .
git commit -m "Update message"
git push
```
Vercel will auto-deploy on push!
