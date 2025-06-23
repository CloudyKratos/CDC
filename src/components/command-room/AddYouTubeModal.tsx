import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Youtube, X, Plus, Sparkles, Zap } from 'lucide-react';

interface LearningVideo {
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

interface AddYouTubeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (video: LearningVideo) => void;
}

const AddYouTubeModal: React.FC<AddYouTubeModalProps> = ({ isOpen, onClose, onAdd }) => {
  const [formData, setFormData] = useState<LearningVideo>({
    title: '',
    description: '',
    videoId: '',
    duration: '',
    category: '',
    difficulty: 'beginner',
    tags: []
  });
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const extractVideoId = (url: string): string => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : url;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.videoId || !formData.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsLoading(true);

    try {
      const videoId = extractVideoId(formData.videoId);
      
      const videoData: LearningVideo = {
        ...formData,
        videoId,
        duration: formData.duration || 'Unknown'
      };

      onAdd(videoData);
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        videoId: '',
        duration: '',
        category: '',
        difficulty: 'beginner',
        tags: []
      });
      setNewTag('');
      onClose();
      
    } catch (error) {
      toast.error('Failed to add video. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const categories = [
    'React', 'TypeScript', 'JavaScript', 'CSS', 'HTML',
    'Node.js', 'Python', 'Design', 'DevOps', 'Database',
    'Mobile', 'Testing', 'Security', 'Performance', 'Other'
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-gradient-to-br from-gray-900/95 to-black/95 backdrop-blur-xl border border-cyan-500/30 text-white">
        <DialogHeader className="space-y-4">
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <div className="p-2 bg-gradient-to-r from-red-500 to-pink-600 rounded-full">
              <Youtube className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-cyan-300 to-purple-300 bg-clip-text text-transparent">
              Add Epic Learning Course
            </span>
          </DialogTitle>
          <DialogDescription className="text-blue-100/80 text-lg">
            🚀 Share amazing YouTube content with the community and help everyone level up their skills!
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Enhanced YouTube URL */}
          <div className="space-y-3">
            <Label htmlFor="videoId" className="text-cyan-300 font-medium flex items-center gap-2">
              <Youtube className="h-4 w-4" />
              YouTube URL or Video ID *
            </Label>
            <Input
              id="videoId"
              type="text"
              placeholder="https://youtube.com/watch?v=... or video ID"
              value={formData.videoId}
              onChange={(e) => setFormData(prev => ({ ...prev, videoId: e.target.value }))}
              className="bg-white/10 border-cyan-300/40 text-white placeholder:text-blue-200/60 h-12 focus:border-cyan-400 focus:ring-cyan-400/50"
              required
            />
          </div>

          {/* Enhanced Title */}
          <div className="space-y-3">
            <Label htmlFor="title" className="text-purple-300 font-medium flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Course Title *
            </Label>
            <Input
              id="title"
              type="text"
              placeholder="Enter an exciting course title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="bg-white/10 border-purple-300/40 text-white placeholder:text-purple-200/60 h-12 focus:border-purple-400 focus:ring-purple-400/50"
              required
            />
          </div>

          {/* Enhanced Description */}
          <div className="space-y-3">
            <Label htmlFor="description" className="text-emerald-300 font-medium">
              Course Description
            </Label>
            <Textarea
              id="description"
              placeholder="Describe what amazing things students will learn..."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="bg-white/10 border-emerald-300/40 text-white placeholder:text-emerald-200/60 focus:border-emerald-400 focus:ring-emerald-400/50 min-h-[100px]"
              rows={4}
            />
          </div>

          {/* Enhanced Category and Difficulty */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <Label className="text-amber-300 font-medium flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Category *
              </Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="bg-white/10 border-amber-300/40 text-white h-12 focus:border-amber-400 focus:ring-amber-400/50">
                  <SelectValue placeholder="Choose a category" />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-amber-300/40">
                  {categories.map(category => (
                    <SelectItem key={category} value={category} className="text-white hover:bg-amber-500/20">
                      📚 {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-3">
              <Label className="text-pink-300 font-medium">Difficulty Level</Label>
              <Select
                value={formData.difficulty}
                onValueChange={(value: 'beginner' | 'intermediate' | 'advanced') => 
                  setFormData(prev => ({ ...prev, difficulty: value }))
                }
              >
                <SelectTrigger className="bg-white/10 border-pink-300/40 text-white h-12 focus:border-pink-400 focus:ring-pink-400/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-900 border-pink-300/40">
                  <SelectItem value="beginner" className="text-white hover:bg-pink-500/20">🌱 Beginner</SelectItem>
                  <SelectItem value="intermediate" className="text-white hover:bg-pink-500/20">🚀 Intermediate</SelectItem>
                  <SelectItem value="advanced" className="text-white hover:bg-pink-500/20">🎯 Advanced</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Enhanced Duration */}
          <div className="space-y-3">
            <Label htmlFor="duration" className="text-blue-300 font-medium">Duration (optional)</Label>
            <Input
              id="duration"
              type="text"
              placeholder="e.g., 28:15 or 1h 30m"
              value={formData.duration}
              onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
              className="bg-white/10 border-blue-300/40 text-white placeholder:text-blue-200/60 h-12 focus:border-blue-400 focus:ring-blue-400/50"
            />
          </div>

          {/* Enhanced Tags */}
          <div className="space-y-4">
            <Label className="text-green-300 font-medium">Course Tags</Label>
            <div className="flex gap-3">
              <Input
                type="text"
                placeholder="Add a tag (e.g., react, beginner)"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                className="bg-white/10 border-green-300/40 text-white placeholder:text-green-200/60 h-12 focus:border-green-400 focus:ring-green-400/50"
              />
              <Button 
                type="button" 
                onClick={addTag} 
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 h-12 px-6"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            
            {formData.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} className="bg-gradient-to-r from-green-500/80 to-emerald-600/80 text-white flex items-center gap-2 px-3 py-1">
                    #{tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Enhanced Submit Buttons */}
          <div className="flex justify-end gap-4 pt-6 border-t border-white/10">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              className="border-gray-500/50 text-gray-300 hover:bg-gray-500/20 px-6 py-3"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="bg-gradient-to-r from-cyan-500 via-purple-600 to-pink-600 hover:from-cyan-600 hover:via-purple-700 hover:to-pink-700 text-white px-8 py-3 font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-current border-t-transparent mr-2" />
                  Adding Magic...
                </>
              ) : (
                <>
                  <Plus className="h-5 w-5 mr-2" />
                  Add Epic Course
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AddYouTubeModal;
