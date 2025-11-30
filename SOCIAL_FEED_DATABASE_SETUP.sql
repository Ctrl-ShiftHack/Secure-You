-- ============================================
-- SOCIAL MEDIA FEED - DATABASE SETUP
-- Complete schema for likes, comments, and social features
-- ============================================

-- Enable RLS on all tables
ALTER TABLE incident_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- POST REACTIONS (LIKES) POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can add their own reactions" ON post_reactions;
DROP POLICY IF EXISTS "Users can delete their own reactions" ON post_reactions;

-- Create new policies
CREATE POLICY "Users can view all reactions"
  ON post_reactions FOR SELECT
  USING (true);

CREATE POLICY "Users can add their own reactions"
  ON post_reactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reactions"
  ON post_reactions FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- POST COMMENTS POLICIES
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all comments" ON post_comments;
DROP POLICY IF EXISTS "Users can add comments" ON post_comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON post_comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON post_comments;

-- Create new policies
CREATE POLICY "Users can view all comments"
  ON post_comments FOR SELECT
  USING (true);

CREATE POLICY "Users can add comments"
  ON post_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments"
  ON post_comments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments"
  ON post_comments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- INCIDENT POSTS POLICIES (if not exists)
-- ============================================

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view all posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can create posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can update their own posts" ON incident_posts;
DROP POLICY IF EXISTS "Users can delete their own posts" ON incident_posts;

-- Create new policies
CREATE POLICY "Users can view all posts"
  ON incident_posts FOR SELECT
  USING (true);

CREATE POLICY "Users can create posts"
  ON incident_posts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts"
  ON incident_posts FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts"
  ON incident_posts FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- ADD INDEXES FOR PERFORMANCE
-- ============================================

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_posts_user_id ON incident_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_posts_created_at ON incident_posts(created_at DESC);

-- Composite index for checking if user liked a post
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_user ON post_reactions(post_id, user_id);

-- ============================================
-- UPDATED_AT TRIGGERS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers if they don't exist
DROP TRIGGER IF EXISTS update_incident_posts_updated_at ON incident_posts;
CREATE TRIGGER update_incident_posts_updated_at
    BEFORE UPDATE ON incident_posts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_post_comments_updated_at ON post_comments;
CREATE TRIGGER update_post_comments_updated_at
    BEFORE UPDATE ON post_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Drop existing view if it exists
DROP VIEW IF EXISTS posts_with_counts CASCADE;

-- Function to get post with like/comment counts
CREATE VIEW posts_with_counts AS
SELECT 
    ip.id,
    ip.created_at,
    ip.updated_at,
    ip.user_id,
    ip.content,
    ip.image_url,
    ip.location,
    ip.visibility,
    ip.is_deleted,
    p.full_name as user_name,
    p.avatar_url as user_avatar,
    COALESCE(reaction_counts.like_count, 0) as reaction_count,
    COALESCE(reaction_counts.love_count, 0) as love_count,
    COALESCE(reaction_counts.support_count, 0) as support_count,
    COALESCE(comment_counts.comment_count, 0) as comment_count,
    CASE WHEN user_reactions.user_id IS NOT NULL THEN true ELSE false END as user_has_reacted
FROM incident_posts ip
LEFT JOIN profiles p ON ip.user_id = p.user_id
LEFT JOIN (
    SELECT 
        post_id,
        COUNT(CASE WHEN reaction_type = 'like' THEN 1 END) as like_count,
        COUNT(CASE WHEN reaction_type = 'love' THEN 1 END) as love_count,
        COUNT(CASE WHEN reaction_type = 'support' THEN 1 END) as support_count
    FROM post_reactions
    GROUP BY post_id
) reaction_counts ON ip.id = reaction_counts.post_id
LEFT JOIN (
    SELECT post_id, COUNT(*) as comment_count
    FROM post_comments
    WHERE is_deleted = false
    GROUP BY post_id
) comment_counts ON ip.id = comment_counts.post_id
LEFT JOIN (
    SELECT DISTINCT post_id, user_id
    FROM post_reactions
    WHERE user_id = auth.uid()
) user_reactions ON ip.id = user_reactions.post_id
WHERE ip.is_deleted = false
ORDER BY ip.created_at DESC;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT 'incident_posts' as table_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'incident_posts') as exists;
SELECT 'post_reactions' as table_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'post_reactions') as exists;
SELECT 'post_comments' as table_name, 
       EXISTS(SELECT 1 FROM information_schema.tables WHERE table_name = 'post_comments') as exists;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('incident_posts', 'post_reactions', 'post_comments');

-- Check policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename IN ('incident_posts', 'post_reactions', 'post_comments')
ORDER BY tablename, policyname;

-- Success message
SELECT '✅ SOCIAL MEDIA FEED DATABASE SETUP COMPLETE!' as status;
SELECT '✅ All policies created' as status;
SELECT '✅ All indexes created' as status;
SELECT '✅ View created: posts_with_counts' as status;
SELECT '✅ Ready to use Instagram/Facebook-style feed!' as status;
