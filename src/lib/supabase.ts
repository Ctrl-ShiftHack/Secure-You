import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/database.types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables!');
  console.error('Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env file');
  console.error('Current values:', { 
    url: supabaseUrl ? '✓ Set' : '✗ Missing', 
    key: supabaseAnonKey ? '✓ Set' : '✗ Missing' 
  });
  throw new Error('Missing Supabase environment variables. Please check your .env file and restart the dev server.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    storageKey: 'secureyou-auth',
    storage: typeof window !== 'undefined' ? window.localStorage : undefined,
  },
});
