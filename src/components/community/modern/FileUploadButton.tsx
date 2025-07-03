
import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Paperclip, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface FileUploadButtonProps {
  onFileUploaded: (fileUrl: string, fileName: string, fileType: string, fileSize: number) => void;
  disabled?: boolean;
  maxFileSize?: number; // in bytes, default 10MB
  acceptedTypes?: string[];
}

export const FileUploadButton: React.FC<FileUploadButtonProps> = ({
  onFileUploaded,
  disabled = false,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  acceptedTypes = ['image/*', 'application/pdf', '.doc', '.docx', '.txt']
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file size
    if (file.size > maxFileSize) {
      toast.error(`File size must be less than ${Math.round(maxFileSize / (1024 * 1024))}MB`);
      return;
    }

    // Validate file type
    const isValidType = acceptedTypes.some(type => {
      if (type.includes('*')) {
        return file.type.startsWith(type.split('*')[0]);
      }
      return file.type === type || file.name.toLowerCase().endsWith(type);
    });

    if (!isValidType) {
      toast.error('File type not supported');
      return;
    }

    setIsUploading(true);

    try {
      // Create a unique file name
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `community-uploads/${fileName}`;

      // Upload to Supabase Storage (we'll need to create this bucket)
      const { data, error } = await supabase.storage
        .from('community-files')
        .upload(filePath, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('community-files')
        .getPublicUrl(filePath);

      // Call the callback with file details
      onFileUploaded(publicUrl, file.name, file.type, file.size);
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Failed to upload file');
    } finally {
      setIsUploading(false);
      // Reset the input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={handleFileSelect}
        disabled={disabled || isUploading}
        className="h-8 w-8 p-0"
      >
        {isUploading ? (
          <Upload className="h-4 w-4 animate-pulse" />
        ) : (
          <Paperclip className="h-4 w-4" />
        )}
      </Button>
      <input
        ref={fileInputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        style={{ display: 'none' }}
      />
    </>
  );
};
