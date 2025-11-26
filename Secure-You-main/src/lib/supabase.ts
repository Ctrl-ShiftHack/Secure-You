/**
 * Supabase Client Configuration
 * Connects the app to Supabase backend for authentication and database
 */

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

// Get credentials from environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Warn if credentials are missing (helps with debugging)
if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables!');
  console.warn('Create a .env file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
}

// Use placeholder values if missing to prevent app crash
const cleanUrl = supabaseUrl?.replace(/\/$/, '') || 'https://placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'placeholder-key';

/**
 * Supabase client instance
 * Used throughout the app for:
 * - User authentication (login, signup, logout)
 * - Database operations (profiles, contacts, incidents)
 * - Real-time subscriptions
 */
export const supabase = createClient<Database>(cleanUrl, anonKey, {
  auth: {
    autoRefreshToken: true,        // Automatically refresh expired tokens
    persistSession: true,           // Save session to localStorage
    detectSessionInUrl: true,       // Handle OAuth callbacks
    storageKey: 'secureyou-auth',  // localStorage key for session
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    flowType: 'pkce',              // Use PKCE flow for security
    redirectTo: typeof window !== 'undefined' 
      ? `${window.location.origin}/setup` 
      : undefined,
  },
});
