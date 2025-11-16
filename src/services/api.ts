import { supabase } from '@/lib/supabase';
import type { 
  Profile, 
  EmergencyContact, 
  Incident,
  IncidentPost,
  PostReaction,
  PostComment,
  PostWithCounts,
  PostCommentWithUser
} from '@/types/database.types';

// Type assertions for Supabase query builder
// These help TypeScript understand the types even before tables are created
type ProfileInsert = Omit<Profile, 'id' | 'created_at'>;
type ProfileUpdate = Partial<Omit<Profile, 'id' | 'created_at' | 'user_id'>>;
type ContactInsert = Omit<EmergencyContact, 'id' | 'created_at'>;
type ContactUpdate = Partial<Omit<EmergencyContact, 'id' | 'created_at' | 'user_id'>>;
type IncidentInsert = Omit<Incident, 'id' | 'created_at'>;
type IncidentUpdate = Partial<Omit<Incident, 'id' | 'created_at' | 'user_id'>>;
type PostInsert = Omit<IncidentPost, 'id' | 'created_at' | 'updated_at'>;
type PostUpdate = Partial<Omit<IncidentPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
type ReactionInsert = Omit<PostReaction, 'id' | 'created_at'>;
type CommentInsert = Omit<PostComment, 'id' | 'created_at' | 'updated_at'>;
type CommentUpdate = Partial<Omit<PostComment, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'post_id'>>;

// Profile Service
export const profileService = {
  async getProfile(userId: string) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*, emergency_contacts(*)')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('user_id', userId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('profiles')
      .insert([profile])
      .select()
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async deleteProfile(userId: string) {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('user_id', userId);
    
    if (error) throw error;
  }
};

// Emergency Contacts Service
export const contactsService = {
  async getContacts(userId: string) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', userId)
      .order('is_primary', { ascending: false });
    
    if (error) throw error;
    return data as EmergencyContact[];
  },

  async getContact(contactId: string) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('id', contactId)
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  },

  async createContact(contact: Omit<EmergencyContact, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .insert([contact])
      .select()
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  },

  async updateContact(contactId: string, updates: Partial<EmergencyContact>) {
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update(updates)
      .eq('id', contactId)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  },

  async deleteContact(contactId: string) {
    const { error } = await supabase
      .from('emergency_contacts')
      .delete()
      .eq('id', contactId);
    
    if (error) throw error;
  },

  async setPrimaryContact(userId: string, contactId: string) {
    // First, unset all other primary contacts
    await supabase
      .from('emergency_contacts')
      .update({ is_primary: false })
      .eq('user_id', userId);

    // Then set the new primary contact
    const { data, error } = await supabase
      .from('emergency_contacts')
      .update({ is_primary: true })
      .eq('id', contactId)
      .select()
      .single();
    
    if (error) throw error;
    return data as EmergencyContact;
  }
};

