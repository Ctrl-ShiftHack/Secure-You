-- ============================================
-- SUPABASE STORAGE POLICIES FOR INCIDENT PHOTOS
-- Run this in Supabase SQL Editor
-- ============================================

-- Create the storage bucket first (if not already created via UI)
-- Go to Storage → Create bucket → Name: incident-photos → Public: YES

-- ============================================
-- Storage Policies
-- ============================================

-- Policy 1: Allow authenticated users to upload photos
INSERT INTO storage.policies (name, bucket_id, definition, check_constraint)
VALUES (
  'Users can upload photos',
  'incident-photos',
  '(auth.role() = ''authenticated'')',
  '(bucket_id = ''incident-photos'')'
)
ON CONFLICT DO NOTHING;

-- Or use this simpler approach:
DROP POLICY IF EXISTS "Users can upload photos" ON storage.objects;
CREATE POLICY "Users can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'incident-photos');

-- Policy 2: Allow everyone to view/download photos (public bucket)
DROP POLICY IF EXISTS "Photos are publicly viewable" ON storage.objects;
CREATE POLICY "Photos are publicly viewable"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'incident-photos');

-- Policy 3: Allow authenticated users to update their own photos
DROP POLICY IF EXISTS "Users can update own photos" ON storage.objects;
CREATE POLICY "Users can update own photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'incident-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Policy 4: Allow authenticated users to delete their own photos
DROP POLICY IF EXISTS "Users can delete own photos" ON storage.objects;
CREATE POLICY "Users can delete own photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'incident-photos' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ============================================
-- Verify Policies
-- ============================================
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
AND schemaname = 'storage'
ORDER BY policyname;

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '✅ Storage policies created successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📸 You can now:';
  RAISE NOTICE '   • Upload photos (authenticated users)';
  RAISE NOTICE '   • View photos (everyone)';
  RAISE NOTICE '   • Update own photos (authenticated users)';
  RAISE NOTICE '   • Delete own photos (authenticated users)';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Security: Files stored in user-specific folders';
  RAISE NOTICE '';
END $$;
