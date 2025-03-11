
import WebSocketService from './WebSocketService';

export interface ChatMessage {
  id: string;
  content: string;
  timestamp: string;
  sender: {
    id: string;
    name: string;
    avatar: string;
  };
  channelId: string;
  isRead?: boolean;
  attachments?: Array<{
    id: string;
    type: string;
    url: string;
    name: string;
    size?: number;
    thumbnail?: string;
  }>;
  reactions?: Array<{
    emoji: string;
    count: number;
    userIds: string[];
  }>;
}

type MessageListener = (message: ChatMessage) => void;
type ConnectionChangeListener = (isConnected: boolean) => void;

class ChatService {
  private static instance: ChatService;
  private wsService = WebSocketService;
  private messageListeners: MessageListener[] = [];
  private connectionListeners: ConnectionChangeListener[] = [];
  private isConnected = false;

  private constructor() {
    this.wsService.onMessage((data: any) => {
      if (data.type === 'message') {
        // Dispatch to listeners
        this.messageListeners.forEach(listener => listener(data.message));
      }
    });
    
    this.wsService.onConnectionChange((connected: boolean) => {
      this.isConnected = connected;
      this.connectionListeners.forEach(listener => listener(connected));
    });
  }
  
  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }
  
  public connect(): void {
    const user = localStorage.getItem('user');
    if (!user) return;
    
    const userData = JSON.parse(user);
    this.wsService.connect(userData.id);
  }
  
  public disconnect(): void {
    this.wsService.disconnect();
  }
  
  public sendMessage(message: Omit<ChatMessage, 'id' | 'timestamp'>): void {
    // Add unique ID and timestamp if not provided
    const completeMessage: ChatMessage = {
      ...message,
      id: message.id || `msg_${Date.now()}`,
      timestamp: message.timestamp || new Date().toISOString()
    };
    
    // For demo purposes, we'll just echo it back to listeners
    // In a real app, this would go through the WebSocket
    setTimeout(() => {
      this.messageListeners.forEach(listener => listener(completeMessage));
    }, 100);
    
    // Send through websocket
    this.wsService.send({
      type: 'message',
      message: completeMessage
    });
  }
  
  public onMessage(callback: MessageListener): () => void {
    this.messageListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
    };
  }
  
  public onConnectionChange(callback: ConnectionChangeListener): () => void {
    this.connectionListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.connectionListeners = this.connectionListeners.filter(cb => cb !== callback);
    };
  }
  
  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
  
  // For testing, to make fake chats
  public createFakeChatHistory(channelId: string, count: number = 10): ChatMessage[] {
    const messages: ChatMessage[] = [];
    const users = [
      { id: '1', name: 'Alice', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice' },
      { id: '2', name: 'Bob', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob' },
      { id: '3', name: 'Charlie', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie' },
      { id: '4', name: 'Dana', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Dana' },
    ];
    
    const topics = [
      'project timeline', 'design feedback', 'marketing strategy',
      'quarterly goals', 'team building', 'product launch',
      'customer feedback', 'technical issues', 'brainstorming',
    ];
    
    const messageTemplates = [
      'What do you think about the {{topic}}?',
      'I need help with the {{topic}}.',
      'Has anyone looked at the {{topic}} yet?',
      'We should discuss the {{topic}} in our next meeting.',
      'I've made some progress on the {{topic}}.',
      'The client is asking about the {{topic}}.',
      'Any updates on the {{topic}}?',
      'I'm struggling with the {{topic}}, any suggestions?',
      'Great work on the {{topic}} everyone!',
      'Let's finalize the {{topic}} by end of week.',
    ];
    
    const now = new Date();
    
    for (let i = 0; i < count; i++) {
      const user = users[Math.floor(Math.random() * users.length)];
      const topic = topics[Math.floor(Math.random() * topics.length)];
      const template = messageTemplates[Math.floor(Math.random() * messageTemplates.length)];
      const content = template.replace('{{topic}}', topic);
      
      // Create message timestamp, going back in time
      const timestamp = new Date(now.getTime() - (count - i) * 5 * 60000);
      
      messages.push({
        id: `msg_${Date.now()}_${i}`,
        content,
        timestamp: timestamp.toISOString(),
        sender: user,
        channelId,
        isRead: true
      });
    }
    
    return messages;
  }
}

export default ChatService.getInstance();
