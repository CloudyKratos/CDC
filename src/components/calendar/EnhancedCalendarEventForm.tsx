
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { format } from 'date-fns';
import { EventData } from '@/services/SupabaseService';
import { toast } from 'sonner';
import { EventTypeSelector } from './form/EventTypeSelector';
import { VisibilitySelector } from './form/VisibilitySelector';
import { DateTimeSelector } from './form/DateTimeSelector';
import { TagManager } from './form/TagManager';
import { validateEventForm } from './form/FormValidation';

interface EnhancedCalendarEventFormProps {
  event?: Partial<EventData>;
  onSubmit: (eventData: EventData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

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
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const handleInputChange = (field: keyof EventData, value: any) => {
    console.log('🔄 Form: Field changed:', field, value);
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
      
      console.log('📅 Form: DateTime changed:', field, newDate.toISOString());
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🔄 Form: Submit attempt with data:', formData);

    const errors = validateEventForm(formData);
    setValidationErrors(errors);

    if (errors.length > 0) {
      console.log('❌ Form: Validation failed, aborting submit');
      errors.forEach(error => toast.error(error));
      return;
    }

    try {
      console.log('🔄 Form: Calling onSubmit with validated data');
      await onSubmit(formData as EventData);
      console.log('✅ Form: Submit completed successfully');
    } catch (error) {
      console.error('💥 Form: Submit error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save event';
      toast.error(errorMessage);
    }
  };

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

      <EventTypeSelector
        value={formData.event_type || 'mission_call'}
        onChange={(value) => handleInputChange('event_type', value)}
      />

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
        <DateTimeSelector
          label="Start Date & Time"
          date={startDate}
          time={startTime}
          onDateChange={(date) => handleDateTimeChange('start_time', date, startTime)}
          onTimeChange={(time) => {
            setStartTime(time);
            handleDateTimeChange('start_time', startDate, time);
          }}
          isRequired
        />

        <DateTimeSelector
          label="End Date & Time"
          date={endDate}
          time={endTime}
          onDateChange={(date) => handleDateTimeChange('end_time', date, endTime)}
          onTimeChange={(time) => {
            setEndTime(time);
            handleDateTimeChange('end_time', endDate, time);
          }}
          isRequired
        />
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

      <VisibilitySelector
        value={formData.visibility_level || 'public'}
        onChange={(value) => handleInputChange('visibility_level', value)}
      />

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

      <TagManager
        tags={formData.tags || []}
        onTagsChange={(tags) => handleInputChange('tags', tags)}
      />

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
