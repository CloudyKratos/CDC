
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
  date: Date | string;
  startTime?: string;
  endTime?: string;
  type: "meeting" | "task" | "reminder" | "event" | "webinar" | "deadline";
  description: string;
  priority: "low" | "medium" | "high";
  location?: string;
  url?: string;
  attendees: Attendee[];
  reminder?: Reminder | string;
  isAllDay?: boolean;
}

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

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
};

// Improved types for Accountability Time Bomb
export type TimeBombSeverity = "low" | "medium" | "high" | "critical";

export interface TimeBombStatus {
  isActive: boolean;
  isPaused: boolean;
  isCompleted: boolean;
  timeLeft: number; // in seconds
  totalTime: number; // in seconds
}

export interface TimeBombStats {
  completedCount: number;
  streakDays: number;
  lastCompletedDate?: Date;
  totalTimeSpent: number; // in minutes
}

export interface AccountabilityBomb {
  id: string;
  title: string;
  description?: string;
  taskType: TaskType;
  duration: number; // in minutes
  severity: TimeBombSeverity;
  createdAt: Date;
  status: TimeBombStatus;
  stats: TimeBombStats;
  customIcon?: string;
  reminderTime?: number; // minutes before start to remind
  scheduledTime?: string; // time of day for recurring bombs
  recurringDays?: ("mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun")[];
}
