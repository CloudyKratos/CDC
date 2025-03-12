
import { Message } from "../types/chat";
import WebSocketService from "./WebSocketService";

type ChatCallback = (messages: Message[]) => void;
type ConnectionCallback = (status: 'connected' | 'disconnected') => void;

class ChatService {
  private static instance: ChatService;
  private messages: Message[] = [];
  private messageCallbacks: ChatCallback[] = [];
  private connectionCallbacks: ConnectionCallback[] = [];
  private webSocketService: WebSocketService;

  private constructor() {
    this.webSocketService = WebSocketService.getInstance();

    this.webSocketService.onMessage((data: any) => {
      if (data.type === 'chat') {
        const message: Message = data.message;
        this.messages.push(message);
        this.notifyMessageCallbacks();
      }
    });

    this.webSocketService.onConnectionChange((status: 'connected' | 'disconnected') => {
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

  public onConnectionChange(callback: ConnectionCallback): void {
    this.connectionCallbacks.push(callback);
  }

  private notifyMessageCallbacks(): void {
    this.messageCallbacks.forEach(callback => callback([...this.messages]));
  }

  private notifyConnectionCallbacks(status: 'connected' | 'disconnected'): void {
    this.connectionCallbacks.forEach(callback => callback(status));
  }

  public disconnect(): void {
    // Disconnect logic here
    console.log("Disconnecting from chat service");
  }
}

export default ChatService;
