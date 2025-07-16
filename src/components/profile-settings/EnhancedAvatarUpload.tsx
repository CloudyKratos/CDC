
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Camera, Upload, Trash2, Loader2 } from 'lucide-react';
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { toast } from 'sonner';

interface EnhancedAvatarUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  userName: string;
  onAvatarChange: (newAvatarUrl: string | null) => void;
  disabled?: boolean;
}

export const EnhancedAvatarUpload: React.FC<EnhancedAvatarUploadProps> = ({
  currentAvatarUrl,
  userId,
  userName,
  onAvatarChange,
  disabled = false
}) => {
  const [preview, setPreview] = useState<string | null>(null);
  const { uploading, uploadAvatar, deleteAvatar } = useAvatarUpload();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || disabled) return;

    // Show preview immediately
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);

    // Upload file
    const newAvatarUrl = await uploadAvatar(file, userId);
    if (newAvatarUrl) {
      onAvatarChange(newAvatarUrl);
      setPreview(null); // Clear preview since we have the actual URL now
    } else {
      setPreview(null); // Clear preview on failure
    }

    // Reset file input
    event.target.value = '';
  };

  const handleRemoveAvatar = async () => {
    if (!currentAvatarUrl || disabled) return;

    try {
      const success = await deleteAvatar(currentAvatarUrl, userId);
      if (success) {
        onAvatarChange(null);
        toast.success('Avatar removed successfully');
      } else {
        toast.error('Failed to remove avatar');
      }
    } catch (error) {
      console.error('Error removing avatar:', error);
      toast.error('Failed to remove avatar');
    }
  };

  const displayAvatarUrl = preview || currentAvatarUrl;

  return (
    <div className="flex flex-col sm:flex-row items-center gap-6">
      <div className="relative group">
        <Avatar className="h-24 w-24 ring-4 ring-background shadow-lg">
          <AvatarImage src={displayAvatarUrl} />
          <AvatarFallback className="text-xl bg-primary/10">
            {userName?.split(' ').map(n => n[0]).join('').toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
        
        {uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center">
            <Loader2 className="h-6 w-6 text-white animate-spin" />
          </div>
        )}
        
        {!disabled && !uploading && (
          <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
            <Camera className="h-6 w-6 text-white" />
          </div>
        )}
        
        {!disabled && (
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            disabled={uploading}
          />
        )}
      </div>
      
      <div className="text-center sm:text-left">
        <h3 className="font-semibold text-foreground">Profile Picture</h3>
        <p className="text-sm text-muted-foreground mb-3">
          Upload a profile picture to personalize your account. JPG, PNG, WebP, or GIF up to 5MB.
        </p>
        
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            disabled={disabled || uploading}
            onClick={() => {
              const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
              fileInput?.click();
            }}
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Uploading...' : 'Upload Picture'}
          </Button>
          
          {currentAvatarUrl && !disabled && (
            <Button
              variant="outline"
              size="sm"
              className="gap-2 text-destructive hover:text-destructive"
              onClick={handleRemoveAvatar}
              disabled={uploading}
            >
              <Trash2 className="h-4 w-4" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
