// Database Types for Supabase
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at'>;
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'user_id'>>;
      };
      emergency_contacts: {
        Row: EmergencyContact;
        Insert: Omit<EmergencyContact, 'id' | 'created_at'>;
        Update: Partial<Omit<EmergencyContact, 'id' | 'created_at' | 'user_id'>>;
      };
      incidents: {
        Row: Incident;
        Insert: Omit<Incident, 'id' | 'created_at'>;
        Update: Partial<Omit<Incident, 'id' | 'created_at' | 'user_id'>>;
      };
      incident_posts: {
        Row: IncidentPost;
        Insert: Omit<IncidentPost, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<IncidentPost, 'id' | 'created_at' | 'updated_at' | 'user_id'>>;
      };
      post_reactions: {
        Row: PostReaction;
        Insert: Omit<PostReaction, 'id' | 'created_at'>;
        Update: Partial<Omit<PostReaction, 'id' | 'created_at'>>;
      };
      post_comments: {
        Row: PostComment;
        Insert: Omit<PostComment, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<PostComment, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'post_id'>>;
      };
    };
    Views: {
      posts_with_counts: {
        Row: PostWithCounts;
      };
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export interface Profile {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  full_name: string;
  phone_number: string;
  avatar_url?: string | null;
  address?: string | null;
  medical_info?: string | null;
  blood_type?: 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | null;
  allergies?: string | null;
  location_sharing_enabled?: boolean;
}

export interface EmergencyContact {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string | null;
  relationship?: string | null;
  is_primary: boolean;
}

export interface Incident {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  type: 'sos' | 'medical' | 'fire' | 'police' | 'other';
  status: 'active' | 'resolved' | 'cancelled';
  location: Json; // JSONB field - can be object with latitude, longitude, address
  description?: string | null;
  contacted_authorities: boolean;
  notified_contacts: Json; // JSONB array of contact IDs
  resolved_at?: string | null;
}

// Social Feed Types
export interface IncidentPost {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  content?: string | null;
  image_url?: string | null;
  location?: Json | null; // {latitude, longitude, address}
  visibility: 'public' | 'contacts' | 'private';
  is_deleted: boolean;
}

export interface PostReaction {
  id: string;
  created_at: string;
  post_id: string;
  user_id: string;
  reaction_type: 'like' | 'love' | 'care' | 'support';
}

export interface PostComment {
  id: string;
  created_at: string;
  updated_at: string;
  post_id: string;
  user_id: string;
  content: string;
  is_deleted: boolean;
}

// Extended types with user info
export interface PostWithCounts {
  id: string;
  created_at: string;
  updated_at: string;
  user_id: string;
  content?: string | null;
  image_url?: string | null;
  location?: Json | null;
  visibility: string;
  user_name?: string | null;
  user_avatar?: string | null;
  reaction_count: number;
  comment_count: number;
  user_has_reacted: boolean;
}

export interface PostCommentWithUser extends PostComment {
  user_name?: string;
  user_avatar?: string;
}
