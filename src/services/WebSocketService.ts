
class WebSocketService {
  private static instance: WebSocketService;
  private ws: WebSocket | null = null;
  private messageListeners: ((data: any) => void)[] = [];
  private connectionChangeListeners: ((isConnected: boolean) => void)[] = [];
  private isConnected = false;
  private userId: string | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectTimer: NodeJS.Timeout | null = null;

  private constructor() {
    // Private constructor for singleton pattern
  }

  public static getInstance(): WebSocketService {
    if (!WebSocketService.instance) {
      WebSocketService.instance = new WebSocketService();
    }
    return WebSocketService.instance;
  }

  public connect(userId: string): void {
    this.userId = userId;
    
    // In a real app, this would be a WebSocket connection to your server
    // For demo, we'll fake the connection with setTimeout
    console.log(`Connecting to WebSocket server for user ${userId}...`);
    
    setTimeout(() => {
      this.isConnected = true;
      this.reconnectAttempts = 0;
      
      this.connectionChangeListeners.forEach(listener => listener(true));
      
      console.log('WebSocket connected!');
    }, 1000);
  }

  public disconnect(): void {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    this.isConnected = false;
    this.connectionChangeListeners.forEach(listener => listener(false));
    
    console.log('WebSocket disconnected');
  }

  public send(data: any): void {
    if (!this.isConnected) {
      console.error('Cannot send message: WebSocket not connected');
      return;
    }
    
    // In a real app, this would send data over the WebSocket
    // For demo, we'll just log it
    console.log('Sending message:', data);
    
    // Echo it back for demo purposes
    if (data.type === 'message') {
      setTimeout(() => {
        this.messageListeners.forEach(listener => listener(data));
      }, 500);
    }
  }

  public onMessage(callback: (data: any) => void): void {
    this.messageListeners.push(callback);
  }

  public onConnectionChange(callback: (isConnected: boolean) => void): void {
    this.connectionChangeListeners.push(callback);
    
    // Immediately call with current state
    callback(this.isConnected);
  }

  public isConnectedToServer(): boolean {
    return this.isConnected;
  }
}

export default WebSocketService.getInstance();
