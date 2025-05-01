import { Observable } from 'rxjs';
import { 
  ChatChannel, 
  ChatMessage, 
  ChatUser, 
  Message, 
  MessageType, 
  ChannelType 
} from '@/types/chat';

class CommunityService {
  // Mock data for testing
  private channels: ChatChannel[] = [
    {
      id: 'general',
      name: 'General',
      type: ChannelType.PUBLIC,
      description: 'General discussion about anything',
      members: [],
      unreadCount: 0,
      lastMessage: 'Welcome to the general channel!'
    },
    {
      id: 'random',
      name: 'Random',
      type: ChannelType.PUBLIC,
      description: 'Random discussions and fun stuff',
      members: [],
      unreadCount: 0,
      lastMessage: 'Hello random channel!'
    },
    {
      id: 'support',
      name: 'Support',
      type: ChannelType.PUBLIC,
      description: 'Get help and support here',
      members: [],
      unreadCount: 0,
      lastMessage: 'Need help? Ask here!'
    }
  ];

  private messages: Record<string, ChatMessage[]> = {
    'general': [
      {
        id: '1',
        text: 'Welcome to the general channel!',
        content: 'Welcome to the general channel!',
        timestamp: new Date().toISOString(),
        sender: {
          id: 'system',
          name: 'System',
          avatar: '',
          status: 'online'
        },
        channelId: 'general',
        channelType: ChannelType.PUBLIC
      },
    ],
    'random': [
      {
        id: '2',
        text: 'Hello random channel!',
        content: 'Hello random channel!',
        timestamp: new Date().toISOString(),
        sender: {
          id: 'system',
          name: 'System',
          avatar: '',
          status: 'online'
        },
        channelId: 'random',
        channelType: ChannelType.PUBLIC
      },
    ],
    'support': [
      {
        id: '3',
        text: 'Need help? Ask here!',
        content: 'Need help? Ask here!',
        timestamp: new Date().toISOString(),
        sender: {
          id: 'system',
          name: 'System',
          avatar: '',
          status: 'online'
        },
        channelId: 'support',
        channelType: ChannelType.PUBLIC
      },
    ]
  };

  private onlineUsers: ChatUser[] = [
    {
      id: 'user1',
      name: 'John Doe',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
      status: 'online'
    },
    {
      id: 'user2',
      name: 'Jane Smith',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
      status: 'online'
    },
    {
      id: 'user3',
      name: 'Bob Johnson',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob',
      status: 'online'
    },
    {
      id: 'user4',
      name: 'Alice Williams',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
      status: 'online'
    }
  ];

  // Join a channel and mark user as online
  public joinChannel(channelId: string, userId: string): Promise<void> {
    return new Promise((resolve) => {
      // Add user to online users if not already there
      if (!this.onlineUsers.some(user => user.id === userId)) {
        this.onlineUsers.push({
          id: userId,
          name: `User ${userId.substring(0, 4)}`,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${userId}`,
          status: 'online'
        });
      }
      
      // Simulate network delay
      setTimeout(() => {
        resolve();
      }, 500);
    });
  }

  // Get all channels
  public getChannels(): Promise<ChatChannel[]> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(this.channels);
      }, 500);
    });
  }

  // Get messages for a specific channel
  public getMessages(channelId: string): Promise<Message[]> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        const channelMessages = this.messages[channelId] || [];
        
        // Convert to the Message interface
        const convertedMessages: Message[] = channelMessages.map(msg => ({
          id: msg.id,
          content: msg.text,
          created_at: msg.timestamp,
          sender_id: msg.sender.id,
          sender: {
            id: msg.sender.id,
            username: msg.sender.name || '',
            full_name: msg.sender.name || '',
            avatar_url: msg.sender.avatar || ''
          }
        }));
        
        resolve(convertedMessages);
      }, 500);
    });
  }

  // Subscribe to new messages in a channel
  public subscribeToMessages(channelId: string, onMessage: (message: Message) => void): () => void {
    let intervalId: NodeJS.Timeout | null = null;
    
    // Check for new messages every 5 seconds (simulating real-time updates)
    intervalId = setInterval(() => {
      // Do nothing here, just keeping the interval active
    }, 5000);
    
    // Return unsubscribe function
    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }

  // Get online users for a channel
  public getChannelOnlineUsers(channelId: string): Promise<ChatUser[]> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(this.onlineUsers);
      }, 500);
    });
  }

  // Send a message to a channel
  public sendMessage(content: string): Promise<Message> {
    return new Promise((resolve) => {
      const newMessage: Message = {
        id: `msg-${Date.now()}`,
        content,
        created_at: new Date().toISOString(),
        sender_id: 'current-user',
        sender: {
          id: 'current-user',
          username: 'Current User',
          full_name: 'Current User',
          avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=current-user'
        }
      };
      
      // Simulate network delay
      setTimeout(() => {
        resolve(newMessage);
      }, 500);
    });
  }

  // Delete a message
  public deleteMessage(messageId: string): Promise<void> {
    return new Promise((resolve) => {
      // In a real app, we would make an API call to delete the message
      // For now, just resolve after a short delay to simulate success
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }

  // Add a reaction to a message
  public addReaction(messageId: string, reaction: string): Promise<void> {
    return new Promise((resolve) => {
      // In a real app, we would make an API call to add the reaction
      // For now, just resolve after a short delay to simulate success
      setTimeout(() => {
        resolve();
      }, 300);
    });
  }

  // Get current community stats
  public getCommunityStats(): Promise<{
    total_members: number;
    active_now: number;
    messages_today: number;
    total_channels: number;
  }> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve({
          total_members: 128,
          active_now: 42,
          messages_today: 356,
          total_channels: 8
        });
      }, 500);
    });
  }

  // Get community members
  public getCommunityMembers(): Promise<ChatUser[]> {
    return new Promise((resolve) => {
      // Simulate network delay
      setTimeout(() => {
        resolve(this.onlineUsers);
      }, 500);
    });
  }
}

// Export singleton instance
export default new CommunityService();
