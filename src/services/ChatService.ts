import WebSocketService from './WebSocketService';

export interface ChatMessage {
  id: string;
  content: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  timestamp: Date;
  channelId: string;
  attachments?: {
    type: "document" | "image" | "audio";
    name: string;
    url: string;
    size?: string;
  }[];
  replyToId?: string;
}

class ChatService {
  private ws: WebSocketService;
  private messageListeners: ((message: ChatMessage) => void)[] = [];
  private connectionStatusListeners: ((status: boolean) => void)[] = [];
  private typingStatusListeners: ((data: { channelId: string, userId: string, isTyping: boolean }) => void)[] = [];
  
  constructor() {
    this.ws = WebSocketService.getInstance();
    
    this.ws.onMessage((data) => {
      const parsedData = JSON.parse(data);
      
      if (parsedData.type === 'chat_message') {
        this.notifyMessageListeners(parsedData.message);
      } else if (parsedData.type === 'typing_status') {
        this.notifyTypingStatusListeners(parsedData.data);
      }
    });
    
    this.ws.onConnectionChange((status) => {
      this.notifyConnectionStatusListeners(status);
    });
  }

  public connect(userId: string, token: string): void {
    this.ws.connect(`/chat?userId=${userId}&token=${token}`);
  }
  
  public disconnect(): void {
    this.ws.disconnect();
  }
  
  public sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    this.ws.send(JSON.stringify({
      type: 'send_message',
      message
    }));
  }
  
  public updateTypingStatus(channelId: string, isTyping: boolean): void {
    this.ws.send(JSON.stringify({
      type: 'typing_status',
      data: {
        channelId,
        isTyping
      }
    }));
  }
  
  public onMessage(listener: (message: ChatMessage) => void): () => void {
    this.messageListeners.push(listener);
    return () => {
      this.messageListeners = this.messageListeners.filter(l => l !== listener);
    };
  }
  
  public onConnectionStatus(listener: (status: boolean) => void): () => void {
    this.connectionStatusListeners.push(listener);
    return () => {
      this.connectionStatusListeners = this.connectionStatusListeners.filter(l => l !== listener);
    };
  }
  
  public onTypingStatus(listener: (data: { channelId: string, userId: string, isTyping: boolean }) => void): () => void {
    this.typingStatusListeners.push(listener);
    return () => {
      this.typingStatusListeners = this.typingStatusListeners.filter(l => l !== listener);
    };
  }
  
  private notifyMessageListeners(message: ChatMessage): void {
    this.messageListeners.forEach(listener => listener(message));
  }
  
  private notifyConnectionStatusListeners(status: boolean): void {
    this.connectionStatusListeners.forEach(listener => listener(status));
  }
  
  private notifyTypingStatusListeners(data: { channelId: string, userId: string, isTyping: boolean }): void {
    this.typingStatusListeners.forEach(listener => listener(data));
  }
  
  private static instance: ChatService;
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
}

export default ChatService.getInstance();
