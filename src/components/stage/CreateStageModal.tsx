
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Clock } from 'lucide-react';
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
    scheduledDate: undefined as Date | undefined,
    scheduledTime: '',
    maxSpeakers: 10,
    maxAudience: 100,
    allowHandRaising: true,
    recordingEnabled: false,
    startImmediately: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim()) {
      return;
    }

    let scheduledStartTime;
    if (formData.scheduledDate && formData.scheduledTime && !formData.startImmediately) {
      const [hours, minutes] = formData.scheduledTime.split(':');
      scheduledStartTime = new Date(formData.scheduledDate);
      scheduledStartTime.setHours(parseInt(hours), parseInt(minutes));
    }

    onCreateStage({
      ...formData,
      scheduledStartTime,
    });

    // Reset form
    setFormData({
      title: '',
      description: '',
      topic: '',
      scheduledDate: undefined,
      scheduledTime: '',
      maxSpeakers: 10,
      maxAudience: 100,
      allowHandRaising: true,
      recordingEnabled: false,
      startImmediately: false
    });
  };

  const handleClose = () => {
    onClose();
    // Reset form on close
    setFormData({
      title: '',
      description: '',
      topic: '',
      scheduledDate: undefined,
      scheduledTime: '',
      maxSpeakers: 10,
      maxAudience: 100,
      allowHandRaising: true,
      recordingEnabled: false,
      startImmediately: false
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Stage</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Stage Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter stage title"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="What will you discuss?"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="topic">Topic/Tag</Label>
            <Input
              id="topic"
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
              placeholder="e.g., #business, #tech, #general"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="startImmediately"
              checked={formData.startImmediately}
              onCheckedChange={(checked) => setFormData({ ...formData, startImmediately: checked })}
            />
            <Label htmlFor="startImmediately">Start immediately</Label>
          </div>

          {!formData.startImmediately && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-2">
                <Label>Scheduled Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduledDate ? format(formData.scheduledDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.scheduledDate}
                      onSelect={(date) => setFormData({ ...formData, scheduledDate: date })}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.scheduledTime}
                  onChange={(e) => setFormData({ ...formData, scheduledTime: e.target.value })}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-2">
              <Label htmlFor="maxSpeakers">Max Speakers</Label>
              <Select
                value={formData.maxSpeakers.toString()}
                onValueChange={(value) => setFormData({ ...formData, maxSpeakers: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="15">15</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAudience">Max Audience</Label>
              <Select
                value={formData.maxAudience.toString()}
                onValueChange={(value) => setFormData({ ...formData, maxAudience: parseInt(value) })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="50">50</SelectItem>
                  <SelectItem value="100">100</SelectItem>
                  <SelectItem value="250">250</SelectItem>
                  <SelectItem value="500">500</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <Switch
                id="allowHandRaising"
                checked={formData.allowHandRaising}
                onCheckedChange={(checked) => setFormData({ ...formData, allowHandRaising: checked })}
              />
              <Label htmlFor="allowHandRaising">Allow hand raising</Label>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="recordingEnabled"
                checked={formData.recordingEnabled}
                onCheckedChange={(checked) => setFormData({ ...formData, recordingEnabled: checked })}
              />
              <Label htmlFor="recordingEnabled">Enable recording</Label>
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              {formData.startImmediately ? 'Create & Start' : 'Schedule Stage'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateStageModal;
