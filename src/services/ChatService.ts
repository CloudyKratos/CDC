
import WebSocketService from './WebSocketService';
import { ChatMessage, ChannelType } from '../types/chat';

// Mock data for testing
const mockMessages: ChatMessage[] = [];

class ChatServiceClass {
  private static instance: ChatServiceClass;
  private socket: typeof WebSocketService;

  private constructor() {
    this.socket = WebSocketService.getInstance();
  }

  public static getInstance(): ChatServiceClass {
    if (!ChatServiceClass.instance) {
      ChatServiceClass.instance = new ChatServiceClass();
    }
    return ChatServiceClass.instance;
  }

  // Mock methods for the chat service - to be implemented with real WebSocket later
  public connect(userId: string, token: string): void {
    console.log('ChatService: Connecting with user ID', userId);
  }

  public disconnect(): void {
    console.log('ChatService: Disconnecting');
  }

  public sendMessage(channelId: string, message: string, channelType: ChannelType): void {
    console.log('ChatService: Sending message to channel', channelId, message);
    
    // Create a mock message
    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      timestamp: new Date().toISOString(),
      sender: {
        id: 'current-user',
        name: 'You',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Felix'
      },
      channelId,
      channelType
    };
    
    mockMessages.push(newMessage);
    
    // Simulate message received
    setTimeout(() => {
      if (this.onMessage) {
        this.onMessage(newMessage);
      }
    }, 500);
  }

  public onMessage: ((message: ChatMessage) => void) | null = null;

  public getChannelMessages(channelId: string): ChatMessage[] {
    return mockMessages.filter(msg => msg.channelId === channelId);
  }
}

export const ChatService = ChatServiceClass.getInstance();
