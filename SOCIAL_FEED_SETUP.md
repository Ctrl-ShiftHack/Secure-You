# Social Feed Feature - Setup Guide

## Overview

The social feed feature allows users to share incident posts, react to them, and comment on each other's posts. All data is stored in Supabase with real-time synchronization.

## Features Implemented

✅ **Post Creation**
- Share text and image posts
- Add location to posts
- Public visibility by default
- Real-time post updates

✅ **Reactions**
- Like posts with heart icon
- Real-time reaction count updates
- Toggle reactions on/off
- Shows if current user has reacted

✅ **Comments**
- Add comments to posts
- View all comments in dialog
- Delete your own comments
- Real-time comment updates
- User avatars and timestamps

✅ **Real-time Synchronization**
- New posts appear instantly
- Reactions update live
- Comments sync automatically
- No page refresh needed

## Setup Instructions

### Step 1: Run Database Migration

1. Open your Supabase project dashboard
2. Go to **SQL Editor**
3. Copy and paste the contents of `add-social-feed.sql`
4. Click **Run** to execute the migration

This will create:
- `incident_posts` table
- `post_reactions` table  
- `post_comments` table
- Row Level Security (RLS) policies
- Real-time subscriptions
- Database views for efficient queries

### Step 2: Enable Realtime

1. In Supabase dashboard, go to **Database** → **Replication**
2. Enable replication for these tables:
   - `incident_posts`
   - `post_reactions`
   - `post_comments`

### Step 3: Test the Feature

1. Start your development server: `npm run dev`
2. Log in to the app
3. Navigate to **Incidents** page (from bottom navigation)
4. Try creating a post with text and/or image
5. Add a location (optional)
6. Click **Share**
7. React to posts by clicking the heart icon
8. Click the comment icon to view and add comments

## Database Schema

### incident_posts
```sql
- id: UUID (primary key)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- user_id: UUID (foreign key → auth.users)
- content: TEXT
- image_url: TEXT
- location: JSONB {latitude, longitude, address}
- visibility: TEXT (public, contacts, private)
- is_deleted: BOOLEAN
```

### post_reactions
```sql
- id: UUID (primary key)
- created_at: TIMESTAMPTZ
- post_id: UUID (foreign key → incident_posts)
- user_id: UUID (foreign key → auth.users)
- reaction_type: TEXT (like, love, care, support)
- UNIQUE constraint on (post_id, user_id)
```

### post_comments
```sql
- id: UUID (primary key)
- created_at: TIMESTAMPTZ
- updated_at: TIMESTAMPTZ
- post_id: UUID (foreign key → incident_posts)
- user_id: UUID (foreign key → auth.users)
- content: TEXT
- is_deleted: BOOLEAN
```

## API Services

### Posts Service (`postsService`)

```typescript
// Get all public posts
await postsService.getPosts(limit?: number)

// Get a single post
await postsService.getPost(postId: string)

// Get user's posts
await postsService.getUserPosts(userId: string)

// Create a new post
await postsService.createPost({
  user_id: string,
  content?: string,
  image_url?: string,
  location?: object,
  visibility: 'public' | 'contacts' | 'private',
  is_deleted: false
})

// Update a post
await postsService.updatePost(postId: string, updates: object)

// Delete a post (soft delete)
await postsService.deletePost(postId: string)

// Subscribe to new posts (real-time)
const unsubscribe = postsService.subscribeToNewPosts((post) => {
  // Handle new post
})
```

### Reactions Service (`reactionsService`)

```typescript
// Get all reactions for a post
await reactionsService.getPostReactions(postId: string)

// Check if user has reacted
await reactionsService.getUserReaction(postId: string, userId: string)

// Add a reaction
await reactionsService.addReaction({
  post_id: string,
  user_id: string,
  reaction_type: 'like' | 'love' | 'care' | 'support'
})

// Remove a reaction
await reactionsService.removeReaction(postId: string, userId: string)

// Toggle reaction (add if not exists, remove if exists)
await reactionsService.toggleReaction(postId: string, userId: string, type?: string)

// Subscribe to reaction updates (real-time)
const unsubscribe = reactionsService.subscribeToPostReactions(
  postId: string,
  (reaction, event) => {
    // Handle reaction change
  }
)
```