// Incidents Service
export const incidentsService = {
  async getIncidents(userId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Incident[];
  },

  async getIncident(incidentId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('id', incidentId)
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async createIncident(incident: Omit<Incident, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('incidents')
      .insert([incident])
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async updateIncident(incidentId: string, updates: Partial<Incident>) {
    const { data, error } = await supabase
      .from('incidents')
      .update(updates)
      .eq('id', incidentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async resolveIncident(incidentId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString()
      })
      .eq('id', incidentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async cancelIncident(incidentId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .update({ 
        status: 'cancelled',
        resolved_at: new Date().toISOString()
      })
      .eq('id', incidentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as Incident;
  },

  async getActiveIncidents(userId: string) {
    const { data, error } = await supabase
      .from('incidents')
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'active')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as Incident[];
  }
};

// Social Feed - Posts Service
export const postsService = {
  async getPosts(limit = 50) {
    try {
      const { data, error } = await supabase
        .from('posts_with_counts')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) {
        console.error('Supabase error:', error);
        // If view doesn't exist, return empty array instead of throwing
        if (error.message.includes('does not exist') || error.message.includes('view')) {
          console.warn('posts_with_counts view not found. Please run the SQL migration.');
          return [];
        }
        throw error;
      }
      return data as PostWithCounts[];
    } catch (err) {
      console.error('Error in getPosts:', err);
      return []; // Return empty array to prevent crashes
    }
  },

  async getPost(postId: string) {
    const { data, error } = await supabase
      .from('posts_with_counts')
      .select('*')
      .eq('id', postId)
      .single();
    
    if (error) throw error;
    return data as PostWithCounts;
  },

  async getUserPosts(userId: string) {
    const { data, error } = await supabase
      .from('posts_with_counts')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data as PostWithCounts[];
  },

  async createPost(post: PostInsert) {
    const { data, error } = await supabase
      .from('incident_posts')
      .insert([post])
      .select()
      .single();
    
    if (error) throw error;
    return data as IncidentPost;
  },

  async updatePost(postId: string, updates: PostUpdate) {
    const { data, error } = await supabase
      .from('incident_posts')
      .update(updates)
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    return data as IncidentPost;
  },

  async deletePost(postId: string) {
    // Soft delete
    const { data, error } = await supabase
      .from('incident_posts')
      .update({ is_deleted: true })
      .eq('id', postId)
      .select()
      .single();
    
    if (error) throw error;
    return data as IncidentPost;
  },

  async hardDeletePost(postId: string) {
    // Hard delete (removes from database)
    const { error } = await supabase
      .from('incident_posts')
      .delete()
      .eq('id', postId);
    
    if (error) throw error;
  },

  // Subscribe to real-time updates
  subscribeToNewPosts(callback: (post: IncidentPost) => void) {
    const channel = supabase
      .channel('incident_posts_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'incident_posts'
        },
        (payload) => {
          callback(payload.new as IncidentPost);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// Social Feed - Reactions Service
export const reactionsService = {
  async getPostReactions(postId: string) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('*, profiles(full_name, avatar_url)')
      .eq('post_id', postId);
    
    if (error) throw error;
    return data;
  },

  async getUserReaction(postId: string, userId: string) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .maybeSingle();
    
    if (error) throw error;
    return data as PostReaction | null;
  },

  async addReaction(reaction: ReactionInsert) {
    const { data, error } = await supabase
      .from('post_reactions')
      .upsert([reaction], { onConflict: 'post_id,user_id' })
      .select()
      .single();
    
    if (error) throw error;
    return data as PostReaction;
  },

  async removeReaction(postId: string, userId: string) {
    const { error } = await supabase
      .from('post_reactions')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', userId);
    
    if (error) throw error;
  },

  async toggleReaction(postId: string, userId: string, reactionType: 'like' | 'love' | 'care' | 'support' = 'like') {
    // Check if reaction exists
    const existing = await this.getUserReaction(postId, userId);
    
    if (existing) {
      // Remove reaction
      await this.removeReaction(postId, userId);
      return null;
    } else {
      // Add reaction
      return await this.addReaction({ post_id: postId, user_id: userId, reaction_type: reactionType });
    }
  },

  // Subscribe to real-time reaction updates for a post
  subscribeToPostReactions(postId: string, callback: (reaction: PostReaction, event: 'INSERT' | 'DELETE') => void) {
    const channel = supabase
      .channel(`post_reactions_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_reactions',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const event = payload.eventType as 'INSERT' | 'DELETE';
          callback(payload.new as PostReaction, event);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};

// Social Feed - Comments Service
export const commentsService = {
  async getPostComments(postId: string) {
    const { data, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        profiles:user_id (
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Transform the data to flatten the profile info
    return data.map(comment => ({
      ...comment,
      user_name: comment.profiles?.full_name,
      user_avatar: comment.profiles?.avatar_url
    })) as PostCommentWithUser[];
  },

  async createComment(comment: CommentInsert) {
    const { data, error } = await supabase
      .from('post_comments')
      .insert([comment])
      .select()
      .single();
    
    if (error) throw error;
    return data as PostComment;
  },

  async updateComment(commentId: string, updates: CommentUpdate) {
    const { data, error } = await supabase
      .from('post_comments')
      .update(updates)
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as PostComment;
  },

  async deleteComment(commentId: string) {
    // Soft delete
    const { data, error } = await supabase
      .from('post_comments')
      .update({ is_deleted: true })
      .eq('id', commentId)
      .select()
      .single();
    
    if (error) throw error;
    return data as PostComment;
  },

  async hardDeleteComment(commentId: string) {
    // Hard delete (removes from database)
    const { error } = await supabase
      .from('post_comments')
      .delete()
      .eq('id', commentId);
    
    if (error) throw error;
  },

  // Subscribe to real-time comment updates for a post
  subscribeToPostComments(postId: string, callback: (comment: PostComment, event: 'INSERT' | 'UPDATE' | 'DELETE') => void) {
    const channel = supabase
      .channel(`post_comments_${postId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'post_comments',
          filter: `post_id=eq.${postId}`
        },
        (payload) => {
          const event = payload.eventType as 'INSERT' | 'UPDATE' | 'DELETE';
          callback(payload.new as PostComment, event);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }
};
