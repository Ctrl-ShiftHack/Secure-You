# 🔐 Setting Up Google & Facebook OAuth

## Overview
Your app now supports Google and Facebook login on the onboarding page! Users can sign in with one click.

---

## 📋 Supabase Configuration Required

To make Google and Facebook login work, you need to configure OAuth providers in Supabase.

### Step 1: Enable Google OAuth

1. **Get Google OAuth Credentials:**
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project or select existing one
   - Navigate to "APIs & Services" → "Credentials"
   - Click "Create Credentials" → "OAuth 2.0 Client ID"
   - Application type: "Web application"
   - Name: "SecureYou"
   - Authorized JavaScript origins:
     ```
     http://localhost:8080
     https://your-app.vercel.app
     ```
   - Authorized redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - Click "Create"
   - Copy **Client ID** and **Client Secret**

2. **Configure in Supabase:**
   - Go to Supabase Dashboard
   - Click "Authentication" → "Providers"
   - Find "Google" and click to expand
   - Enable the toggle
   - Paste your **Client ID**
   - Paste your **Client Secret**
   - Click "Save"

### Step 2: Enable Facebook OAuth

1. **Get Facebook App Credentials:**
   - Go to [Facebook Developers](https://developers.facebook.com)
   - Click "My Apps" → "Create App"
   - App Type: "Consumer"
   - Display Name: "SecureYou"
   - Contact Email: your-email@example.com
   - Click "Create App"
   - In dashboard, go to "Settings" → "Basic"
   - Copy **App ID** and **App Secret**
   - Add domains:
     ```
     localhost
     your-app.vercel.app
     your-project-ref.supabase.co
     ```
   - In left menu, click "Add Product" → "Facebook Login" → "Set Up"
   - Valid OAuth Redirect URIs:
     ```
     https://your-project-ref.supabase.co/auth/v1/callback
     ```
   - Save changes

2. **Configure in Supabase:**
   - Go to Supabase Dashboard
   - Click "Authentication" → "Providers"
   - Find "Facebook" and click to expand
   - Enable the toggle
   - Paste your **App ID** as Client ID
   - Paste your **App Secret** as Client Secret
   - Click "Save"

---

## 🧪 Testing OAuth Login

### Local Testing (Development)

1. **Start your dev server:**
   ```bash
   npm run dev
   ```

2. **Visit onboarding page:**
   ```
   http://localhost:8080
   ```

3. **Navigate to last slide:**
   - Click "Next" through slides
   - On final slide, you'll see:
     - "Continue with Google" button
     - "Continue with Facebook" button

4. **Test Google login:**
   - Click "Continue with Google"
   - Select Google account
   - Grant permissions
   - Should redirect to setup page

5. **Test Facebook login:**
   - Click "Continue with Facebook"
   - Enter Facebook credentials
   - Grant permissions
   - Should redirect to setup page

### Production Testing

After deploying to Vercel:

1. Visit your live URL
2. Go through onboarding
3. Click social login buttons
4. Verify redirect works correctly

---

## 🔧 Troubleshooting

### "OAuth Error: Invalid Redirect URI"
**Fix:** 
- Check redirect URI matches exactly in Google/Facebook console
- Format: `https://your-project.supabase.co/auth/v1/callback`
- No trailing slash

### "Access Denied" from Google
**Fix:**
- Verify JavaScript origins includes your domain
- Add both `http://localhost:8080` and production URL

### "App Not Set Up" from Facebook
**Fix:**
- Make sure Facebook app is in "Live" mode (not Development)
- Add all domains in Facebook app settings
- Privacy Policy URL may be required

### Users Not Creating Profile
**Fix:**
- Profile creation happens automatically on first OAuth login
- Check Supabase logs if profile creation fails
- Verify RLS policies allow insert for authenticated users

---

## 📱 User Experience

### What Happens During OAuth Login:

1. **User clicks "Continue with Google/Facebook"**
2. **Redirect to provider** (Google/Facebook login page)
3. **User authorizes app**
4. **Redirect back to app** with auth token
5. **Supabase creates user account** (if first time)
6. **Profile auto-created** from OAuth data:
   - Email from provider
   - Full name from provider (if available)
   - Avatar URL (if available)
7. **Redirect to setup page** to complete profile
8. **Dashboard access** after setup completion

---

## 🎨 UI Improvements Made

### Onboarding Page Updates:

✅ **Removed "Skip" button** - Users must go through onboarding  
✅ **Added social login on last slide** - Quick signup option  
✅ **Added dividers** - "Quick Sign Up" and "or use email" sections  
✅ **Proper button styling** - Consistent with rest of app  
✅ **Loading states** - Disabled buttons during OAuth flow  
✅ **Error handling** - Toast notifications for OAuth errors  

---

## 🔒 Security Notes

### OAuth Security Best Practices:

1. **HTTPS Required:**
   - OAuth only works on HTTPS in production
   - Localhost allowed for development

2. **State Parameter:**
   - Supabase handles CSRF protection automatically
   - State parameter prevents replay attacks

3. **Token Storage:**
   - Access tokens stored securely by Supabase
   - Refresh tokens enable long sessions

4. **Scopes:**
   - Only request necessary permissions
   - Default scopes: email, profile

---

## 📊 Testing Checklist

Before going live, test:

- [ ] Google login works on localhost
- [ ] Facebook login works on localhost
- [ ] Google login works on production
- [ ] Facebook login works on production
- [ ] First-time users redirect to setup
- [ ] Profile created correctly from OAuth data
- [ ] Returning users redirect to dashboard
- [ ] Error messages show on OAuth failure
- [ ] Loading states work correctly
- [ ] Both light and dark mode look good

---

## 🚀 Quick Setup Script

Copy and paste this checklist:

```bash
# 1. Enable Google in Supabase
# ✓ Go to Authentication → Providers → Google
# ✓ Enable toggle
# ✓ Add Client ID and Secret
# ✓ Save

# 2. Enable Facebook in Supabase
# ✓ Go to Authentication → Providers → Facebook
# ✓ Enable toggle
# ✓ Add App ID and Secret
# ✓ Save

# 3. Test locally
npm run dev
# ✓ Navigate to onboarding
# ✓ Click through to last slide
# ✓ Test both social login buttons

# 4. Deploy
vercel --prod

# 5. Test production
# ✓ Visit live URL
# ✓ Test OAuth flow
# ✓ Verify profile creation
```

---

## 💰 Cost

Both Google and Facebook OAuth are **FREE** for:
- Up to 10,000 users/month (Google)
- Unlimited (Facebook)

No additional costs beyond standard Supabase pricing.

---

## 📞 Support

If OAuth login doesn't work:

1. Check Supabase logs: Dashboard → Logs
2. Check browser console for errors (F12)
3. Verify redirect URIs match exactly
4. Ensure providers are enabled in Supabase
5. Test with different Google/Facebook account

---

**Your app now supports one-click social login!** 🎉

Users can sign up in seconds without remembering passwords.
