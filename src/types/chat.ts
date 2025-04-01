
export interface ChatUser {
  id: string;
  name: string;
  avatar: string;
  status?: 'online' | 'offline' | 'away' | 'busy';
  lastSeen?: string;
}

export type ChannelType = 'direct' | 'group' | 'community';

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
  lastMessage?: ChatMessage;
  unreadCount?: number;
  isArchived?: boolean;
  isPinned?: boolean;
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
