
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';
import { LearningItem } from './LearningCard';

interface AddYouTubeVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: LearningItem) => void;
}

const AddYouTubeVideoModal: React.FC<AddYouTubeVideoModalProps> = ({
  isOpen,
  onClose,
  onAdd
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    youtubeUrl: '',
    category: 'mindset',
    level: 'beginner',
    coach: '',
    duration: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const videoId = extractVideoId(formData.youtubeUrl);
      if (!videoId) {
        toast.error('Invalid YouTube URL');
        return;
      }

      const newItem: LearningItem = {
        id: Date.now().toString(),
        title: formData.title,
        type: 'replay',
        category: formData.category,
        level: formData.level as 'beginner' | 'intermediate' | 'advanced',
        coach: formData.coach,
        format: 'video',
        lastReviewed: 'Just added',
        progress: 0,
        isPrivate: false,
        isPremium: false,
        isFavorited: false,
        description: formData.description,
        duration: formData.duration,
        youtubeId: videoId,
        youtubeUrl: formData.youtubeUrl
      };

      onAdd(newItem);
      
      setFormData({
        title: '',
        description: '',
        youtubeUrl: '',
        category: 'mindset',
        level: 'beginner',
        coach: '',
        duration: ''
      });
      
      onClose();
      toast.success('YouTube video added successfully!');
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
            <Icons.Video className="h-6 w-6 text-red-500" />
            Add YouTube Video
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="youtubeUrl">YouTube URL *</Label>
              <Input
                id="youtubeUrl"
                type="url"
                placeholder="https://youtube.com/watch?v=..."
                value={formData.youtubeUrl}
                onChange={(e) => setFormData({ ...formData, youtubeUrl: e.target.value })}
                required
                className="mt-1"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a YouTube video URL (youtube.com/watch?v=... or youtu.be/...)
              </p>
            </div>

            <div>
              <Label htmlFor="title">Video Title *</Label>
              <Input
                id="title"
                placeholder="Enter video title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="What will viewers learn from this video?"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="mt-1 min-h-20"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mindset">Mindset</SelectItem>
                    <SelectItem value="productivity">Productivity</SelectItem>
                    <SelectItem value="wellness">Wellness</SelectItem>
                    <SelectItem value="strategy">Strategy</SelectItem>
                    <SelectItem value="rituals">Rituals</SelectItem>
                    <SelectItem value="wisdom">Wisdom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="level">Level</Label>
                <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="coach">Coach/Creator</Label>
                <Input
                  id="coach"
                  placeholder="Content creator name"
                  value={formData.coach}
                  onChange={(e) => setFormData({ ...formData, coach: e.target.value })}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="duration">Duration</Label>
                <Input
                  id="duration"
                  placeholder="e.g., 15 min, 1.5 hours"
                  value={formData.duration}
                  onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? (
                <>
                  <Icons.Loader className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                <>
                  <Icons.Plus className="h-4 w-4 mr-2" />
                  Add Video
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYouTubeVideoModal;
