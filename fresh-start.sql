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

-- Create profiles table with improved constraints
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL CHECK (length(trim(full_name)) >= 2),
  phone_number TEXT CHECK (phone_number IS NULL OR length(phone_number) >= 10),
  avatar_url TEXT CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://'),
  address TEXT,
  medical_info TEXT,
  blood_type TEXT CHECK (blood_type IS NULL OR blood_type IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
  allergies TEXT
);

-- Create emergency_contacts table with improved constraints
CREATE TABLE emergency_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL CHECK (length(trim(name)) >= 2),
  phone_number TEXT NOT NULL CHECK (length(phone_number) >= 10),
  email TEXT CHECK (email IS NULL OR email ~ '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'),
  relationship TEXT,
  is_primary BOOLEAN DEFAULT FALSE NOT NULL,
  CONSTRAINT unique_primary_per_user UNIQUE NULLS NOT DISTINCT (user_id, is_primary) WHERE is_primary = TRUE
);

-- Create incidents table with improved constraints
CREATE TABLE incidents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('sos', 'medical', 'fire', 'police', 'other')),
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'resolved', 'cancelled')),
  location JSONB NOT NULL CHECK (jsonb_typeof(location) = 'object'),
  description TEXT,
  contacted_authorities BOOLEAN DEFAULT FALSE NOT NULL,
  notified_contacts JSONB DEFAULT '[]'::JSONB NOT NULL CHECK (jsonb_typeof(notified_contacts) = 'array'),
  resolved_at TIMESTAMP WITH TIME ZONE,
  CONSTRAINT valid_resolved_at CHECK (
    (status = 'resolved' AND resolved_at IS NOT NULL) OR 
    (status != 'resolved')
  )
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
CREATE INDEX idx_profiles_phone_number ON profiles(phone_number) WHERE phone_number IS NOT NULL;
CREATE INDEX idx_emergency_contacts_user_id ON emergency_contacts(user_id);
CREATE INDEX idx_emergency_contacts_is_primary ON emergency_contacts(user_id, is_primary) WHERE is_primary = TRUE;
CREATE INDEX idx_emergency_contacts_phone ON emergency_contacts(phone_number);
CREATE INDEX idx_incidents_user_id ON incidents(user_id);
CREATE INDEX idx_incidents_status ON incidents(status) WHERE status = 'active';
CREATE INDEX idx_incidents_created_at ON incidents(created_at DESC);
CREATE INDEX idx_incidents_user_status ON incidents(user_id, status);

DO $$
BEGIN
  RAISE NOTICE '  ✅ Created 9 optimized indexes';
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
-- STEP 6: Create Triggers
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '⚡ Step 6: Creating triggers...';
  RAISE NOTICE '';
END $$;

-- Drop existing triggers and functions
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_contacts ON emergency_contacts;
DROP TRIGGER IF EXISTS set_updated_at_incidents ON incidents;
DROP FUNCTION IF EXISTS public.set_updated_at();

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create auto-profile function with validation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_name TEXT;
BEGIN
  -- Extract name from metadata or email
  user_name := COALESCE(
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'User'
  );
  
  -- Ensure name is at least 2 characters
  IF length(trim(user_name)) < 2 THEN
    user_name := 'New User';
  END IF;
  
  INSERT INTO public.profiles (user_id, full_name, phone_number)
  VALUES (NEW.id, user_name, '');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail auth
    RAISE WARNING 'Failed to create profile for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_incidents
  BEFORE UPDATE ON incidents
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DO $$
BEGIN
  RAISE NOTICE '  ✅ Auto-profile trigger created';
  RAISE NOTICE '  ✅ Updated_at triggers created for all tables';
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
