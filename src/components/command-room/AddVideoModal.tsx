
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';

interface AddVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ isOpen, onClose }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim() || !videoUrl.trim()) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);
    
    try {
      // TODO: Implement video upload logic here
      // This would typically involve uploading to your backend/database
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Video added successfully!');
      onClose();
      
      // Reset form
      setTitle('');
      setDescription('');
      setVideoUrl('');
    } catch (error) {
      toast.error('Failed to add video');
      console.error('Error adding video:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Add New Content
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter video title"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter video description"
              rows={3}
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="videoUrl">Video URL *</Label>
            <div className="relative">
              <LinkIcon className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                id="videoUrl"
                value={videoUrl}
                onChange={(e) => setVideoUrl(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="pl-10"
                disabled={isLoading}
              />
            </div>
            <p className="text-xs text-gray-500">
              Supports YouTube, Vimeo, and direct video file URLs
            </p>
          </div>
          
          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? 'Adding...' : 'Add Video'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
