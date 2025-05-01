import { BehaviorSubject } from 'rxjs';
import { 
  ChatMessage, 
  ChatChannel, 
  ChatUser, 
  ChannelType,
  MessageType,
  Message
} from '@/types/chat';
import { User } from '@/types/workspace';
import authService from './AuthService';
import { supabase } from '@/integrations/supabase/client';
import SupabaseService from './SupabaseService';

// Channel and message cache
const channelsSubject = new BehaviorSubject<ChatChannel[]>([]);
const activeChannelSubject = new BehaviorSubject<ChatChannel | null>(null);
const messagesSubject = new BehaviorSubject<ChatMessage[]>([]);
const usersSubject = new BehaviorSubject<ChatUser[]>([]);

// Default channel data to showcase UI features
const DEFAULT_CHANNELS: ChatChannel[] = [
  {
    id: 'general',
    name: 'General',
    type: ChannelType.PUBLIC,
    members: [],
    unreadCount: 0,
    lastMessage: 'Welcome to the general channel!'
  },
  {
    id: 'announcements',
    name: 'Announcements',
    type: ChannelType.PUBLIC,
    members: [],
    unreadCount: 2,
    lastMessage: 'Important team updates!'
  },
  {
    id: 'random',
    name: 'Random',
    type: ChannelType.PUBLIC,
    members: [],
    unreadCount: 0,
    lastMessage: 'Share anything interesting!'
  }
];

// Default demo messages for showcase
const DEMO_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    channelId: 'general',
    text: 'Welcome to the community chat!',
    content: 'Welcome to the community chat!',
    timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
    channelType: ChannelType.PUBLIC,
    sender: {
      id: 'system',
      name: 'System',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
      status: 'online'
    },
    reactions: []
  },
  {
    id: '2',
    channelId: 'general',
    text: 'Feel free to ask any questions here.',
    content: 'Feel free to ask any questions here.',
    timestamp: new Date(Date.now() - 3600000 * 4).toISOString(),
    channelType: ChannelType.PUBLIC,
    sender: {
      id: 'admin',
      name: 'Admin',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
      status: 'online'
    },
    reactions: []
  },
  {
    id: '3',
    channelId: 'general',
    text: 'Hi everyone! Excited to be here!',
    content: 'Hi everyone! Excited to be here!',
    timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
    channelType: ChannelType.PUBLIC,
    sender: {
      id: 'user1',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      status: 'online'
    },
    reactions: [
      { emoji: '👋', count: 2, users: ['admin', 'user2'] }
    ]
  },
  {
    id: '4',
    channelId: 'general',
    text: 'Welcome Jane! Great to see you here.',
    content: 'Welcome Jane! Great to see you here.',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    channelType: ChannelType.PUBLIC,
    sender: {
      id: 'user2',
      name: 'Mike Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
      status: 'online'
    },
    reactions: []
  }
];

// Default users
const DEFAULT_USERS: ChatUser[] = [
  {
    id: 'system',
    name: 'System',
    avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=System',
    status: 'online'
  },
  {
    id: 'admin',
    name: 'Admin User',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin',
    status: 'online'
  },
  {
    id: 'user1',
    name: 'Jane Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    status: 'online'
  },
  {
    id: 'user2',
    name: 'Mike Johnson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    status: 'online'
  }
];

// Cleanup channels that might be removed
const cleanupRemovedChannels = (workspaces: any[], existingChannels: ChatChannel[]): ChatChannel[] => {
  if (!workspaces || workspaces.length === 0) return existingChannels;
  
  // Keep only channels that exist in workspaces
  const workspaceIds = workspaces.map(w => w.id);
  return existingChannels.filter(channel => 
    channel.id === 'general' || // Keep default channels
    channel.id === 'announcements' ||
    channel.id === 'random' ||
    workspaceIds.includes(channel.id)
  );
};

