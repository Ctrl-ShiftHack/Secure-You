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
    };
    Views: {
      [_ in never]: never;
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
  user_id: string;
  full_name: string;
  phone_number: string;
  avatar_url?: string;
  address?: string;
  medical_info?: string;
  blood_type?: string;
  allergies?: string;
  emergency_contacts?: EmergencyContact[];
}

export interface EmergencyContact {
  id: string;
  created_at: string;
  user_id: string;
  name: string;
  phone_number: string;
  email?: string;
  relationship?: string;
  is_primary: boolean;
}

export interface Incident {
  id: string;
  created_at: string;
  user_id: string;
  type: 'sos' | 'medical' | 'fire' | 'police' | 'other';
  status: 'active' | 'resolved' | 'cancelled';
  location: Json; // JSONB field - can be object with latitude, longitude, address
  description?: string | null;
  contacted_authorities: boolean;
  notified_contacts: Json; // JSONB array of contact IDs
  resolved_at?: string | null;
}
