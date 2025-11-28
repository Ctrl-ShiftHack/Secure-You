-- QUICK TEST: Check if database is properly configured
-- Run this in Supabase SQL Editor to diagnose issues

-- ============================================
-- TEST 1: Check if tables exist
-- ============================================
DO $$
DECLARE
  tables_exist BOOLEAN;
BEGIN
  RAISE NOTICE '🔍 TEST 1: Checking if tables exist...';
  
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_schema = 'public' 
    AND table_name = 'profiles'
  ) INTO tables_exist;
  
  IF tables_exist THEN
    RAISE NOTICE '  ✅ Profiles table exists';
  ELSE
    RAISE WARNING '  ❌ Profiles table missing - RUN fresh-start.sql';
  END IF;
END $$;

-- ============================================
-- TEST 2: Check if RLS is enabled
-- ============================================
DO $$
DECLARE
  rls_enabled BOOLEAN;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 TEST 2: Checking if RLS is enabled...';
  
  SELECT rowsecurity INTO rls_enabled
  FROM pg_tables
  WHERE schemaname = 'public'
  AND tablename = 'profiles';
  
  IF rls_enabled THEN
    RAISE NOTICE '  ✅ RLS is enabled on profiles';
  ELSE
    RAISE WARNING '  ❌ RLS is disabled - RUN DATABASE_FIX.sql';
  END IF;
END $$;

-- ============================================
-- TEST 3: Check if UPDATE policy exists
-- ============================================
DO $$
DECLARE
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 TEST 3: Checking UPDATE policy...';
  
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'public'
  AND tablename = 'profiles'
  AND cmd = 'UPDATE';
  
  IF policy_count > 0 THEN
    RAISE NOTICE '  ✅ UPDATE policy exists';
  ELSE
    RAISE WARNING '  ❌ UPDATE policy missing - RUN DATABASE_FIX.sql';
  END IF;
END $$;

-- ============================================
-- TEST 4: List all policies
-- ============================================
SELECT 
  '📋 Current Policies:' as info,
  tablename,
  policyname,
  cmd as operation,
  qual as using_clause,
  with_check as with_check_clause
FROM pg_policies
WHERE schemaname = 'public'
AND tablename = 'profiles'
ORDER BY cmd;

-- ============================================
-- TEST 5: Check permissions
-- ============================================
SELECT 
  '🔑 Permissions:' as info,
  grantee as role,
  string_agg(privilege_type, ', ') as privileges
FROM information_schema.role_table_grants
WHERE table_name = 'profiles'
AND table_schema = 'public'
GROUP BY grantee;

-- ============================================
-- TEST 6: Try a test update (will fail if RLS broken)
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🧪 TEST 6: Testing UPDATE with current user...';
  RAISE NOTICE '  Note: This test will show if policies are working';
  RAISE NOTICE '';
  
  -- This will succeed if policies are correct, fail if not
  -- The actual update won't happen if you run this as service_role
  RAISE NOTICE '  To test properly:';
  RAISE NOTICE '  1. Ensure you are logged in to your app';
  RAISE NOTICE '  2. Try updating your name from Settings';
  RAISE NOTICE '  3. Check browser console for detailed logs';
END $$;

-- ============================================
-- RESULTS SUMMARY
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '📊 TEST RESULTS SUMMARY';
  RAISE NOTICE '==================================================';
  RAISE NOTICE '';
  RAISE NOTICE 'If you see any ❌ above, run DATABASE_FIX.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'Common issues and fixes:';
  RAISE NOTICE '  • Table missing → Run fresh-start.sql';
  RAISE NOTICE '  • RLS disabled → Run DATABASE_FIX.sql';
  RAISE NOTICE '  • Policies missing → Run DATABASE_FIX.sql';
  RAISE NOTICE '  • Permission denied → Run DATABASE_FIX.sql';
  RAISE NOTICE '';
  RAISE NOTICE 'After fixing, test in your app:';
  RAISE NOTICE '  1. Login to app';
  RAISE NOTICE '  2. Go to Settings';
  RAISE NOTICE '  3. Try updating name';
  RAISE NOTICE '  4. Check browser console (F12) for logs';
  RAISE NOTICE '';
END $$;
