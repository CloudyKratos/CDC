
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Youtube, Plus } from 'lucide-react';
import { LearningVideo } from '@/types/learning';
import { toast } from 'sonner';

interface AddYouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: Omit<LearningVideo, 'id' | 'addedBy' | 'addedAt'>) => void;
}

interface FormData {
  title: string;
  description: string;
  videoUrl: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string;
  instructor: string;
}

const AddYouTubeModal: React.FC<AddYouTubeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<FormData>({
    title: '',
    description: '',
    videoUrl: '',
    duration: '',
    category: '',
    difficulty: 'beginner',
    tags: '',
    instructor: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const videoId = extractVideoId(formData.videoUrl);
      if (!videoId) {
        toast.error('Please enter a valid YouTube URL');
        return;
      }

      const videoData: Omit<LearningVideo, 'id' | 'addedBy' | 'addedAt'> = {
        title: formData.title,
        description: formData.description,
        videoId,
        duration: formData.duration,
        category: formData.category,
        difficulty: formData.difficulty,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        instructor: formData.instructor,
        progress: 0
      };

      onAdd(videoData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        videoUrl: '',
        duration: '',
        category: '',
        difficulty: 'beginner',
        tags: '',
        instructor: ''
      });
      
      onClose();
    } catch (error) {
      console.error('Failed to add video:', error);
      toast.error('Failed to add video');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDifficultyChange = (value: 'beginner' | 'intermediate' | 'advanced') => {
    setFormData(prev => ({ ...prev, difficulty: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Youtube className="h-5 w-5 text-red-500" />
            Add YouTube Video
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter video title"
              required
            />
          </div>

          <div>
            <Label htmlFor="videoUrl">YouTube URL</Label>
            <Input
              id="videoUrl"
              value={formData.videoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, videoUrl: e.target.value }))}
              placeholder="https://youtube.com/watch?v=..."
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Brief description of the video content"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                placeholder="25:30"
              />
            </div>
            <div>
              <Label htmlFor="instructor">Instructor</Label>
              <Input
                id="instructor"
                value={formData.instructor}
                onChange={(e) => setFormData(prev => ({ ...prev, instructor: e.target.value }))}
                placeholder="Instructor name"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="React">React</SelectItem>
                  <SelectItem value="TypeScript">TypeScript</SelectItem>
                  <SelectItem value="JavaScript">JavaScript</SelectItem>
                  <SelectItem value="CSS">CSS</SelectItem>
                  <SelectItem value="Node.js">Node.js</SelectItem>
                  <SelectItem value="Python">Python</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="difficulty">Difficulty</Label>
              <Select value={formData.difficulty} onValueChange={handleDifficultyChange}>
                <SelectTrigger>
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

          <div>
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
              placeholder="react, hooks, tutorial"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1 gap-2">
              <Plus className="h-4 w-4" />
              {isSubmitting ? 'Adding...' : 'Add Video'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYouTubeModal;
