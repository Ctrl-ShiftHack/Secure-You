import { supabase } from './supabase';

/**
 * Upload image to Supabase Storage
 * @param file - The image file to upload
 * @param userId - The user's ID for organizing files
 * @returns The public URL of the uploaded image or null if failed
 */
export const uploadImage = async (file: File, userId: string): Promise<string | null> => {
  try {
    // Create unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${Date.now()}.${fileExt}`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('incident-photos')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Upload error:', error);
      return null;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('incident-photos')
      .getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

/**
 * Delete image from Supabase Storage
 * @param imageUrl - The public URL of the image
 * @returns true if deleted, false otherwise
 */
export const deleteImage = async (imageUrl: string): Promise<boolean> => {
  try {
    // Extract path from URL
    const urlParts = imageUrl.split('/incident-photos/');
    if (urlParts.length < 2) return false;
    
    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from('incident-photos')
      .remove([filePath]);

    if (error) {
      console.error('Delete error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error deleting image:', error);
    return false;
  }
};

/**
 * Convert file to data URL (fallback if storage fails)
 * @param file - The file to convert
 * @returns Promise with data URL
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
