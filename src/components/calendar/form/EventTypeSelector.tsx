
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export const EVENT_TYPES = [
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

interface EventTypeSelectorProps {
  value: string;
  onChange: (value: string) => void;
}

export const EventTypeSelector: React.FC<EventTypeSelectorProps> = ({ value, onChange }) => {
  const selectedEventType = EVENT_TYPES.find(type => type.value === value);

  return (
    <div className="space-y-2">
      <Label htmlFor="event_type">Event Type</Label>
      <Select value={value} onValueChange={onChange}>
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
  );
};
