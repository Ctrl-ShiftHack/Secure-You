import { useAuth } from "@/contexts/AuthContext";

export type Profile = {
  name: string;
  email?: string;
  password?: string;
  phone?: string;
  address?: string;
};

/**
 * Legacy hook for backward compatibility
 * Now uses Supabase AuthContext instead of localStorage
 * @deprecated Use useAuth() directly instead
 */
export default function useProfile() {
  const { user, profile: supabaseProfile, updateProfile } = useAuth();

  // Convert Supabase profile format to legacy format
  const profile: Profile = {
    name: supabaseProfile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || "User",
    email: user?.email || "",
    password: "", // Never expose password
    phone: supabaseProfile?.phone_number || "",
    address: "", // Add this field to Supabase profile if needed
  };

  // Legacy setProfile function - now updates Supabase profile
  const setProfile = async (newProfile: Profile) => {
    try {
      await updateProfile({
        full_name: newProfile.name,
        phone_number: newProfile.phone,
      });
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  return { profile, setProfile } as const;
}
