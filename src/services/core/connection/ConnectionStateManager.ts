
interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  reconnectAttempts: number;
  lastConnectionTime: Date | null;
}

export class ConnectionStateManager {
  private connectionState: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    error: null,
    reconnectAttempts: 0,
    lastConnectionTime: null
  };

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  setConnectionState(updates: Partial<ConnectionState>): void {
    this.connectionState = { ...this.connectionState, ...updates };
  }

  markConnected(): void {
    this.connectionState = {
      ...this.connectionState,
      isConnected: true,
      isConnecting: false,
      lastConnectionTime: new Date(),
      reconnectAttempts: 0,
      error: null
    };
  }

  markDisconnected(): void {
    this.connectionState = {
      ...this.connectionState,
      isConnected: false,
      isConnecting: false
    };
  }

  markConnecting(): void {
    this.connectionState = {
      ...this.connectionState,
      isConnecting: true,
      error: null
    };
  }

  markError(error: string): void {
    this.connectionState = {
      ...this.connectionState,
      isConnecting: false,
      error
    };
  }

  incrementReconnectAttempts(): void {
    this.connectionState.reconnectAttempts++;
  }

  resetReconnectAttempts(): void {
    this.connectionState.reconnectAttempts = 0;
  }
}
