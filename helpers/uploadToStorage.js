// helpers/uploadToStorage.js
import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client using your existing .env variables
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

export const uploadToStorage = async (file, folderName) => {
  try {
    if (!file) return '';

    // Create a unique filename to prevent overwriting files with identical names
    const fileExtension = file.originalname.split('.').pop();
    const fileName = `${folderName}/${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExtension}`;

    // Upload the file buffer directly to your Supabase storage bucket
    const { data, error } = await supabase.storage
      .from('portfolio-assets') // Ensure this matches your bucket name exactly
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false
      });

    if (error) {
      throw new Error(`Supabase upload error: ${error.message}`);
    }

    // Get the public URL for the newly uploaded asset
    const { data: publicUrlData } = supabase.storage
      .from('portfolio-assets')
      .getPublicUrl(fileName);

    return publicUrlData.publicUrl; // This returns the clean string URL
  } catch (error) {
    console.error('Error in uploadToStorage:', error);
    throw error;
  }
};