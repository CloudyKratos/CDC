export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export enum ChannelType {
  PUBLIC = 'public',
  PRIVATE = 'private',
  DIRECT = 'direct',
  GROUP = 'group',
  COMMUNITY = 'community',
  WORKSPACE = 'workspace',
  VOICE = 'voice'
}

export enum MessageType {
  TEXT = 'text',
  IMAGE = 'image',
  FILE = 'file',
  SYSTEM = 'system',
  ACTION = 'action'
}

export interface ChatMessage {
  id: string;
  text: string;
  timestamp: string;
  sender: ChatUser;
  channelId: string;
  channelType: ChannelType;
  attachments?: ChatAttachment[];
  reactions?: ChatReaction[];
  isEdited?: boolean;
  replyTo?: string; // ID of the message this is replying to
  content?: string; // Additional property for compatibility
}

export interface ChatAttachment {
  id: string;
  type: 'image' | 'file' | 'link';
  url: string;
  name: string;
  size?: number; // in bytes
  thumbnailUrl?: string;
}

export interface ChatReaction {
  emoji: string;
  count: number;
  users: string[]; // user IDs who reacted
}

export interface ChatChannel {
  id: string;
  name: string;
  type: ChannelType;
  avatar?: string;
  members: ChatUser[];
  lastMessage?: ChatMessage | string;
  unreadCount?: number;
  isArchived?: boolean;
  isPinned?: boolean;
  description?: string;
}

export interface ChatGroup {
  id: string;
  name: string;
  description?: string;
  avatar?: string;
  channels: ChatChannel[];
  members: ChatUser[];
  createdAt: string;
  createdBy: string;
}

// Define the Reaction interface
export interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

// Define the Message interface for compatibility with existing code
export interface Message {
  id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  sender_id: string;
  is_deleted?: boolean;
  deleted_at?: string;
  edited?: boolean;
  edited_at?: string;
  reactions?: Reaction[];
  parent_message_id?: string;
  thread_count?: number;
  replies?: Message[];
}
