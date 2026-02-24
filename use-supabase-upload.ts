import { useState } from 'react';
import { supabase } from '@/db/supabase';

interface UseSupabaseUploadOptions {
  bucket: string;
  path?: string;
}

export function useSupabaseUpload({ bucket, path = '' }: UseSupabaseUploadOptions) {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async (file: File): Promise<string | null> => {
    try {
      setUploading(true);
      setProgress(0);

      // Validate file size (max 1MB)
      const maxSize = 1024 * 1024; // 1MB
      if (file.size > maxSize) {
        throw new Error('File size exceeds 1MB limit');
      }

      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}_${Date.now()}.${fileExt}`;
      const filePath = path ? `${path}/${fileName}` : fileName;

      // Upload file
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Get public URL
      const {
        data: { publicUrl },
      } = supabase.storage.from(bucket).getPublicUrl(filePath);

      setProgress(100);
      return publicUrl;
    } catch (error) {
      console.error('Upload error:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  return {
    uploadFile,
    uploading,
    progress,
  };
}

