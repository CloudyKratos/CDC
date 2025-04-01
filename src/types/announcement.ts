export interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  date: string;
  type: AnnouncementType;
  attendees: number;
  maxAttendees: number;
}

export type AnnouncementType = "event" | "update" | "summit" | "reminder" | "alert";
