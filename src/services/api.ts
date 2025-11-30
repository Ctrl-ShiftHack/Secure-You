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
      .select('*')
      .eq('user_id', userId)
      .single();
    
    if (error) throw error;
    return data as Profile;
  },

  async updateProfile(userId: string, updates: Partial<Profile>) {
    console.log('🔧 profileService.updateProfile: Called', { userId, updates });
    
    try {
      // Step 1: Validate userId
      if (!userId || userId.trim() === '') {
        console.error('❌ Invalid user ID');
        throw new Error('Invalid user ID');
      }
      console.log('✓ Step 1: User ID validated');

      // Step 2: Clean updates
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined && v !== null)
      );
      
      console.log('✓ Step 2: Clean updates', cleanUpdates);

      if (Object.keys(cleanUpdates).length === 0) {
        console.error('❌ No valid fields to update');
        throw new Error('No valid fields to update');
      }
      console.log('✓ Step 3: Fields validated');

      // Step 3: Check Supabase connection
      console.log('✓ Step 4: Calling Supabase update...');
      console.log('  - Table: profiles');
      console.log('  - Filter: user_id =', userId);
      console.log('  - Update:', cleanUpdates);
      
      const startTime = Date.now();
      
      const { data, error } = await supabase
        .from('profiles')
        .update(cleanUpdates)
        .eq('user_id', userId)
        .select()
        .single();
      
      const duration = Date.now() - startTime;
      console.log(`✓ Step 5: Supabase responded in ${duration}ms`);
      console.log('  - Data:', data);
      console.log('  - Error:', error);
      
      if (error) {
        console.error('❌ Profile update error:', error);
        console.error('  - Code:', error.code);
        console.error('  - Message:', error.message);
        console.error('  - Details:', error.details);
        console.error('  - Hint:', error.hint);
        
        // Provide specific error messages
        if (error.code === 'PGRST116') {
          throw new Error('Profile not found. Please try logging out and back in.');
        }
        if (error.message.includes('violates row-level security') || error.code === '42501') {
          throw new Error('Permission denied. RLS policy blocking update. Run COMPLETE_DATABASE_RESET.sql in Supabase.');
        }
        if (error.message.includes('timeout') || error.code === 'PGRST301') {
          throw new Error('Database timeout. Please check your connection.');
        }
        if (error.message.includes('JWT')) {
          throw new Error('Session expired. Please log out and back in.');
        }
        
        throw new Error(error.message || 'Failed to update profile');
      }
      
      if (!data) {
        console.error('❌ No data returned after update');
        throw new Error('No data returned after update. Please try again.');
      }
      
      console.log('✅ profileService.updateProfile: Success!');
      return data as Profile;
    } catch (error: any) {
      console.error('❌ Update profile failed:', error);
      console.error('  - Name:', error.name);
      console.error('  - Message:', error.message);
      console.error('  - Stack:', error.stack);
      throw error;
    }
  },

  async createProfile(profile: Omit<Profile, 'id' | 'created_at'>) {
    try {
      // Validate required fields
      if (!profile.user_id || !profile.full_name) {
        throw new Error('Missing required fields: user_id or full_name');
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([{
          ...profile,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Profile creation error:', error);
        throw new Error(error.message || 'Failed to create profile');
      }
      
      if (!data) {
        throw new Error('No data returned after creation');
      }
      
      return data as Profile;
    } catch (error: any) {
      console.error('Create profile failed:', error);
      throw error;
    }
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
    try {
      // Validate required fields
      if (!contact.name || !contact.phone_number || !contact.user_id) {
        throw new Error('Missing required fields: name, phone_number, or user_id');
      }

      const { data, error } = await supabase
        .from('emergency_contacts')
        .insert([{
          ...contact,
          updated_at: new Date().toISOString()
        }])
        .select()
        .single();
      
      if (error) {
        console.error('Contact creation error:', error);
        throw new Error(error.message || 'Failed to create contact');
      }
      
      if (!data) {
        throw new Error('No data returned after creation');
      }
      
      return data as EmergencyContact;
    } catch (error: any) {
      console.error('Create contact failed:', error);
      throw error;
    }
  },

  async updateContact(contactId: string, updates: Partial<EmergencyContact>) {
    try {
      // Remove undefined values
      const cleanUpdates = Object.fromEntries(
        Object.entries(updates).filter(([_, v]) => v !== undefined)
      );

      const { data, error } = await supabase
        .from('emergency_contacts')
        .update(cleanUpdates)
        .eq('id', contactId)
        .select()
        .single();
      
      if (error) {
        console.error('Contact update error:', error);
        throw new Error(error.message || 'Failed to update contact');
      }
      
      if (!data) {
        throw new Error('No data returned after update');
      }
      
      return data as EmergencyContact;
    } catch (error: any) {
      console.error('Update contact failed:', error);
      throw error;
    }
  },

  async deleteContact(contactId: string) {
    try {
      if (!contactId) {
        throw new Error('Contact ID is required');
      }

      const { error } = await supabase
        .from('emergency_contacts')
        .delete()
        .eq('id', contactId);
      
      if (error) {
        console.error('Contact deletion error:', error);
        throw new Error(error.message || 'Failed to delete contact');
      }
    } catch (error: any) {
      console.error('Delete contact failed:', error);
      throw error;
    }
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
  async getPosts(limit = 50, offset = 0) {
    try {
      const { data, error } = await supabase
        .from('posts_with_counts')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);
      
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

  async getUserReactions(userId: string) {
    const { data, error } = await supabase
      .from('post_reactions')
      .select('*')
      .eq('user_id', userId);
    
    if (error) throw error;
    return data as PostReaction[];
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
