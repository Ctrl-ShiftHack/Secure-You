-- =====================================================
-- DEEP DATABASE DIAGNOSTIC SCRIPT
-- Run this in Supabase SQL Editor to see EXACT state
-- =====================================================

-- ============================================
-- CHECK 1: Verify Tables Exist
-- ============================================
SELECT '=== TABLES EXIST ===' as check_type;
SELECT 
    tablename,
    rowsecurity as "RLS Enabled"
FROM pg_tables 
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'emergency_contacts', 'incidents')
ORDER BY tablename;

-- ============================================
-- CHECK 2: List ALL Current Policies
-- ============================================
SELECT '=== CURRENT RLS POLICIES ===' as check_type;
SELECT 
    schemaname,
    tablename,
    policyname,
    cmd as operation,
    qual as using_expression,
    with_check as with_check_expression
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd;

-- ============================================
-- CHECK 3: Check Permissions
-- ============================================
SELECT '=== TABLE PERMISSIONS ===' as check_type;
SELECT 
    table_name,
    privilege_type,
    grantee
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'emergency_contacts', 'incidents')
AND grantee IN ('authenticated', 'anon', 'postgres')
ORDER BY table_name, grantee;

-- ============================================
-- CHECK 4: Check Triggers
-- ============================================
SELECT '=== TRIGGERS ===' as check_type;
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
AND event_object_table IN ('profiles', 'emergency_contacts', 'incidents')
ORDER BY event_object_table;

-- ============================================
-- CHECK 5: Check Constraints
-- ============================================
SELECT '=== CONSTRAINTS ===' as check_type;
SELECT 
    conname as constraint_name,
    conrelid::regclass as table_name,
    contype as constraint_type,
    pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid IN ('profiles'::regclass, 'emergency_contacts'::regclass, 'incidents'::regclass)
ORDER BY table_name, contype;

-- ============================================
-- CHECK 6: Check if auth.uid() Function Works
-- ============================================
SELECT '=== AUTH FUNCTION TEST ===' as check_type;
SELECT 
    CASE 
        WHEN auth.uid() IS NULL THEN 'NOT LOGGED IN (this is SQL editor - normal)'
        ELSE 'Logged in as: ' || auth.uid()::text
    END as auth_status;

-- ============================================
-- CHECK 7: Sample Data Check
-- ============================================
SELECT '=== PROFILES COUNT ===' as check_type;
SELECT COUNT(*) as total_profiles FROM profiles;

SELECT '=== EMERGENCY CONTACTS COUNT ===' as check_type;
SELECT COUNT(*) as total_contacts FROM emergency_contacts;

-- ============================================
-- CHECK 8: Check Profile Structure
-- ============================================
SELECT '=== PROFILES TABLE STRUCTURE ===' as check_type;
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- ============================================
-- CHECK 9: Test UPDATE Without RLS
-- ============================================
SELECT '=== DIRECT UPDATE TEST (as postgres) ===' as check_type;
DO $$
DECLARE
    test_user_id uuid;
    rows_affected integer;
BEGIN
    -- Get first user
    SELECT user_id INTO test_user_id FROM profiles LIMIT 1;
    
    IF test_user_id IS NOT NULL THEN
        -- Try update
        UPDATE profiles 
        SET updated_at = NOW()
        WHERE user_id = test_user_id;
        
        GET DIAGNOSTICS rows_affected = ROW_COUNT;
        RAISE NOTICE 'Update test: % rows affected for user %', rows_affected, test_user_id;
    ELSE
        RAISE NOTICE 'No profiles found to test';
    END IF;
END $$;

-- ============================================
-- CHECK 10: Potential Issues
-- ============================================
SELECT '=== POTENTIAL ISSUES ===' as check_type;

-- Check for policies without WITH CHECK
SELECT 
    'Missing WITH CHECK' as issue,
    tablename,
    policyname
FROM pg_policies
WHERE schemaname = 'public'
AND cmd = 'UPDATE'
AND with_check IS NULL;

-- Check for tables without policies
SELECT 
    'Table without policies' as issue,
    t.tablename,
    COUNT(p.policyname) as policy_count
FROM pg_tables t
LEFT JOIN pg_policies p ON t.tablename = p.tablename AND t.schemaname = p.schemaname
WHERE t.schemaname = 'public'
AND t.tablename IN ('profiles', 'emergency_contacts', 'incidents')
GROUP BY t.tablename
HAVING COUNT(p.policyname) < 4;

-- =====================================================
-- END OF DIAGNOSTIC SCRIPT
-- =====================================================
SELECT '=== DIAGNOSTIC COMPLETE ===' as check_type;
