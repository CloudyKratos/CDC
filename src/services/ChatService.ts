
// Placeholder for real ChatService implementation
import { WebSocketService } from './WebSocketService';
import { Message, MessageStatus } from '../types/chat';

export class ChatService {
  private static instance: ChatService;
  private messages: Record<string, Message[]> = {};
  
  private constructor() {}
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  public async sendMessage(channelId: string, content: string): Promise<Message> {
    // In a real implementation, this would use WebSocketService to send the message
    const wsService = WebSocketService.getInstance();
    
    // Create a message object
    const message: Message = {
      id: Date.now().toString(),
      content,
      sender: {
        id: 'current-user',
        name: 'Current User',
        avatar: '/avatar-placeholder.png'
      },
      timestamp: new Date().toISOString(),
      status: MessageStatus.SENT,
      reactions: []
    };
    
    // Add to local cache
    if (!this.messages[channelId]) {
      this.messages[channelId] = [];
    }
    this.messages[channelId].push(message);
    
    // Pretend to send via WebSocket (will be implemented later)
    console.log(`Sending message to channel ${channelId}: ${content}`);
    
    return message;
  }
  
  public async getMessages(channelId: string): Promise<Message[]> {
    // In a real implementation, this would fetch messages from a backend
    // For now we'll just return mock data
    console.log(`Fetching messages for channel ${channelId}`);
    
    if (!this.messages[channelId]) {
      this.messages[channelId] = this.getMockMessages(channelId);
    }
    
    return this.messages[channelId];
  }
  
  private getMockMessages(channelId: string): Message[] {
    // Generate some mock messages for the channel
    return [
      {
        id: '1',
        content: `Welcome to the ${channelId} channel!`,
        sender: {
          id: 'system',
          name: 'System',
          avatar: '/avatar-system.png'
        },
        timestamp: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        status: MessageStatus.DELIVERED,
        reactions: []
      },
      {
        id: '2',
        content: `This is a sample message in the ${channelId} channel.`,
        sender: {
          id: 'user1',
          name: 'John Doe',
          avatar: '/avatar-john.png'
        },
        timestamp: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        status: MessageStatus.DELIVERED,
        reactions: [
          { emoji: '👍', count: 2, users: ['user2', 'user3'] }
        ]
      }
    ];
  }
}
