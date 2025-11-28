-- =====================================================
-- COMPLETE DATABASE RESET & FIX SCRIPT
-- This will completely reset and fix ALL database issues
-- =====================================================

-- ============================================
-- STEP 1: DISABLE RLS TEMPORARILY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔓 Step 1: Disabling RLS temporarily...';
END $$;

ALTER TABLE IF EXISTS profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_contacts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incidents DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incident_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_reactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_comments DISABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 2: DROP ALL EXISTING POLICIES
-- ============================================
DO $$
DECLARE
    r RECORD;
BEGIN
  RAISE NOTICE '🗑️  Step 2: Dropping ALL existing policies...';
  
  FOR r IN (
    SELECT schemaname, tablename, policyname 
    FROM pg_policies 
    WHERE schemaname = 'public'
  ) LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
      r.policyname, r.schemaname, r.tablename);
  END LOOP;
  
  RAISE NOTICE '  ✅ All policies dropped';
END $$;

-- ============================================
-- STEP 3: RE-ENABLE RLS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔒 Step 3: Re-enabling RLS...';
END $$;

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS emergency_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS incident_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- STEP 4: CREATE CORRECT RLS POLICIES
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🛡️  Step 4: Creating correct RLS policies...';
END $$;

-- ========== PROFILES POLICIES ==========
CREATE POLICY "profiles_select"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "profiles_insert"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_update"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles_delete"
  ON profiles FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== EMERGENCY CONTACTS POLICIES ==========
CREATE POLICY "contacts_select"
  ON emergency_contacts FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "contacts_insert"
  ON emergency_contacts FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_update"
  ON emergency_contacts FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "contacts_delete"
  ON emergency_contacts FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== INCIDENTS POLICIES ==========
CREATE POLICY "incidents_select"
  ON incidents FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "incidents_insert"
  ON incidents FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incidents_update"
  ON incidents FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "incidents_delete"
  ON incidents FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- ========== SOCIAL FEED POLICIES ==========
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'CREATE POLICY "posts_select"
      ON incident_posts FOR SELECT
      TO authenticated
      USING (true)';
    
    EXECUTE 'CREATE POLICY "posts_insert"
      ON incident_posts FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "posts_update"
      ON incident_posts FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "posts_delete"
      ON incident_posts FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id)';
    
    RAISE NOTICE '  ✅ Social feed policies created';
  END IF;
END $$;

-- ========== REACTIONS POLICIES ==========
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_reactions') THEN
    EXECUTE 'CREATE POLICY "reactions_select"
      ON post_reactions FOR SELECT
      TO authenticated
      USING (true)';
    
    EXECUTE 'CREATE POLICY "reactions_insert"
      ON post_reactions FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "reactions_delete"
      ON post_reactions FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id)';
    
    RAISE NOTICE '  ✅ Reactions policies created';
  END IF;
END $$;

-- ========== COMMENTS POLICIES ==========
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    EXECUTE 'CREATE POLICY "comments_select"
      ON post_comments FOR SELECT
      TO authenticated
      USING (true)';
    
    EXECUTE 'CREATE POLICY "comments_insert"
      ON post_comments FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "comments_update"
      ON post_comments FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id)';
    
    EXECUTE 'CREATE POLICY "comments_delete"
      ON post_comments FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id)';
    
    RAISE NOTICE '  ✅ Comments policies created';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ All RLS policies created successfully';
END $$;

-- ============================================
-- STEP 5: FIX TRIGGERS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '⚡ Step 5: Fixing triggers...';
END $$;

-- Drop existing triggers
DROP TRIGGER IF EXISTS set_updated_at_profiles ON profiles;
DROP TRIGGER IF EXISTS set_updated_at_contacts ON emergency_contacts;
DROP TRIGGER IF EXISTS set_updated_at_incidents ON incidents;
DROP TRIGGER IF EXISTS set_updated_at_posts ON incident_posts;
DROP TRIGGER IF EXISTS set_updated_at_comments ON post_comments;

