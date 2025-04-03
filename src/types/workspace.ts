
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
