
export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  type: 'meeting' | 'task' | 'reminder' | 'event' | 'webinar' | 'deadline';
  priority?: 'high' | 'medium' | 'low';
  attendees?: string[];
}
