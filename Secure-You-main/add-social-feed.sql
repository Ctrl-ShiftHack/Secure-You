-- ============================================
-- SOCIAL FEED FEATURE - Database Migration
-- Creates tables for incident posts, reactions, and comments
-- ============================================

-- ============================================
-- Table: incident_posts
-- Main table for user-shared incidents/posts
-- ============================================
CREATE TABLE IF NOT EXISTS incident_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT,
  image_url TEXT,
  location JSONB, -- {latitude, longitude, address}
  visibility TEXT NOT NULL DEFAULT 'public' CHECK (visibility IN ('public', 'contacts', 'private')),
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_incident_posts_user_id ON incident_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_incident_posts_created_at ON incident_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incident_posts_visibility ON incident_posts(visibility) WHERE NOT is_deleted;

-- Enable Row Level Security
ALTER TABLE incident_posts ENABLE ROW LEVEL SECURITY;

-- RLS Policies for incident_posts
CREATE POLICY "Users can view public posts" ON incident_posts
  FOR SELECT USING (visibility = 'public' AND NOT is_deleted);

CREATE POLICY "Users can view their own posts" ON incident_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create posts" ON incident_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own posts" ON incident_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own posts" ON incident_posts
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Table: post_reactions
-- Reactions (likes, hearts, etc.) on posts
-- ============================================
CREATE TABLE IF NOT EXISTS post_reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  post_id UUID NOT NULL REFERENCES incident_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reaction_type TEXT NOT NULL DEFAULT 'like' CHECK (reaction_type IN ('like', 'love', 'care', 'support')),
  UNIQUE(post_id, user_id) -- One reaction per user per post
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_post_reactions_post_id ON post_reactions(post_id);
CREATE INDEX IF NOT EXISTS idx_post_reactions_user_id ON post_reactions(user_id);

-- Enable Row Level Security
ALTER TABLE post_reactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_reactions
CREATE POLICY "Anyone can view reactions" ON post_reactions
  FOR SELECT USING (true);

CREATE POLICY "Users can add reactions" ON post_reactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can remove their reactions" ON post_reactions
  FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can update their reactions" ON post_reactions
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================
-- Table: post_comments
-- Comments on incident posts
-- ============================================
CREATE TABLE IF NOT EXISTS post_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  post_id UUID NOT NULL REFERENCES incident_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  is_deleted BOOLEAN NOT NULL DEFAULT false
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_post_comments_post_id ON post_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_user_id ON post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_created_at ON post_comments(created_at ASC);

-- Enable Row Level Security
ALTER TABLE post_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for post_comments
CREATE POLICY "Anyone can view comments on public posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incident_posts 
      WHERE incident_posts.id = post_comments.post_id 
      AND incident_posts.visibility = 'public' 
      AND NOT incident_posts.is_deleted
    ) AND NOT is_deleted
  );

CREATE POLICY "Users can view comments on their posts" ON post_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM incident_posts 
      WHERE incident_posts.id = post_comments.post_id 
      AND incident_posts.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create comments" ON post_comments
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" ON post_comments
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comments" ON post_comments
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- Functions and Triggers
-- ============================================

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for incident_posts
CREATE TRIGGER update_incident_posts_updated_at BEFORE UPDATE ON incident_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger for post_comments
CREATE TRIGGER update_post_comments_updated_at BEFORE UPDATE ON post_comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- Views for easier querying
-- ============================================

-- View: posts_with_counts
-- Gets posts with reaction and comment counts
CREATE OR REPLACE VIEW posts_with_counts AS
SELECT 
  p.id,
  p.created_at,
  p.updated_at,
  p.user_id,
  p.content,
  p.image_url,
  p.location,
  p.visibility,
  pr.full_name as user_name,
  pr.avatar_url as user_avatar,
  COUNT(DISTINCT r.id) as reaction_count,
  COUNT(DISTINCT c.id) as comment_count,
  EXISTS(SELECT 1 FROM post_reactions WHERE post_id = p.id AND user_id = auth.uid()) as user_has_reacted
FROM incident_posts p
LEFT JOIN profiles pr ON pr.user_id = p.user_id
LEFT JOIN post_reactions r ON r.post_id = p.id
LEFT JOIN post_comments c ON c.post_id = p.id AND NOT c.is_deleted
WHERE NOT p.is_deleted
GROUP BY p.id, p.created_at, p.updated_at, p.user_id, p.content, p.image_url, p.location, p.visibility, pr.full_name, pr.avatar_url;

-- ============================================
-- Demo Data (Optional)
-- ============================================

-- Insert some demo posts if user exists
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id 
  FROM auth.users 
  WHERE email = 'test@secureyou.com' 
  LIMIT 1;
  
  IF test_user_id IS NOT NULL THEN
    -- Demo post 1
    INSERT INTO incident_posts (user_id, content, location, visibility)
    VALUES (
      test_user_id,
      'Just witnessed a minor accident on Main Street. Everyone seems okay, but traffic is backed up. Stay safe everyone!',
      '{"latitude": 23.8103, "longitude": 90.4125, "address": "Main Street, Dhaka"}'::jsonb,
      'public'
    );
    
    -- Demo post 2
    INSERT INTO incident_posts (user_id, content, visibility)
    VALUES (
      test_user_id,
      'PSA: There''s a road closure near the shopping mall due to construction. Plan alternate routes.',
      'public'
    );
    
    RAISE NOTICE '✅ Added demo posts for social feed';
  END IF;
END $$;

-- ============================================
-- Success Message
-- ============================================
DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '✅ Social Feed Schema Created Successfully!';
  RAISE NOTICE '';
  RAISE NOTICE '📊 Created Tables:';
  RAISE NOTICE '   • incident_posts - Main posts/incidents';
  RAISE NOTICE '   • post_reactions - Likes and reactions';
  RAISE NOTICE '   • post_comments - Comments on posts';
  RAISE NOTICE '';
  RAISE NOTICE '🔐 Row Level Security enabled on all tables';
  RAISE NOTICE '📈 Created view: posts_with_counts';
  RAISE NOTICE '';
  RAISE NOTICE '👉 Next steps:';
  RAISE NOTICE '   1. Run this SQL in your Supabase SQL Editor';
  RAISE NOTICE '   2. Update your frontend to use the new API';
  RAISE NOTICE '   3. Test creating posts, reactions, and comments';
  RAISE NOTICE '';
END $$;