### Comments Service (`commentsService`)

```typescript
// Get all comments for a post
await commentsService.getPostComments(postId: string)

// Create a comment
await commentsService.createComment({
  post_id: string,
  user_id: string,
  content: string,
  is_deleted: false
})

// Update a comment
await commentsService.updateComment(commentId: string, updates: object)

// Delete a comment (soft delete)
await commentsService.deleteComment(commentId: string)

// Subscribe to comment updates (real-time)
const unsubscribe = commentsService.subscribeToPostComments(
  postId: string,
  (comment, event) => {
    // Handle comment change
  }
)
```

## Component Usage

### Incidents Page (`src/pages/Incidents.tsx`)

Main feed page that displays all posts and allows creating new ones.

**Features:**
- Text input for post content
- Image upload
- Location tagging
- Real-time feed updates
- Loading states

### Incident Card (`src/components/IncidentCard.tsx`)

Individual post card component.

**Props:**
```typescript
{
  post: PostWithCounts,        // Post data with counts
  currentUserId?: string,       // Current logged-in user ID
  onDelete: () => void,         // Delete callback
  onRefresh: () => void         // Refresh feed callback
}
```

**Features:**
- User avatar and name
- Post content and image
- Location display
- Reaction button with count
- Comment button with count
- Share button
- Delete option (owner only)
- Real-time updates

## Security

### Row Level Security (RLS)

All tables have RLS enabled with the following policies:

**incident_posts:**
- Anyone can view public posts
- Users can view their own posts
- Users can create posts
- Users can update/delete only their own posts

**post_reactions:**
- Anyone can view reactions
- Users can add/remove only their own reactions

**post_comments:**
- Anyone can view comments on public posts
- Users can view comments on their own posts
- Users can create comments
- Users can update/delete only their own comments

## Troubleshooting

### Posts not loading
- Check if Supabase tables are created
- Verify RLS policies are enabled
- Check browser console for errors
- Ensure user is authenticated

### Real-time not working
- Enable replication in Supabase dashboard
- Check if real-time subscriptions are active
- Verify network connection
- Check Supabase project status

### Images not displaying
- For production, implement proper image upload to Supabase Storage
- Current implementation uses data URLs (base64)
- Consider file size limits

### Comments not appearing
- Check if post_comments table exists
- Verify user is authenticated
- Check RLS policies
- Look for errors in console

## Future Enhancements

### Recommended Improvements

1. **Image Upload to Storage**
   - Replace base64 with Supabase Storage
   - Add image compression
   - Generate thumbnails

2. **Advanced Reactions**
   - Multiple reaction types (love, care, support)
   - Reaction picker UI
   - Show who reacted

3. **Comment Features**
   - Edit comments
   - Reply to comments (nested)
   - @mentions
   - Emoji support

4. **Post Features**
   - Edit posts
   - Post visibility controls
   - Pin important posts
   - Report/flag posts

5. **Performance**
   - Infinite scroll pagination
   - Image lazy loading
   - Virtual scrolling for large feeds
   - Caching strategies

6. **Notifications**
   - Push notifications for reactions
   - Comment notifications
   - @mention notifications

## Testing Checklist

- [ ] Create a post with text only
- [ ] Create a post with image only
- [ ] Create a post with text and image
- [ ] Add location to a post
- [ ] React to a post
- [ ] Unreact to a post
- [ ] Add a comment
- [ ] Delete your comment
- [ ] Delete your post
- [ ] View comments dialog
- [ ] Test real-time updates (open in 2 tabs)
- [ ] Test on mobile layout
- [ ] Test with slow network

## Support

If you encounter issues:

1. Check the browser console for errors
2. Verify Supabase connection in Network tab
3. Review RLS policies in Supabase dashboard
4. Check authentication status
5. Ensure all migrations are applied

For additional help, refer to:
- [Supabase Documentation](https://supabase.com/docs)
- [React Documentation](https://react.dev)
- Project README.md
