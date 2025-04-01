
export interface User {
  id: string;
  name: string;
  avatar: string;
}

export interface Message {
  id?: string;
  content: string;
  sender: User;
  channelId: string;
  timestamp?: Date;
  attachments?: string[];
  reactions?: {
    emoji: string;
    count: number;
    users: string[];
  }[];
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  members: User[];
  isPrivate: boolean;
  createdAt: Date;
}