class CommunityService {
  // Initialize community channels and data
  async initialize(): Promise<void> {
    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;
      
      // Load workspaces as channels
      const workspaces = await SupabaseService.getWorkspaces(currentUser.id);
      
      // Create channels from workspaces
      const workspaceChannels: ChatChannel[] = workspaces.map(workspace => ({
        id: workspace.id as string,
        name: workspace.name,
        type: ChannelType.WORKSPACE,
        description: workspace.description || 'A collaborative workspace',
        members: [],
        unreadCount: 0,
        lastMessage: 'New workspace created' as unknown as ChatMessage
      }));
      
      // Combine with default channels
      const allChannels = [...DEFAULT_CHANNELS, ...workspaceChannels];
      
      // Update channels
      channelsSubject.next(allChannels);
      
      // Set default active channel if none is selected
      if (!activeChannelSubject.value) {
        this.setActiveChannel(allChannels[0]);
      }
      
      // Set default users
      usersSubject.next(DEFAULT_USERS);
      
      // Set default messages
      messagesSubject.next(DEMO_MESSAGES);
      
      // Subscribe to presence updates
      this.setupPresence(currentUser);
    } catch (error) {
      console.error('Error initializing community service:', error);
    }
  }
  
  // Get all available channels
  getChannels(): BehaviorSubject<ChatChannel[]> {
    return channelsSubject;
  }
  
  // Get the currently active channel
  getActiveChannel(): BehaviorSubject<ChatChannel | null> {
    return activeChannelSubject;
  }
  
  // Set the active channel
  async setActiveChannel(channel: ChatChannel): Promise<void> {
    activeChannelSubject.next(channel);
    
    // Clear unread counter
    const channels = channelsSubject.value;
    const updatedChannels = channels.map(c => 
      c.id === channel.id ? { ...c, unreadCount: 0 } : c
    );
    channelsSubject.next(updatedChannels);
    
    // Load real messages if it's a workspace channel
    if (channel.type === ChannelType.WORKSPACE) {
      await this.loadChannelMessages(channel.id);
    } else {
      // Use demo messages for default channels
      const filteredMessages = DEMO_MESSAGES.filter(m => m.channelId === channel.id);
      messagesSubject.next(filteredMessages);
    }
  }
  
  // Get messages for the current channel
  getMessages(): BehaviorSubject<ChatMessage[]> {
    return messagesSubject;
  }
  
  // Load messages for a specific channel
  async loadChannelMessages(channelId: string): Promise<void> {
    try {
      // Get current user
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;
      
      // Load messages from Supabase
      const messages = await SupabaseService.getMessages(channelId);
      
      // Map to chat message format
      const chatMessages: ChatMessage[] = messages.map(msg => ({
        id: msg.id as string,
        channelId,
        text: msg.content,
        content: msg.content,
        timestamp: msg.created_at as string,
        channelType: ChannelType.WORKSPACE,
        sender: {
          id: msg.sender_id,
          name: msg.sender?.full_name || msg.sender?.username || 'Unknown User',
          avatar: msg.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.sender_id}`,
          status: 'online'
        },
        reactions: []
      }));
      
      messagesSubject.next(chatMessages);
      
      // Subscribe to new messages
      this.subscribeToChannelMessages(channelId);
    } catch (error) {
      console.error('Error loading channel messages:', error);
    }
  }
  
  // Send a message to the current channel
  async sendMessage(content: string, type: MessageType = MessageType.TEXT): Promise<boolean> {
    try {
      const currentUser = authService.getCurrentUser();
      const currentChannel = activeChannelSubject.value;
      
      if (!currentUser || !currentChannel) return false;
      
      // For workspace channels, send to Supabase
      if (currentChannel.type === ChannelType.WORKSPACE) {
        await SupabaseService.sendMessage({
          content,
          sender_id: currentUser.id,
          workspace_id: currentChannel.id
        });
        
        return true;
      }
      
      // For demo channels, add locally
      const newMessage: ChatMessage = {
        id: Date.now().toString(),
        channelId: currentChannel.id,
        text: content,
        content,
        timestamp: new Date().toISOString(),
        channelType: currentChannel.type,
        sender: {
          id: currentUser.id,
          name: currentUser.name,
          avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`,
          status: 'online'
        },
        reactions: []
      };
      
      const updatedMessages = [...messagesSubject.value, newMessage];
      messagesSubject.next(updatedMessages);
      
      // Update last message in channel list
      this.updateChannelLastMessage(currentChannel.id, newMessage);
      
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  // Subscribe to new messages in a channel
  private subscribeToChannelMessages(channelId: string): () => void {
    // Current user for reference
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return () => {};
    
    // Subscribe to realtime messages
    return SupabaseService.subscribeToMessages(channelId, (newMessage: Message) => {
      // Only process if this is the active channel
      const activeChannel = activeChannelSubject.value;
      if (activeChannel?.id !== channelId) {
        // Update unread count for non-active channels
        this.incrementChannelUnreadCount(channelId);
        return;
      }
      
      // Convert to ChatMessage format
      const chatMessage: ChatMessage = {
        id: newMessage.id as string,
        channelId,
        text: newMessage.content,
        content: newMessage.content,
        timestamp: newMessage.created_at as string,
        channelType: ChannelType.WORKSPACE,
        sender: {
          id: newMessage.sender_id,
          name: newMessage.sender?.full_name || newMessage.sender?.username || 'Unknown User',
          avatar: newMessage.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${newMessage.sender_id}`,
          status: 'online'
        },
        reactions: []
      };
      
      // Add to messages
      const updatedMessages = [...messagesSubject.value, chatMessage];
      messagesSubject.next(updatedMessages);
      
      // Update last message in channel
      this.updateChannelLastMessage(channelId, chatMessage);
    });
  }
  
  // Update a channel's last message
  private updateChannelLastMessage(channelId: string, lastMessage: ChatMessage): void {
    const channels = channelsSubject.value;
    const updatedChannels = channels.map(channel => 
      channel.id === channelId ? { ...channel, lastMessage } : channel
    );
    channelsSubject.next(updatedChannels);
  }
  
  // Increment unread count for a channel
  private incrementChannelUnreadCount(channelId: string): void {
    const channels = channelsSubject.value;
    const updatedChannels = channels.map(channel => 
      channel.id === channelId ? { ...channel, unreadCount: (channel.unreadCount || 0) + 1 } : channel
    );
    channelsSubject.next(updatedChannels);
  }
  
  // Setup presence tracking
  private setupPresence(currentUser: User): void {
    const userInfo = {
      name: currentUser.name,
      avatar: currentUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${currentUser.name}`
    };
    
    // Setup presence tracking for all users
    SupabaseService.setupPresence(currentUser.id, 'community', userInfo).subscribe();
  }
  
  // Get all online users
  getUsers(): BehaviorSubject<ChatUser[]> {
    return usersSubject;
  }
  
  // Create a new channel
  async createChannel(name: string, type: ChannelType): Promise<boolean> {
    try {
      const currentUser = authService.getCurrentUser();
      if (!currentUser) return false;
      
      if (type === ChannelType.WORKSPACE) {
        // Create a new workspace in Supabase
        const workspace = await SupabaseService.createWorkspace({
          name,
          description: `Workspace for ${name}`,
          owner_id: currentUser.id
        });
        
        // Add to channels
        const newChannel: ChatChannel = {
          id: workspace.id as string,
          name: workspace.name,
          type: ChannelType.WORKSPACE,
          description: workspace.description || '',
          members: [],
          unreadCount: 0,
          lastMessage: 'New workspace created' as unknown as ChatMessage
        };
        
        const updatedChannels = [...channelsSubject.value, newChannel];
        channelsSubject.next(updatedChannels);
        
        return true;
      } else {
        // Create a local channel
        const newChannel: ChatChannel = {
          id: `custom-${Date.now()}`,
          name,
          type,
          members: [],
          unreadCount: 0,
          lastMessage: 'New channel created' as unknown as ChatMessage
        };
        
        const updatedChannels = [...channelsSubject.value, newChannel];
        channelsSubject.next(updatedChannels);
        
        return true;
      }
    } catch (error) {
      console.error('Error creating channel:', error);
      return false;
    }
  }

  // Methods to support the CommunityPanel component
  async joinChannel(channelName: string, userId: string): Promise<void> {
    // For now, we'll just simulate joining a channel
    console.log(`User ${userId} joined channel ${channelName}`);
  }

  async getMessages(channelName: string, userId: string): Promise<Message[]> {
    // For demo purposes, return mock messages
    return DEMO_MESSAGES.filter(m => m.channelId === channelName).map(m => ({
      id: m.id,
      content: m.content || m.text,
      created_at: m.timestamp,
      sender_id: m.sender.id,
      sender: {
        id: m.sender.id,
        full_name: m.sender.name,
        avatar_url: m.sender.avatar,
      }
    }));
  }

  async subscribeToMessages(channelName: string, userId: string, callback: (msg: Message) => void): Promise<() => void> {
    // For now, we'll just return an empty unsubscribe function
    return () => {};
  }

  async getChannelOnlineUsers(channelName: string): Promise<ChatUser[]> {
    // Return mock online users
    return DEFAULT_USERS;
  }
}

export const communityService = new CommunityService();
export default communityService;
export type { Message };
