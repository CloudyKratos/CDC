
export type NotePermission = "private" | "shared" | "public";

export type NoteCollaborator = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: "viewer" | "editor" | "owner";
};

export type NoteVersion = {
  id: string;
  noteId: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  versionNumber: number;
  changeDescription?: string;
};

export type NoteTag = {
  id: string;
  name: string;
  color: string;
};

export type NoteAttachment = {
  id: string;
  name: string;
  url: string;
  size: number;
  type: string;
  uploadedAt: Date;
};

export type Note = {
  id: string;
  title: string;
  content: string;
  lastUpdated: Date;
  createdAt: Date;
  folder?: string;
  emoji?: string;
  color?: string;
  isFavorite?: boolean;
  isArchived?: boolean;
  isShared: boolean;
  permissions: NotePermission;
  type: "document" | "image" | "video" | "other" | "folder";
  tags?: NoteTag[];
  shareLink?: string;
  collaborators?: NoteCollaborator[];
  categories?: string[];
  versions?: NoteVersion[];
  attachments?: NoteAttachment[];
  parentId?: string;
  subfolders?: string[];
  description?: string;
};

export type TaskType = "morning" | "daily" | "weekly" | "custom" | "meditation" | "workout" | "evening";

// Reminder type for CalendarEvent
export type Reminder = {
  time: number;
  unit: "minutes" | "hours" | "days";
};

// CalendarEvent type
export type CalendarEvent = {
  id: string;
  title: string;
  description?: string;
  date: Date;
  startTime?: string;
  endTime?: string;
  location?: string;
  url?: string;
  type: "meeting" | "task" | "reminder" | "event" | "webinar" | "deadline";
  priority: "high" | "low" | "medium";
  reminder?: Reminder; // Making this optional to fix the build error
  attendees: Array<{
    id: string;
    name: string;
  }>;
  createdBy?: string;
  createdAt?: Date;
  isCompleted?: boolean;
  isCancelled?: boolean;
  color?: string;
  recurring?: "daily" | "weekly" | "monthly" | "none";
};

// User type definition for enhanced auth functionality
export type User = {
  id: string;
  email: string;
  name: string;
  role: "user" | "admin" | "demo";
  avatar?: string;
  permissions: string[];
  lastLogin?: string;
  isDemo?: boolean;
  preferences?: {
    darkMode?: boolean;
    colorTheme?: string;
    emailNotifications?: boolean;
    desktopNotifications?: boolean;
  };
  profile?: {
    bio?: string;
    location?: string;
    website?: string;
    timeZone?: string;
    phoneNumber?: string;
  };
  createdAt?: string;
  status?: "active" | "inactive" | "suspended";
};

// Enhanced auth state type
export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};
