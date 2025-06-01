
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface CreateStageModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateStage: (stageData: any) => void;
}

const CreateStageModal: React.FC<CreateStageModalProps> = ({
  isOpen,
  onClose,
  onCreateStage
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    topic: '',
    max_speakers: 10,
    max_audience: 100,
    allow_hand_raising: true,
    recording_enabled: false,
    scheduled_start_time: null as Date | null,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) return;

    const stageData = {
      ...formData,
      scheduled_start_time: formData.scheduled_start_time?.toISOString(),
    };

    onCreateStage(stageData);
    
    // Reset form
    setFormData({
      title: '',
      description: '',
      topic: '',
      max_speakers: 10,
      max_audience: 100,
      allow_hand_raising: true,
      recording_enabled: false,
      scheduled_start_time: null,
    });
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Stage</DialogTitle>
          <DialogDescription>
            Set up a new stage room for live discussions, AMAs, or presentations.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Stage Title *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Enter stage title..."
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="topic">Topic/Category</Label>
              <Input
                id="topic"
                value={formData.topic}
                onChange={(e) => handleInputChange('topic', e.target.value)}
                placeholder="e.g., AMA, Tech Talk, Community Chat..."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe what this stage is about..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max_speakers">Max Speakers</Label>
                <Input
                  id="max_speakers"
                  type="number"
                  value={formData.max_speakers}
                  onChange={(e) => handleInputChange('max_speakers', parseInt(e.target.value))}
                  min={1}
                  max={50}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="max_audience">Max Audience</Label>
                <Input
                  id="max_audience"
                  type="number"
                  value={formData.max_audience}
                  onChange={(e) => handleInputChange('max_audience', parseInt(e.target.value))}
                  min={1}
                  max={1000}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Schedule Start Time (Optional)</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.scheduled_start_time ? 
                      format(formData.scheduled_start_time, "PPP p") : 
                      "Pick a date and time"
                    }
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.scheduled_start_time}
                    onSelect={(date) => handleInputChange('scheduled_start_time', date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Allow Hand Raising</Label>
                  <p className="text-sm text-muted-foreground">
                    Let audience members request to speak
                  </p>
                </div>
                <Switch
                  checked={formData.allow_hand_raising}
                  onCheckedChange={(checked) => handleInputChange('allow_hand_raising', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Enable Recording</Label>
                  <p className="text-sm text-muted-foreground">
                    Record this stage session
                  </p>
                </div>
                <Switch
                  checked={formData.recording_enabled}
                  onCheckedChange={(checked) => handleInputChange('recording_enabled', checked)}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={!formData.title.trim()}>
              Create Stage
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStageModal;
