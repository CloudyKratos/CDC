
import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

interface StageFormData {
  title: string;
  description: string;
  topic: string;
  scheduledDate: Date | undefined;
  scheduledTime: string;
  maxSpeakers: number;
  maxAudience: number;
  allowHandRaising: boolean;
  recordingEnabled: boolean;
  startImmediately: boolean;
}

interface StageFormFieldsProps {
  formData: StageFormData;
  setFormData: (data: StageFormData) => void;
}

const StageFormFields: React.FC<StageFormFieldsProps> = ({
  formData,
  setFormData
}) => {
  return (
    <div className="space-y-4">
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
    </div>
  );
};

export default StageFormFields;
