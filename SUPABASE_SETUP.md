# Supabase Integration Setup Guide

## ✅ Integration Complete!

Your SecureYou web app now has Supabase authentication and database integration.

## 📋 What Was Added

### 1. **Environment Variables** (`.env`)
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anonymous key

### 2. **Core Files Created**
- `src/lib/supabase.ts` - Supabase client configuration
- `src/types/database.types.ts` - TypeScript types for database schema
- `src/services/api.ts` - API service functions for profiles, contacts, and incidents
- `src/contexts/AuthContext.tsx` - Authentication state management
- `src/components/ProtectedRoute.tsx` - Route protection component

### 3. **Updated Files**
- `src/App.tsx` - Wrapped with AuthProvider and protected routes
- `src/pages/Login.tsx` - Integrated Supabase authentication
- `src/pages/Signup.tsx` - Integrated Supabase authentication

## 🗄️ Database Setup

**IMPORTANT:** You need to run these SQL migrations in your Supabase project to create the database tables.

### Step 1: Go to Supabase SQL Editor
1. Open https://xgytbxirkeqkstofupvd.supabase.co
2. Go to the **SQL Editor** section
3. Create a new query
4. Copy and paste the SQL below

### Step 2: Run Migration SQL

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  medical_info TEXT,
  blood_type TEXT,
  allergies TEXT
);

-- Create emergency_contacts table
CREATE TABLE IF NOT EXISTS emergency_contacts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Create incidents table
CREATE TABLE IF NOT EXISTS incidents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sos', 'medical', 'fire', 'police', 'other')),
  status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'cancelled')),
  location JSONB NOT NULL,
  description TEXT,
  contacted_authorities BOOLEAN DEFAULT FALSE,
  notified_contacts JSONB DEFAULT '[]'::JSONB,
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX IF NOT EXISTS idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);
CREATE INDEX IF NOT EXISTS idx_incidents_user_id ON incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON incidents(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profile"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for emergency_contacts
CREATE POLICY "Users can view their own contacts"
  ON emergency_contacts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own contacts"
  ON emergency_contacts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own contacts"
  ON emergency_contacts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own contacts"
  ON emergency_contacts FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for incidents
CREATE POLICY "Users can view their own incidents"
  ON incidents FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own incidents"
  ON incidents FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own incidents"
  ON incidents FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own incidents"
  ON incidents FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to automatically create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to call the function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

### Step 3: Configure Email Settings (Optional)

1. Go to **Authentication** > **Email Templates**
2. Customize your email templates for:
   - Confirmation (signup verification)
   - Reset password
   - Magic link

## 🔐 Authentication Features

### Email/Password Authentication (✅ Implemented)
- Sign up with email and password
- Sign in with existing credentials
- Email verification
- Password reset (via Supabase built-in)

### Future: Phone/SMS Authentication (Planned)
To add phone authentication later:

1. Enable Phone Auth in Supabase Dashboard:
   - Go to **Authentication** > **Providers**
   - Enable **Phone**
   - Choose SMS provider (Twilio, MessageBird, etc.)

2. Update `AuthContext.tsx` to add:
```typescript
const signInWithPhone = async (phone: string) => {
  const { error } = await supabase.auth.signInWithOtp({ phone });
  return { error };
};

const verifyOtp = async (phone: string, token: string) => {
  const { error } = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
  return { error };
};
```

## 🧪 Testing the Integration

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Test Signup Flow:**
   - Go to http://localhost:8081/signup
   - Create a new account
   - Check your email for verification link
   - Verify your email

3. **Test Login Flow:**
   - Go to http://localhost:8081/login
   - Enter credentials
   - Should redirect to dashboard

4. **Test Protected Routes:**
   - Try accessing /dashboard without login
   - Should redirect to /login
   - After login, should access protected pages

## 📁 File Structure

```
src/
├── lib/
│   └── supabase.ts           # Supabase client
├── types/
│   └── database.types.ts     # Database TypeScript types
├── services/
│   └── api.ts                # API service functions
├── contexts/
│   └── AuthContext.tsx       # Auth state management
├── components/
│   └── ProtectedRoute.tsx    # Route protection
└── pages/
    ├── Login.tsx             # Updated with Supabase auth
    └── Signup.tsx            # Updated with Supabase auth
```

## 🔧 API Service Usage Examples

### Profile Service
```typescript
import { profileService } from '@/services/api';
import { useAuth } from '@/contexts/AuthContext';

// Get current user's profile
const { user } = useAuth();
const profile = await profileService.getProfile(user.id);

// Update profile
await profileService.updateProfile(user.id, {
  phone_number: '+1234567890',
  blood_type: 'O+',
});
```

### Contacts Service
```typescript
import { contactsService } from '@/services/api';

// Get all contacts
const contacts = await contactsService.getContacts(userId);

// Add new contact
await contactsService.createContact({
  user_id: userId,
  name: 'John Doe',
  phone_number: '+1234567890',
  relationship: 'Friend',
  is_primary: true,
});

// Set primary contact
await contactsService.setPrimaryContact(userId, contactId);
```

### Incidents Service
```typescript
import { incidentsService } from '@/services/api';

// Create SOS incident
await incidentsService.createIncident({
  user_id: userId,
  type: 'sos',
  status: 'active',
  location: {
    latitude: 40.7128,
    longitude: -74.0060,
    address: 'New York, NY',
  },
  contacted_authorities: false,
  notified_contacts: [contactId1, contactId2],
});

// Get active incidents
const activeIncidents = await incidentsService.getActiveIncidents(userId);

// Resolve incident
await incidentsService.resolveIncident(incidentId);
```

## 🛡️ Security Features

- ✅ Row Level Security (RLS) enabled on all tables
- ✅ Users can only access their own data
- ✅ JWT-based authentication
- ✅ Automatic token refresh
- ✅ Secure password hashing (handled by Supabase)
- ✅ HTTPS encryption in production

## 📱 Mobile App Compatibility

The web app shares the same Supabase database as your mobile app:
- Same authentication system
- Same database schema
- Data syncs across platforms
- Users can login on both web and mobile

## 🚨 Important Notes

1. **Environment Variables:**
   - `.env` file is already created with your credentials
   - Never commit `.env` to git
   - Use `.env.example` for sharing template

2. **Database Schema:**
   - Run the SQL migration before testing
   - Tables must exist for the app to work
   - TypeScript types match the database schema

3. **Email Verification:**
   - Supabase requires email verification by default
   - Users must verify email before logging in
   - Can be disabled in Supabase settings if needed

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Ensure `.env` file exists in root directory
- Restart dev server after creating `.env`
- Variables must start with `VITE_` prefix

### "Table does not exist" errors
- Run the SQL migration in Supabase SQL Editor
- Verify tables were created in Database section

### Login/Signup not working
- Check browser console for errors
- Verify Supabase URL and keys are correct
- Ensure email confirmation is handled (check spam folder)

## 🎉 Next Steps

1. ✅ Run SQL migrations in Supabase
2. ✅ Test signup and login flows
3. 🔄 Integrate profile setup page with database
4. 🔄 Connect contacts page to Supabase
5. 🔄 Connect incidents page to Supabase
6. 🔄 Add real-time location tracking
7. 🔄 Implement push notifications
8. 🔄 Add phone/SMS authentication

---

**Need help?** Check the Supabase documentation: https://supabase.com/docs
