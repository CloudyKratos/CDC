
// WebSocketService.ts - Service for managing websocket connections

type MessageHandler = (data: any) => void;
type ConnectionHandler = () => void;

interface WebSocketOptions {
  reconnectAttempts?: number;
  reconnectInterval?: number;
  protocols?: string | string[];
}

class WebSocketService {
  private socket: WebSocket | null = null;
  private url: string;
  private options: WebSocketOptions;
  private reconnectAttempt: number = 0;
  private reconnectTimeout: number | null = null;
  private messageHandlers: Map<string, MessageHandler[]> = new Map();
  private connectHandlers: ConnectionHandler[] = [];
  private disconnectHandlers: ConnectionHandler[] = [];
  
  constructor(url: string, options: WebSocketOptions = {}) {
    this.url = url;
    this.options = {
      reconnectAttempts: 5,
      reconnectInterval: 3000,
      ...options
    };
  }
  
  // Connect to the WebSocket server
  public connect(): Promise<boolean> {
    return new Promise((resolve, reject) => {
      try {
        this.socket = new WebSocket(this.url, this.options.protocols);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected');
          this.reconnectAttempt = 0;
          this.notifyConnectHandlers();
          resolve(true);
        };
        
        this.socket.onclose = (event) => {
          console.log(`WebSocket closed: ${event.code} ${event.reason}`);
          this.notifyDisconnectHandlers();
          this.attemptReconnect();
          if (this.reconnectAttempt === 0) {
            // Only reject on the first attempt
            reject(new Error(`WebSocket closed: ${event.code} ${event.reason}`));
          }
        };
        
        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          if (this.reconnectAttempt === 0) {
            // Only reject on the first attempt
            reject(error);
          }
        };
        
        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        };
      } catch (error) {
        console.error('Error creating WebSocket:', error);
        this.attemptReconnect();
        reject(error);
      }
    });
  }
  
  // Send a message to the server
  public send(message: any): boolean {
    if (!this.socket || this.socket.readyState !== WebSocket.OPEN) {
      console.error('WebSocket not connected');
      return false;
    }
    
    try {
      const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
      this.socket.send(messageStr);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  // Register a message handler for a specific event type
  public on(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    
    this.messageHandlers.get(type)?.push(handler);
  }
  
  // Register a connect handler
  public onConnect(handler: ConnectionHandler): void {
    this.connectHandlers.push(handler);
  }
  
  // Register a disconnect handler
  public onDisconnect(handler: ConnectionHandler): void {
    this.disconnectHandlers.push(handler);
  }
  
  // Remove a message handler
  public off(type: string, handler: MessageHandler): void {
    if (!this.messageHandlers.has(type)) return;
    
    const handlers = this.messageHandlers.get(type);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index !== -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  // Remove a connect handler
  public offConnect(handler: ConnectionHandler): void {
    const index = this.connectHandlers.indexOf(handler);
    if (index !== -1) {
      this.connectHandlers.splice(index, 1);
    }
  }
  
  // Remove a disconnect handler
  public offDisconnect(handler: ConnectionHandler): void {
    const index = this.disconnectHandlers.indexOf(handler);
    if (index !== -1) {
      this.disconnectHandlers.splice(index, 1);
    }
  }
  
  // Disconnect from the server
  public disconnect(): void {
    if (!this.socket) return;
    
    try {
      this.socket.close();
    } catch (error) {
      console.error('Error closing WebSocket:', error);
    }
    
    this.socket = null;
    this.clearReconnectTimeout();
  }
  
  // Check if connected
  public isConnected(): boolean {
    return !!this.socket && this.socket.readyState === WebSocket.OPEN;
  }
  
  // Get the current connection state
  public getState(): number {
    return this.socket ? this.socket.readyState : WebSocket.CLOSED;
  }
  
  // Private method to handle incoming messages
  private handleMessage(data: any): void {
    // Check if the message has a type field
    const type = data.type || 'message';
    
    // Call generic message handlers
    const messageHandlers = this.messageHandlers.get('message') || [];
    messageHandlers.forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error('Error in message handler:', error);
      }
    });
    
    // Call specific type handlers
    if (type !== 'message') {
      const typeHandlers = this.messageHandlers.get(type) || [];
      typeHandlers.forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${type} handler:`, error);
        }
      });
    }
  }
  
  // Private method to attempt reconnection
  private attemptReconnect(): void {
    if (
      this.reconnectAttempt >= (this.options.reconnectAttempts || 0) || 
      this.reconnectTimeout !== null
    ) {
      return;
    }
    
    this.reconnectAttempt++;
    console.log(`Attempting to reconnect (${this.reconnectAttempt}/${this.options.reconnectAttempts})...`);
    
    this.reconnectTimeout = window.setTimeout(() => {
      this.reconnectTimeout = null;
      this.connect().catch(() => {
        // Silently catch the error as we're already handling reconnection
      });
    }, this.options.reconnectInterval);
  }
  
  // Private method to clear the reconnect timeout
  private clearReconnectTimeout(): void {
    if (this.reconnectTimeout !== null) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
  }
  
  // Private method to notify connect handlers
  private notifyConnectHandlers(): void {
    this.connectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in connect handler:', error);
      }
    });
  }
  
  // Private method to notify disconnect handlers
  private notifyDisconnectHandlers(): void {
    this.disconnectHandlers.forEach(handler => {
      try {
        handler();
      } catch (error) {
        console.error('Error in disconnect handler:', error);
      }
    });
  }
}

export default WebSocketService;
