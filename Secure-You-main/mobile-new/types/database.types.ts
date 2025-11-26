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
        Row: {
          user_id: string
          full_name: string
          phone_number: string
          emergency_contacts: Json | null
          location_sharing_enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          phone_number: string
          emergency_contacts?: Json | null
          location_sharing_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          phone_number?: string
          emergency_contacts?: Json | null
          location_sharing_enabled?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      incident_posts: {
        Row: {
          id: string
          user_id: string
          content: string | null
          image_url: string | null
          location: Json | null
          visibility: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content?: string | null
          image_url?: string | null
          location?: Json | null
          visibility?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string | null
          image_url?: string | null
          location?: Json | null
          visibility?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      post_reactions: {
        Row: {
          id: string
          post_id: string
          user_id: string
          reaction_type: string
          created_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          reaction_type?: string
          created_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          reaction_type?: string
          created_at?: string
        }
      }
      post_comments: {
        Row: {
          id: string
          post_id: string
          user_id: string
          content: string
          is_deleted: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          post_id: string
          user_id: string
          content: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          post_id?: string
          user_id?: string
          content?: string
          is_deleted?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type IncidentPost = Database['public']['Tables']['incident_posts']['Row'];
export type PostReaction = Database['public']['Tables']['post_reactions']['Row'];
export type PostComment = Database['public']['Tables']['post_comments']['Row'];
