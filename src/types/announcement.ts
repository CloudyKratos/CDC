
export type AnnouncementType = 'announcement' | 'event' | 'update' | 'roundtable';

export interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  date: string;
  type: AnnouncementType;
  attendees?: number;
  maxAttendees?: number;
}
