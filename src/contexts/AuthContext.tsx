import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import { profileService } from '@/services/api';
import type { Profile } from '@/types/database.types';
import { initializeOfflineSupport } from '@/lib/offline';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<{ error: Error | null }>;
  updateEmail: (newEmail: string, password: string) => Promise<{ error: Error | null }>;
  reauthenticate: (password: string) => Promise<{ error: Error | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    let loadingTimeout: NodeJS.Timeout;

    // Get initial session
    const initializeAuth = async () => {
      try {
        // Set a timeout to prevent infinite loading
        loadingTimeout = setTimeout(() => {
          if (isMounted && loading) {
            console.warn('Auth initialization timeout - forcing completion');
            setLoading(false);
          }
        }, 10000); // 10 second timeout

        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          clearTimeout(loadingTimeout);
          return;
        }

        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setLoading(false);
        }
        
        clearTimeout(loadingTimeout);
      } catch (error) {
        console.error('Error initializing auth:', error);
        setLoading(false);
        clearTimeout(loadingTimeout);
      }
    };

    initializeAuth();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => {
      isMounted = false;
      if (loadingTimeout) clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  const loadProfile = async (userId: string) => {
    try {
      const profileData = await profileService.getProfile(userId);
      setProfile(profileData);
    } catch (error: any) {
      // Profile might not exist yet (e.g., new user after email verification)
      if (error?.code === 'PGRST116' || error?.message?.includes('No rows')) {
        // Try to create profile automatically from user metadata
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (user?.user_metadata?.full_name) {
            const newProfile = await profileService.createProfile({
              user_id: userId,
              full_name: user.user_metadata.full_name,
              phone_number: '',
              updated_at: new Date().toISOString(),
            });
            setProfile(newProfile);
          } else {
            // No metadata available, create minimal profile
            const newProfile = await profileService.createProfile({
              user_id: userId,
              full_name: user?.email?.split('@')[0] || 'User',
              phone_number: '',
              updated_at: new Date().toISOString(),
            });
            setProfile(newProfile);
          }
        } catch (createError) {
          console.error('Could not auto-create profile:', createError);
          // Still set profile to empty object to prevent redirect loops
          setProfile(null);
        }
      } else {
        console.error('Error loading profile:', error);
        setProfile(null);
      }
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Use production URL for email redirect, fallback to current origin
      const redirectUrl = import.meta.env.PROD 
        ? 'https://secure-you.vercel.app/verify-email'
        : `${window.location.origin}/verify-email`;
      
      // Store full name in user metadata so it's available after email verification
      const { error: signUpError, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
          emailRedirectTo: redirectUrl,
        },
      });

      if (signUpError) {
        // Enhance error messages for common issues
        if (signUpError.message.includes('fetch')) {
          return { 
            error: { 
              ...signUpError, 
              message: 'Network error: Unable to connect to authentication service. Please check your internet connection and try again.' 
            } as AuthError 
          };
        }
        if (signUpError.message.includes('already registered')) {
          return { 
            error: { 
              ...signUpError, 
              message: 'This email is already registered. Please try logging in instead.' 
            } as AuthError 
          };
        }
        return { error: signUpError };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Signup error:', error);
      // Handle network errors and other exceptions
      return { 
        error: {
          name: 'AuthError',
          message: error?.message || 'An unexpected error occurred during signup. Please try again.',
          status: error?.status || 500,
        } as AuthError 
      };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        // Enhance error messages for common issues
        if (error.message.includes('fetch')) {
          return { 
            error: { 
              ...error, 
              message: 'Network error: Unable to connect to authentication service. Please check your internet connection and try again.' 
            } as AuthError 
          };
        }
        if (error.message.includes('Invalid login credentials')) {
          return { 
            error: { 
              ...error, 
              message: 'Invalid email or password. Please check your credentials and try again.' 
            } as AuthError 
          };
        }
        if (error.message.includes('Email not confirmed')) {
          return { 
            error: { 
              ...error, 
              message: 'Please verify your email address before logging in. Check your inbox for the verification link.' 
            } as AuthError 
          };
        }
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Login error:', error);
      return { 
        error: {
          name: 'AuthError',
          message: error?.message || 'An unexpected error occurred during login. Please try again.',
          status: error?.status || 500,
        } as AuthError 
      };
    }
  };

  const signOut = async () => {
    try {
      // Clear local state first for immediate UI response
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Then sign out from Supabase
      await supabase.auth.signOut();
      
      // Clear any cached data
      localStorage.clear();
      sessionStorage.clear();
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if sign out fails, clear local state
      setUser(null);
      setSession(null);
      setProfile(null);
      localStorage.clear();
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) throw new Error('No user logged in');
    
    const updatedProfile = await profileService.updateProfile(user.id, updates);
    setProfile(updatedProfile);
  };

  const reauthenticate = async (password: string) => {
    try {
      if (!user?.email) {
        return { error: new Error('No user email found') };
      }

      const { error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password,
      });

      if (error) {
        return { error: new Error('Current password is incorrect') };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error?.message || 'Authentication failed') };
    }
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    try {
      // First, reauthenticate the user
      const { error: reAuthError } = await reauthenticate(currentPassword);
      if (reAuthError) {
        return { error: reAuthError };
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) {
        return { error: new Error(updateError.message) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error?.message || 'Failed to update password') };
    }
  };

  const updateEmail = async (newEmail: string, password: string) => {
    try {
      // First, reauthenticate the user
      const { error: reAuthError } = await reauthenticate(password);
      if (reAuthError) {
        return { error: reAuthError };
      }

      // Update email
      const { error: updateError } = await supabase.auth.updateUser({
        email: newEmail,
      });

      if (updateError) {
        return { error: new Error(updateError.message) };
      }

      return { error: null };
    } catch (error: any) {
      return { error: new Error(error?.message || 'Failed to update email') };
    }
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    updatePassword,
    updateEmail,
    reauthenticate,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