-- Drop existing function
DROP FUNCTION IF EXISTS public.set_updated_at();

-- Create function with SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Create triggers
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

DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'CREATE TRIGGER set_updated_at_posts
      BEFORE UPDATE ON incident_posts
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at()';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    EXECUTE 'CREATE TRIGGER set_updated_at_comments
      BEFORE UPDATE ON post_comments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at()';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ All triggers fixed';
END $$;

-- ============================================
-- STEP 6: GRANT PERMISSIONS
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '🔑 Step 6: Granting permissions...';
END $$;

-- Grant schema usage
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT ALL ON profiles TO authenticated;
GRANT SELECT ON profiles TO anon;

GRANT ALL ON emergency_contacts TO authenticated;
GRANT SELECT ON emergency_contacts TO anon;

GRANT ALL ON incidents TO authenticated;
GRANT SELECT ON incidents TO anon;

-- Grant sequence permissions
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Grant function execute
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO authenticated;

-- Grant social feed permissions
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'incident_posts') THEN
    EXECUTE 'GRANT ALL ON incident_posts TO authenticated';
    EXECUTE 'GRANT SELECT ON incident_posts TO anon';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_reactions') THEN
    EXECUTE 'GRANT ALL ON post_reactions TO authenticated';
    EXECUTE 'GRANT SELECT ON post_reactions TO anon';
  END IF;
  
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'post_comments') THEN
    EXECUTE 'GRANT ALL ON post_comments TO authenticated';
    EXECUTE 'GRANT SELECT ON post_comments TO anon';
  END IF;
END $$;

DO $$
BEGIN
  RAISE NOTICE '  ✅ All permissions granted';
END $$;

-- ============================================
-- STEP 7: VERIFY SETUP
-- ============================================
DO $$
DECLARE
  policy_count INTEGER;
  trigger_count INTEGER;
BEGIN
  RAISE NOTICE '🧪 Step 7: Verifying setup...';
  
  -- Count policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'emergency_contacts', 'incidents');
  
  -- Count triggers
  SELECT COUNT(*) INTO trigger_count
  FROM information_schema.triggers
  WHERE event_object_schema = 'public'
  AND event_object_table IN ('profiles', 'emergency_contacts', 'incidents')
  AND trigger_name LIKE 'set_updated_at%';
  
  RAISE NOTICE '  ✅ Found % policies', policy_count;
  RAISE NOTICE '  ✅ Found % triggers', trigger_count;
  
  IF policy_count >= 12 AND trigger_count >= 3 THEN
    RAISE NOTICE '  ✅ Setup verified successfully';
  ELSE
    RAISE WARNING '  ⚠️  Some items may be missing';
  END IF;
END $$;

-- ============================================
-- COMPLETION
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '✅ DATABASE RESET COMPLETE!';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'What was done:';
  RAISE NOTICE '  1. ✅ Disabled RLS temporarily';
  RAISE NOTICE '  2. ✅ Dropped ALL existing policies';
  RAISE NOTICE '  3. ✅ Re-enabled RLS';
  RAISE NOTICE '  4. ✅ Created correct policies with USING + WITH CHECK';
  RAISE NOTICE '  5. ✅ Fixed all triggers with SECURITY DEFINER';
  RAISE NOTICE '  6. ✅ Granted all necessary permissions';
  RAISE NOTICE '  7. ✅ Verified setup';
  RAISE NOTICE '';
  RAISE NOTICE 'Operations that should work now:';
  RAISE NOTICE '  ✅ Profile updates (name, phone, address, blood type)';
  RAISE NOTICE '  ✅ Emergency contact CRUD (create, read, update, delete)';
  RAISE NOTICE '  ✅ Incident management';
  RAISE NOTICE '  ✅ Social feed posts, reactions, comments';
  RAISE NOTICE '';
  RAISE NOTICE 'Next: Test in your app!';
  RAISE NOTICE '';
END $$;
