
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X, Plus, AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { EventData } from '@/services/SupabaseService';
import { toast } from 'sonner';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface EnhancedCalendarEventFormProps {
  event?: Partial<EventData>;
  onSubmit: (eventData: EventData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const EVENT_TYPES = [
  { value: 'mission_call', label: 'Mission Call', description: 'Strategic planning session' },
  { value: 'reflection_hour', label: 'Reflection Hour', description: 'Personal development time' },
  { value: 'wisdom_drop', label: 'Wisdom Drop', description: 'Knowledge sharing session' },
  { value: 'tribe_meetup', label: 'Tribe Meetup', description: 'Community gathering' },
  { value: 'office_hours', label: 'Office Hours', description: 'Open Q&A session' },
  { value: 'accountability_circle', label: 'Accountability Circle', description: 'Progress check-in' },
  { value: 'solo_ritual', label: 'Solo Ritual', description: 'Individual practice time' },
  { value: 'workshop', label: 'Workshop', description: 'Interactive learning session' },
  { value: 'course_drop', label: 'Course Drop', description: 'New course announcement' },
  { value: 'challenge_sprint', label: 'Challenge Sprint', description: 'Focused challenge session' },
  { value: 'deep_work_day', label: 'Deep Work Day', description: 'Concentrated work session' }
];

const VISIBILITY_LEVELS = [
  { value: 'public', label: 'Public', description: 'Visible to everyone' },
  { value: 'members_only', label: 'Members Only', description: 'Only community members' },
  { value: 'cohort_only', label: 'Cohort Only', description: 'Restricted to cohort' },
  { value: 'private', label: 'Private', description: 'Only you can see this' }
];

const EnhancedCalendarEventForm: React.FC<EnhancedCalendarEventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  isLoading = false
}) => {
  const [formData, setFormData] = useState<Partial<EventData>>({
    title: event?.title || '',
    description: event?.description || '',
    start_time: event?.start_time || '',
    end_time: event?.end_time || '',
    event_type: event?.event_type || 'mission_call',
    visibility_level: event?.visibility_level || 'public',
    max_attendees: event?.max_attendees || undefined,
    is_recurring: event?.is_recurring || false,
    tags: event?.tags || [],
    meeting_url: event?.meeting_url || '',
    xp_reward: event?.xp_reward || 10,
    ...event
  });

  const [startDate, setStartDate] = useState<Date | undefined>(
    event?.start_time ? new Date(event.start_time) : new Date()
  );
  const [endDate, setEndDate] = useState<Date | undefined>(
    event?.end_time ? new Date(event.end_time) : new Date()
  );
  const [startTime, setStartTime] = useState(
    event?.start_time ? format(new Date(event.start_time), 'HH:mm') : '09:00'
  );
  const [endTime, setEndTime] = useState(
    event?.end_time ? format(new Date(event.end_time), 'HH:mm') : '10:00'
  );
  const [newTag, setNewTag] = useState('');
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof EventData, value: any) => {
    console.log('Form field changed:', field, value);
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear validation errors when user makes changes
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleDateTimeChange = (field: 'start_time' | 'end_time', date: Date | undefined, time?: string) => {
    if (date) {
      const timeToUse = time || (field === 'start_time' ? startTime : endTime);
      const [hours, minutes] = timeToUse.split(':');
      const newDate = new Date(date);
      newDate.setHours(parseInt(hours), parseInt(minutes));
      
      console.log('DateTime changed:', field, newDate.toISOString());
      handleInputChange(field, newDate.toISOString());
      
      if (field === 'start_time') {
        setStartDate(newDate);
        // Auto-adjust end time to be 1 hour later if it's before start time
        if (endDate && newDate >= endDate) {
          const autoEndDate = new Date(newDate.getTime() + 60 * 60 * 1000);
          setEndDate(autoEndDate);
          handleInputChange('end_time', autoEndDate.toISOString());
        }
      } else {
        setEndDate(newDate);
      }
    }
  };

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      handleInputChange('tags', [...(formData.tags || []), newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    handleInputChange('tags', formData.tags?.filter(tag => tag !== tagToRemove) || []);
  };

  const validateForm = (): boolean => {
    console.log('Validating form with data:', formData);
    const errors: string[] = [];

    // Required field validation
    if (!formData.title || !formData.title.trim()) {
      errors.push('Event title is required');
    }

    if (!formData.start_time) {
      errors.push('Start date and time are required');
    }

    if (!formData.end_time) {
      errors.push('End date and time are required');
    }

    // Date validation
    if (formData.start_time && formData.end_time) {
      const startDateTime = new Date(formData.start_time);
      const endDateTime = new Date(formData.end_time);

      if (isNaN(startDateTime.getTime()) || isNaN(endDateTime.getTime())) {
        errors.push('Invalid date/time format');
      } else {
        if (endDateTime <= startDateTime) {
          errors.push('End time must be after start time');
        }

        // Check if event is in the past (with 5 minute grace period)
        const now = new Date();
        const fiveMinutesAgo = new Date(now.getTime() - 5 * 60 * 1000);
        if (startDateTime < fiveMinutesAgo && !event?.id) {
          errors.push('Cannot create events in the past');
        }

        // Check duration
        const durationHours = (endDateTime.getTime() - startDateTime.getTime()) / (1000 * 60 * 60);
        if (durationHours > 8) {
          errors.push('Event duration cannot exceed 8 hours');
        }
        if (durationHours < 0.25) {
          errors.push('Event must be at least 15 minutes long');
        }
      }
    }

    // Additional validation
    if (formData.max_attendees && formData.max_attendees < 1) {
      errors.push('Maximum attendees must be at least 1');
    }

    if (formData.xp_reward && (formData.xp_reward < 0 || formData.xp_reward > 100)) {
      errors.push('XP reward must be between 0 and 100');
    }

    if (formData.meeting_url && formData.meeting_url.trim() && !isValidUrl(formData.meeting_url.trim())) {
      errors.push('Please enter a valid meeting URL');
    }

    setValidationErrors(errors);

    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return false;
    }

    return true;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('Form submission attempted with data:', formData);

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData as EventData);
    } catch (error) {
      console.error('Error submitting form:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create event';
      toast.error(errorMessage);
    }
  };

  const selectedEventType = EVENT_TYPES.find(type => type.value === formData.event_type);
  const selectedVisibility = VISIBILITY_LEVELS.find(level => level.value === formData.visibility_level);

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please fix the following issues:
            <ul className="list-disc list-inside mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Event Title *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => handleInputChange('title', e.target.value)}
          placeholder="Enter event title..."
          required
          maxLength={100}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="event_type">Event Type</Label>
        <Select 
          value={formData.event_type} 
          onValueChange={(value) => handleInputChange('event_type', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            {EVENT_TYPES.map((type) => (
              <SelectItem key={type.value} value={type.value}>
                <div>
                  <div className="font-medium">{type.label}</div>
                  <div className="text-sm text-gray-500">{type.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedEventType && (
          <p className="text-sm text-gray-600">{selectedEventType.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe the event..."
          rows={3}
          maxLength={500}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Start Date & Time *</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : "Pick start date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => handleDateTimeChange('start_time', date, startTime)}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                handleDateTimeChange('start_time', startDate, e.target.value);
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>End Date & Time *</Label>
          <div className="space-y-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, "PPP") : "Pick end date"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={(date) => handleDateTimeChange('end_time', date, endTime)}
                  initialFocus
                  disabled={(date) => date < new Date(new Date().setHours(0, 0, 0, 0))}
                />
              </PopoverContent>
            </Popover>
            <Input
              type="time"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                handleDateTimeChange('end_time', endDate, e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="max_attendees">Max Attendees</Label>
          <Input
            id="max_attendees"
            type="number"
            value={formData.max_attendees || ''}
            onChange={(e) => handleInputChange('max_attendees', e.target.value ? parseInt(e.target.value) : undefined)}
            placeholder="No limit"
            min={1}
            max={1000}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="xp_reward">XP Reward</Label>
          <Input
            id="xp_reward"
            type="number"
            value={formData.xp_reward || 10}
            onChange={(e) => handleInputChange('xp_reward', parseInt(e.target.value) || 10)}
            min={0}
            max={100}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="visibility_level">Visibility</Label>
        <Select 
          value={formData.visibility_level} 
          onValueChange={(value) => handleInputChange('visibility_level', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select visibility level" />
          </SelectTrigger>
          <SelectContent>
            {VISIBILITY_LEVELS.map((level) => (
              <SelectItem key={level.value} value={level.value}>
                <div>
                  <div className="font-medium">{level.label}</div>
                  <div className="text-sm text-gray-500">{level.description}</div>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedVisibility && (
          <p className="text-sm text-gray-600">{selectedVisibility.description}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="meeting_url">Meeting URL</Label>
        <Input
          id="meeting_url"
          value={formData.meeting_url}
          onChange={(e) => handleInputChange('meeting_url', e.target.value)}
          placeholder="https://zoom.us/j/..."
          type="url"
        />
      </div>

      <div className="space-y-2">
        <Label>Tags</Label>
        <div className="flex gap-2 mb-2">
          <Input
            value={newTag}
            onChange={(e) => setNewTag(e.target.value)}
            placeholder="Add a tag..."
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
            maxLength={20}
          />
          <Button type="button" onClick={addTag} variant="outline" size="sm">
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.tags?.map((tag) => (
            <Badge key={tag} variant="secondary" className="gap-1">
              {tag}
              <X 
                className="h-3 w-3 cursor-pointer" 
                onClick={() => removeTag(tag)} 
              />
            </Badge>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_recurring"
          checked={formData.is_recurring}
          onCheckedChange={(checked) => handleInputChange('is_recurring', checked)}
        />
        <Label htmlFor="is_recurring">Recurring Event</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : event?.id ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default EnhancedCalendarEventForm;
