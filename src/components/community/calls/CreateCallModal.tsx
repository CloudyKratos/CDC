
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar, Clock, Users, Globe, Lock } from 'lucide-react';
import { toast } from 'sonner';
import CommunityCallService from '@/services/CommunityCallService';

interface CreateCallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCallCreated: (callId: string) => void;
}

export const CreateCallModal: React.FC<CreateCallModalProps> = ({
  isOpen,
  onClose,
  onCallCreated
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_time: '',
    duration_minutes: 60,
    max_participants: 100,
    is_public: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title || !formData.scheduled_time) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsCreating(true);

    try {
      const result = await CommunityCallService.createCommunityCall(formData);
      
      if (result.success && result.call) {
        toast.success('Community call created successfully!');
        onCallCreated(result.call.id);
        onClose();
        
        // Reset form
        setFormData({
          title: '',
          description: '',
          scheduled_time: '',
          duration_minutes: 60,
          max_participants: 100,
          is_public: true
        });
      } else {
        toast.error(result.error || 'Failed to create call');
      }
    } catch (error) {
      console.error('Error creating call:', error);
      toast.error('Failed to create call');
    } finally {
      setIsCreating(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Create Community Call
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="e.g., Weekly Community Standup"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="What will you discuss in this call?"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="scheduled_time" className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                Date & Time *
              </Label>
              <Input
                id="scheduled_time"
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => handleInputChange('scheduled_time', e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration">Duration (min)</Label>
              <Input
                id="duration"
                type="number"
                value={formData.duration_minutes}
                onChange={(e) => handleInputChange('duration_minutes', parseInt(e.target.value))}
                min={15}
                max={240}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max_participants" className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              Max Participants
            </Label>
            <Input
              id="max_participants"
              type="number"
              value={formData.max_participants}
              onChange={(e) => handleInputChange('max_participants', parseInt(e.target.value))}
              min={2}
              max={500}
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="public"
                name="visibility"
                checked={formData.is_public}
                onChange={() => handleInputChange('is_public', true)}
                className="w-4 h-4 text-primary"
              />
              <Label htmlFor="public" className="flex items-center gap-1 cursor-pointer">
                <Globe className="w-4 h-4" />
                Public
              </Label>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="radio"
                id="private"
                name="visibility"
                checked={!formData.is_public}
                onChange={() => handleInputChange('is_public', false)}
                className="w-4 h-4 text-primary"
              />
              <Label htmlFor="private" className="flex items-center gap-1 cursor-pointer">
                <Lock className="w-4 h-4" />
                Private
              </Label>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
              disabled={isCreating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? 'Creating...' : 'Create Call'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
