import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('⚠️ Missing Supabase environment variables!');
  console.warn('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  console.warn('Current values:', { 
    url: supabaseUrl ? '✓ Set' : '✗ Missing', 
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing' 
  });
  console.warn('App will continue with limited functionality. Create a .env file with your Supabase credentials.');
}

// Use dummy values if env vars are missing (allows app to render)
const cleanUrl = supabaseUrl ? supabaseUrl.replace(/\/$/, '') : 'https://placeholder.supabase.co';
const anonKey = supabaseAnonKey || 'placeholder-key';

export const supabase = createClient<Database>(cleanUrl, anonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'secureyou-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
    // Production redirect URLs
    flowType: 'pkce',
    redirectTo: typeof window !== 'undefined' 
      ? `${window.location.origin}/login`
      : undefined,
  },
  global: {
    headers: {
      'X-Client-Info': 'secureyou-web',
    },
  },
  db: {
    schema: 'public',
  },
  realtime: {
    timeout: 30000,
  },
});
