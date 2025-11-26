# Supabase Configuration Guide

## 🔐 Required Supabase Dashboard Settings

To fix email verification and authentication redirects, update these settings in your Supabase dashboard.

---

## 1. Authentication URL Configuration

**Navigate to**: [Supabase Dashboard → Authentication → URL Configuration](https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/auth/url-configuration)

### Site URL
```
https://secure-you.vercel.app
```

### Redirect URLs (Add all of these)
```
https://secure-you.vercel.app
https://secure-you.vercel.app/**
https://secure-you.vercel.app/setup
https://secure-you.vercel.app/dashboard
https://secure-you.vercel.app/verify-email
https://secure-you.vercel.app/auth/callback
http://localhost:5173/**
http://localhost:5173/setup
http://localhost:5173/dashboard
```

**Note**: The `/**` wildcard allows all paths under the domain.

---

## 2. Email Template Configuration

**Navigate to**: [Supabase Dashboard → Authentication → Email Templates](https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/auth/templates)

### Confirm Signup Template

**Current Issue**: Token expires in 1 hour (too short)

**Fix**:
1. Click "Confirm Signup" template
2. Find the token expiry setting
3. Change from `1 hour` to `72 hours` (3 days)
4. Update the redirect URL in the template:

```html
<!-- Replace localhost URL with production URL -->
<a href="{{ .SiteURL }}/setup?token={{ .Token }}&type=signup">Confirm your email</a>
```

Should use:
```html
<a href="{{ .SiteURL }}/setup?token={{ .Token }}&type=signup">Confirm your email</a>
```

**Note**: `.SiteURL` automatically uses the Site URL you configured above.

### Reset Password Template

**Fix**:
1. Click "Reset Password" template
2. Update redirect URL:

```html
<a href="{{ .SiteURL }}/reset-password?token={{ .Token }}&type=recovery">Reset your password</a>
```

---

## 3. Security Settings (Optional but Recommended)

**Navigate to**: [Supabase Dashboard → Authentication → Providers](https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/auth/providers)

### Email Provider Settings

✅ **Enable email confirmations**: ON (prevents spam accounts)
✅ **Enable email change confirmations**: ON (security)
✅ **Secure email change**: ON (requires both old and new email confirmation)

### Session Settings

- **JWT expiry**: 3600 seconds (1 hour) - Default is fine
- **Refresh token expiry**: 2592000 seconds (30 days) - Good for user experience

---

## 4. Database Policies (Already Configured)

These should already be set, but verify:

### Profiles Table
```sql
-- Users can read their own profile
CREATE POLICY "Users can read own profile" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can insert their own profile
CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
```

### Emergency Contacts Table
```sql
-- Users can manage their own contacts
CREATE POLICY "Users can manage own contacts" ON emergency_contacts
  FOR ALL USING (auth.uid() = user_id);
```

---

## 5. Testing the Configuration

After making the above changes, test the following flows:

### Test 1: Email Verification
1. Sign up with a new email
2. Check inbox for verification email
3. Click the verification link
4. Should redirect to: `https://secure-you.vercel.app/setup`
5. Complete the setup wizard
6. Should land on dashboard

**Expected**: ✅ Smooth flow, no localhost redirects

### Test 2: Password Reset
1. Click "Forgot Password" on login page
2. Enter email and submit
3. Check inbox for reset email
4. Click reset link
5. Should redirect to: `https://secure-you.vercel.app/reset-password`
6. Enter new password

**Expected**: ✅ No localhost redirects

### Test 3: Session Persistence
1. Log in to the app
2. Close browser
3. Open browser and go to `https://secure-you.vercel.app`
4. Should still be logged in

**Expected**: ✅ Session persists for 30 days

---

## 6. Environment Variables (Already Configured)

These should already be set in your deployment, but verify in Vercel:

**Vercel Dashboard → Project Settings → Environment Variables**

```bash
VITE_SUPABASE_URL=https://xgytbxirkeqkstofupvd.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

---

## 7. Common Issues & Solutions

### Issue: "Invalid redirect URL"
**Solution**: Make sure ALL redirect URLs are added in step 1, including the `/**` wildcard.

### Issue: Email verification link says "Link expired"
**Solution**: Increase token expiry to 72 hours in step 2.

### Issue: Verification link redirects to localhost
**Solution**: 
1. Update Site URL in step 1
2. Update email template in step 2 to use `{{ .SiteURL }}`

### Issue: "Setup page stuck on Saving..."
**Solution**: 
- ✅ **Already fixed in code** (commit 0c80b55)
- Now uses sequential contact saves with 8-second timeout per contact
- Navigates even if some contacts fail
- Shows helpful error messages

### Issue: "Session not found" after page refresh
**Solution**: Check that `storageKey` in `supabase.ts` is set to `'secureyou-auth'` and localStorage is working.

---

## 8. Quick Configuration Checklist

Use this checklist to verify all settings:

- [ ] Site URL set to `https://secure-you.vercel.app`
- [ ] Redirect URLs include production domain + wildcard
- [ ] Redirect URLs include localhost for development
- [ ] Email confirmation enabled
- [ ] Email verification expiry set to 72 hours
- [ ] Email templates use `{{ .SiteURL }}`
- [ ] Password reset template updated
- [ ] Environment variables set in Vercel
- [ ] Tested signup → verify → setup → dashboard flow
- [ ] Tested password reset flow
- [ ] Tested session persistence

---

## 9. Code Changes Made (Reference)

### Fixed in `src/lib/supabase.ts`:
```typescript
export const supabase = createClient<Database>(cleanUrl, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'secureyou-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Production redirect URLs
    flowType: 'pkce',
    redirectTo: typeof window !== 'undefined' 
      ? `${window.location.origin}/setup` 
      : undefined,
  },
});
```

### Fixed in `src/pages/Setup.tsx`:
- Sequential contact saves with 8s timeout per contact
- Force navigation even if some contacts fail
- Better error messages with automatic retry
- Progress tracking (shows X/Y contacts saved)

### Fixed in `src/components/ui/chart.tsx`:
- Sanitized CSS values to prevent XSS
- Validates color formats before injection
- Removes special characters from IDs and keys

---

## ✅ Summary

After completing steps 1-3 above in the Supabase dashboard, all authentication flows should work correctly:

- ✅ Email verification redirects to production URL
- ✅ Password reset works without localhost redirect
- ✅ Setup page no longer hangs on "Saving..."
- ✅ XSS vulnerabilities patched
- ✅ Session persistence works across browser restarts

**Time to complete**: ~10 minutes
**Required access**: Supabase dashboard admin access

---

**Last Updated**: Commit 0c80b55
**Project**: Secure-You
**Supabase Project**: xgytbxirkeqkstofupvd
**Production URL**: https://secure-you.vercel.app
