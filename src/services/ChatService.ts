
import { Message } from "../types/chat";
import WebSocketService from "./WebSocketService";

type ChatCallback = (messages: Message[]) => void;
type MessageCallback = (message: Message) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected') => void;

class ChatService {
  private static instance: ChatService;
  private messages: Message[] = [];
  private messageCallbacks: ChatCallback[] = [];
  private singleMessageCallbacks: MessageCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private webSocketService: WebSocketService;

  private constructor() {
    this.webSocketService = WebSocketService.getInstance();

    this.webSocketService.onMessage((data: any) => {
      if (data.type === 'chat') {
        const message: Message = data.message;
        this.messages.push(message);
        this.notifyMessageCallbacks();
        this.notifySingleMessageCallbacks(message);
      }
    });

    this.webSocketService.onConnectionChange((isConnected: boolean) => {
      const status = isConnected ? 'connected' : 'disconnected';
      this.notifyConnectionCallbacks(status);
    });
  }

  public static getInstance(): ChatService {
    if (!ChatService.instance) {
      ChatService.instance = new ChatService();
    }
    return ChatService.instance;
  }

  public connect(roomId: string): void {
    // Connection logic here
    console.log(`Connecting to room: ${roomId}`);
  }

  public sendMessage(message: Message): void {
    // Add to local messages immediately (optimistic update)
    this.messages.push(message);
    this.notifyMessageCallbacks();
    this.notifySingleMessageCallbacks(message);

    // Send via websocket
    this.webSocketService.send({
      type: 'chat',
      message
    });
  }

  public getMessages(): Message[] {
    return [...this.messages];
  }

  public onNewMessage(callback: ChatCallback): void {
    this.messageCallbacks.push(callback);
  }

  public onMessage(callback: MessageCallback): void {
    this.singleMessageCallbacks.push(callback);
  }

  public onConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyMessageCallbacks(): void {
    this.messageCallbacks.forEach(callback => callback([...this.messages]));
  }

  private notifySingleMessageCallbacks(message: Message): void {
    this.singleMessageCallbacks.forEach(callback => callback(message));
  }

  private notifyConnectionCallbacks(status: 'connected' | 'disconnected'): void {
    this.connectionCallbacks.forEach(callback => callback(status));
  }

  public disconnect(): void {
    // Disconnect logic here
    console.log("Disconnecting from chat service");
  }
}

export default ChatService.getInstance();
