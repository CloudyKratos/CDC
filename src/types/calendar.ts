
export interface Attendee {
  id: string;
  name: string;
  avatar?: string;
}

export interface Reminder {
  time: string;
  type: "email" | "notification" | "sms";
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  date: Date;
  start?: Date;
  end?: Date;
  type: 'meeting' | 'task' | 'reminder' | 'event' | 'webinar' | 'deadline';
  priority: 'high' | 'medium' | 'low';
  location?: string;
  url?: string;
  attendees?: string[];
  reminder?: string;
  isAllDay?: boolean;
}
