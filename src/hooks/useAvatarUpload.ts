
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface UseAvatarUploadReturn {
  uploading: boolean;
  uploadAvatar: (file: File, userId: string) => Promise<string | null>;
  deleteAvatar: (avatarUrl: string, userId: string) => Promise<boolean>;
}

export const useAvatarUpload = (): UseAvatarUploadReturn => {
  const [uploading, setUploading] = useState(false);

  const uploadAvatar = async (file: File, userId: string): Promise<string | null> => {
    try {
      setUploading(true);

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB');
        return null;
      }

      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select an image file');
        return null;
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}/avatar-${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { data, error } = await supabase.storage
        .from('profile-avatars')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true
        });

      if (error) {
        console.error('Error uploading avatar:', error);
        toast.error('Failed to upload avatar. Please try again.');
        return null;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('profile-avatars')
        .getPublicUrl(data.path);

      toast.success('Avatar uploaded successfully!');
      return publicUrl;
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast.error('Failed to upload avatar. Please try again.');
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAvatar = async (avatarUrl: string, userId: string): Promise<boolean> => {
    try {
      // Extract file path from URL
      const urlParts = avatarUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      const filePath = `${userId}/${fileName}`;

      const { error } = await supabase.storage
        .from('profile-avatars')
        .remove([filePath]);

      if (error) {
        console.error('Error deleting avatar:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error deleting avatar:', error);
      return false;
    }
  };

  return {
    uploading,
    uploadAvatar,
    deleteAvatar
  };
};
