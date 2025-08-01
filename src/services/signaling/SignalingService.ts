
import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

interface SignalingMessage {
  type: 'offer' | 'answer' | 'ice-candidate' | 'user-joined' | 'user-left' | 'control';
  from: string;
  to?: string;
  data: any;
  timestamp: number;
}

export class SignalingService extends BrowserEventEmitter {
  private static instance: SignalingService;
  private ws: WebSocket | null = null;
  private stageId: string | null = null;
  private userId: string | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private connectedUsers: Set<string> = new Set();

  private constructor() {
    super();
  }

  static getInstance(): SignalingService {
    if (!SignalingService.instance) {
      SignalingService.instance = new SignalingService();
    }
    return SignalingService.instance;
  }

  async connect(stageId: string, userId: string): Promise<boolean> {
    if (this.isConnected && this.stageId === stageId && this.userId === userId) {
      return true;
    }

    this.stageId = stageId;
    this.userId = userId;

    try {
      console.log(`Connecting to signaling server for stage: ${stageId}, user: ${userId}`);
      
      // In a real implementation, this would connect to your signaling server
      // For now, we'll simulate the connection
      await this.simulateSignalingConnection();
      
      this.isConnected = true;
      this.reconnectAttempts = 0;
      this.emit('connected', { stageId, userId });
      
      console.log('Successfully connected to signaling server');
      return true;
    } catch (error) {
      console.error('Failed to connect to signaling server:', error);
      this.emit('connectionError', { error });
      return false;
    }
  }

  private async simulateSignalingConnection(): Promise<void> {
    // Simulate WebSocket connection
    return new Promise((resolve) => {
      setTimeout(() => {
        // Simulate existing users in the room
        const mockUsers = ['user1', 'user2'];
        mockUsers.forEach(userId => {
          if (userId !== this.userId) {
            this.connectedUsers.add(userId);
            setTimeout(() => {
              this.emit('userJoined', { userId });
            }, 500);
          }
        });
        resolve();
      }, 1000);
    });
  }

  sendMessage(message: Omit<SignalingMessage, 'from' | 'timestamp'>): void {
    if (!this.isConnected || !this.userId) {
      console.warn('Cannot send message: not connected or no user ID');
      return;
    }

    const fullMessage: SignalingMessage = {
      ...message,
      from: this.userId,
      timestamp: Date.now()
    };

    console.log('Sending signaling message:', fullMessage);

    // In a real implementation, this would send through WebSocket
    // For now, we'll simulate the message delivery
    this.simulateMessageDelivery(fullMessage);
  }

  private simulateMessageDelivery(message: SignalingMessage): void {
    // Simulate message delivery to other clients
    setTimeout(() => {
      if (message.to) {
        // Direct message
        this.handleIncomingMessage(message);
      } else {
        // Broadcast message
        this.connectedUsers.forEach(userId => {
          if (userId !== message.from) {
            this.handleIncomingMessage({ ...message, to: userId });
          }
        });
      }
    }, 100);
  }

  private handleIncomingMessage(message: SignalingMessage): void {
    console.log('Received signaling message:', message);

    switch (message.type) {
      case 'offer':
        this.emit('offer', { userId: message.from, offer: message.data });
        break;
      case 'answer':
        this.emit('answer', { userId: message.from, answer: message.data });
        break;
      case 'ice-candidate':
        this.emit('iceCandidate', { userId: message.from, candidate: message.data });
        break;
      case 'user-joined':
        this.connectedUsers.add(message.data.userId);
        this.emit('userJoined', { userId: message.data.userId });
        break;
      case 'user-left':
        this.connectedUsers.delete(message.data.userId);
        this.emit('userLeft', { userId: message.data.userId });
        break;
      case 'control':
        this.emit('controlMessage', { userId: message.from, data: message.data });
        break;
    }
  }

  getConnectedUsers(): string[] {
    return Array.from(this.connectedUsers);
  }

  disconnect(): void {
    console.log('Disconnecting from signaling server');
    
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }

    if (this.isConnected && this.stageId && this.userId) {
      this.sendMessage({
        type: 'user-left',
        data: { userId: this.userId }
      });
    }

    this.isConnected = false;
    this.stageId = null;
    this.userId = null;
    this.connectedUsers.clear();
    this.removeAllListeners();
    
    this.emit('disconnected');
  }
}

export default SignalingService.getInstance();
