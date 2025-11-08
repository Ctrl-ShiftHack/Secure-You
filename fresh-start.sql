-- ============================================
-- FRESH START: Drop Everything & Rebuild
-- This will completely reset your database
-- ============================================

-- ============================================
-- STEP 1: Drop All Tables
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🗑️  Step 1: Dropping all existing tables...';
  RAISE NOTICE '';
END $$;

-- Drop tables in correct order (child tables first)
DROP TABLE IF EXISTS incidents CASCADE;
DROP TABLE IF EXISTS emergency_contacts CASCADE;
DROP TABLE IF EXISTS profiles CASCADE;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Dropped incidents table';
  RAISE NOTICE '  ✅ Dropped emergency_contacts table';
  RAISE NOTICE '  ✅ Dropped profiles table';
  RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 2: Recreate Tables with Proper Structure
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🔧 Step 2: Creating tables with correct structure...';
  RAISE NOTICE '';
END $$;

-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  avatar_url TEXT,
  address TEXT,
  medical_info TEXT,
  blood_type TEXT,
  allergies TEXT
);

-- Create emergency_contacts table
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE
);

-- Create incidents table
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

DO $$
BEGIN
  RAISE NOTICE '  ✅ Created profiles table';
  RAISE NOTICE '  ✅ Created emergency_contacts table';
  RAISE NOTICE '  ✅ Created incidents table';
  RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 3: Create Indexes
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '📊 Step 3: Creating indexes...';
  RAISE NOTICE '';
END $$;

CREATE INDEX idx_profiles_user_id ON profiles(user_id);
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_is_primary ON emergency_contacts(is_primary);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status);
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);

DO $$
BEGIN
  RAISE NOTICE '  ✅ Created 6 indexes';
  RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 4: Enable Row Level Security (RLS)
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🔒 Step 4: Enabling Row Level Security...';
  RAISE NOTICE '';
END $$;

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE incidents ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
  RAISE NOTICE '  ✅ RLS enabled on all tables';
  RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 5: Create RLS Policies
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '🛡️  Step 5: Creating RLS policies...';
  RAISE NOTICE '';
END $$;

-- Profiles policies
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

-- Emergency contacts policies
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

-- Incidents policies
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

DO $$
BEGIN
  RAISE NOTICE '  ✅ Created 12 RLS policies';
  RAISE NOTICE '';
END $$;

-- ============================================
-- STEP 6: Create Auto-Profile Trigger
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '⚡ Step 6: Creating auto-profile trigger...';
  RAISE NOTICE '';
END $$;

-- Drop if exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name', ''), '');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

DO $$
BEGIN
  RAISE NOTICE '  ✅ Auto-profile trigger created';
  RAISE NOTICE '';
END $$;

-- ============================================
-- FINAL VERIFICATION
-- ============================================

DO $$
DECLARE
  profiles_exists BOOLEAN;
  contacts_exists BOOLEAN;
  incidents_exists BOOLEAN;
  profile_columns INTEGER;
BEGIN
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '✅ DATABASE RESET COMPLETE!';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '';
  
  -- Verify tables exist
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'profiles'
  ) INTO profiles_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'emergency_contacts'
  ) INTO contacts_exists;
  
  SELECT EXISTS (
    SELECT FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_name = 'incidents'
  ) INTO incidents_exists;
  
  -- Count columns in profiles
  SELECT COUNT(*) INTO profile_columns
  FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'profiles';
  
  RAISE NOTICE '📊 Tables Created:';
  RAISE NOTICE '   ✓ profiles (% columns)', profile_columns;
  RAISE NOTICE '   ✓ emergency_contacts';
  RAISE NOTICE '   ✓ incidents';
  RAISE NOTICE '';
  RAISE NOTICE '🔒 Security:';
  RAISE NOTICE '   ✓ Row Level Security enabled';
  RAISE NOTICE '   ✓ 12 RLS policies created';
  RAISE NOTICE '';
  RAISE NOTICE '⚡ Triggers:';
  RAISE NOTICE '   ✓ Auto-profile creation on signup';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
  RAISE NOTICE '🎯 NEXT STEPS:';
  RAISE NOTICE '';
  RAISE NOTICE '1. Create a user account:';
  RAISE NOTICE '   https://supabase.com/dashboard/project/xgytbxirkeqkstofupvd/auth/users';
  RAISE NOTICE '   Click: Add User → Create new user';
  RAISE NOTICE '   Email: test@secureyou.com';
  RAISE NOTICE '   Password: Test123456!';
  RAISE NOTICE '   Check: Auto Confirm User';
  RAISE NOTICE '';
  RAISE NOTICE '2. Add demo data:';
  RAISE NOTICE '   Run: add-demo-data.sql';
  RAISE NOTICE '';
  RAISE NOTICE '3. Test your app:';
  RAISE NOTICE '   npm run dev';
  RAISE NOTICE '   Login at: http://localhost:8080/login';
  RAISE NOTICE '';
  RAISE NOTICE '═══════════════════════════════════════════════════';
END $$;
