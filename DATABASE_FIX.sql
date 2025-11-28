-- =====================================================
-- DATABASE DIAGNOSTIC & FIX SCRIPT
-- Fixes: Update, Insert, Delete, Modify operations
-- =====================================================

-- ============================================
-- STEP 1: Check Current RLS Policies
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔍 Step 1: Checking current RLS policies...';
END $$;

-- Drop all existing policies (will recreate them correctly)
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete their own profile" ON profiles;

DROP POLICY IF EXISTS "Users can view their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can insert their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can update their own contacts" ON emergency_contacts;
DROP POLICY IF EXISTS "Users can delete their own contacts" ON emergency_contacts;

DROP POLICY IF EXISTS "Users can view their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can insert their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can update their own incidents" ON incidents;
DROP POLICY IF EXISTS "Users can delete their own incidents" ON incidents;

-- Drop social feed policies if they exist
DROP POLICY IF EXISTS "Anyone can view posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can create posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON incident_posts;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Cleared old policies';
END $$;

-- ============================================
-- STEP 2: Recreate RLS Policies (Fixed)
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🛡️  Step 2: Creating correct RLS policies...';
END $$;

-- ========== PROFILES POLICIES ==========
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete_policy"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== EMERGENCY CONTACTS POLICIES ==========
CREATE POLICY "contacts_select_policy"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "contacts_insert_policy"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_update_policy"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_delete_policy"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== INCIDENTS POLICIES ==========
CREATE POLICY "incidents_select_policy"
  ON incidents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "incidents_insert_policy"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incidents_update_policy"
  ON incidents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incidents_delete_policy"
  ON incidents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== SOCIAL FEED POLICIES (if tables exist) ==========
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'CREATE POLICY "posts_select_policy"
      ON incident_posts FOR SELECT
      TO authenticated
      USING (true)';
    
    EXECUTE 'CREATE POLICY "posts_insert_policy"
      ON incident_posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "posts_update_policy"
      ON incident_posts FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "posts_delete_policy"
      ON incident_posts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id)';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Created all RLS policies with correct permissions';
END $$;

-- ============================================
-- STEP 3: Fix Updated_At Triggers
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '⚡ Step 3: Fixing updated_at triggers...';
END $$;

-- Ensure function exists
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate triggers
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_contacts ON emergency_contacts;
DROP TRIGGER IF EXISTS set_updated_at_incidents ON incidents;
DROP TRIGGER IF EXISTS set_updated_at_posts ON incident_posts;

CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_contacts
  BEFORE UPDATE ON emergency_contacts
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

CREATE TRIGGER set_updated_at_incidents
  BEFORE UPDATE ON incidents
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Social feed trigger if table exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'CREATE TRIGGER set_updated_at_posts
      BEFORE UPDATE ON incident_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Fixed all updated_at triggers';
END $$;

-- ============================================
-- STEP 4: Add Missing Constraints
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔧 Step 4: Adding missing constraints...';
END $$;

-- Add constraint to ensure phone_number is not empty string
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_phone_number_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_phone_number_check 
    CHECK (phone_number IS NULL OR length(trim(phone_number)) >= 10);
  END IF;
END $$;

-- Add constraint to ensure full_name is not empty
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'profiles_full_name_check'
  ) THEN
    ALTER TABLE profiles 
    ADD CONSTRAINT profiles_full_name_check 
    CHECK (length(trim(full_name)) >= 2);
  END IF;
END $$;

-- Fix emergency contacts constraints
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_name_check'
  ) THEN
    ALTER TABLE emergency_contacts 
    ADD CONSTRAINT contacts_name_check 
    CHECK (length(trim(name)) >= 2);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'contacts_phone_check'
  ) THEN
    ALTER TABLE emergency_contacts 
    ADD CONSTRAINT contacts_phone_check 
    CHECK (length(trim(phone_number)) >= 10);
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Added all missing constraints';
END $$;

-- ============================================
-- STEP 5: Grant Proper Permissions
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔑 Step 5: Granting proper permissions...';
END $$;

-- Grant usage on schema
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant permissions on tables
GRANT ALL ON profiles TO authenticated;
GRANT ALL ON emergency_contacts TO authenticated;
GRANT ALL ON incidents TO authenticated;

-- Grant permissions on sequences
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated;

-- Grant permissions on social feed if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'GRANT ALL ON incident_posts TO authenticated';
    EXECUTE 'GRANT ALL ON post_reactions TO authenticated';
    EXECUTE 'GRANT ALL ON post_comments TO authenticated';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ Granted all necessary permissions';
END $$;

-- ============================================
-- STEP 6: Test Database Operations
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🧪 Step 6: Running tests...';
END $$;

-- Check if tables exist
DO $$
DECLARE
  table_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO table_count
  FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name IN ('profiles', 'emergency_contacts', 'incidents');
  
  IF table_count = 3 THEN
    RAISE NOTICE '  ✅ All core tables exist';
  ELSE
    RAISE WARNING '  ⚠️  Missing tables! Expected 3, found %', table_count;
  END IF;
END $$;

-- Check if RLS is enabled
DO $$
DECLARE
  rls_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO rls_count
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'emergency_contacts', 'incidents')
  AND rowsecurity = true;
  
  IF rls_count = 3 THEN
    RAISE NOTICE '  ✅ RLS enabled on all tables';
  ELSE
    RAISE WARNING '  ⚠️  RLS not fully enabled! Expected 3, found %', rls_count;
  END IF;
END $$;

-- Check if policies exist
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'emergency_contacts', 'incidents');
  
  IF policy_count >= 12 THEN
    RAISE NOTICE '  ✅ All RLS policies created (found %)', policy_count;
  ELSE
    RAISE WARNING '  ⚠️  Some policies missing! Expected 12+, found %', policy_count;
  END IF;
END $$;

-- ============================================
-- COMPLETION MESSAGE
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '✅ DATABASE FIX COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was fixed:';
  RAISE NOTICE '  • RLS policies recreated with correct permissions';
  RAISE NOTICE '  • Updated_at triggers fixed';
  RAISE NOTICE '  • Missing constraints added';
  RAISE NOTICE '  • Proper permissions granted';
  RAISE NOTICE '';
  RAISE NOTICE 'Operations that should now work:';
  RAISE NOTICE '  ✅ Profile updates';
  RAISE NOTICE '  ✅ Contact creation';
  RAISE NOTICE '  ✅ Contact updates';
  RAISE NOTICE '  ✅ Contact deletion';
  RAISE NOTICE '  ✅ Incident management';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test profile update in app';
  RAISE NOTICE '  2. Test adding/editing/deleting contacts';
  RAISE NOTICE '  3. Test incident creation';
  RAISE NOTICE '';
  RAISE NOTICE 'If issues persist, check:';
  RAISE NOTICE '  • Supabase credentials in .env file';
  RAISE NOTICE '  • User authentication status';
  RAISE NOTICE '  • Browser console for errors';
  RAISE NOTICE '';
END $$;
