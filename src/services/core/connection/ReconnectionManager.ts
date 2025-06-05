
export class ReconnectionManager {
  private reconnectTimer: NodeJS.Timeout | null = null;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 2000; // Start with 2 seconds
  private eventListeners: Map<string, Function[]> = new Map();

  async attemptReconnection(
    stageId: string | null, 
    userId: string | null, 
    reconnectAttempts: number,
    connectToStage: (stageId: string, userId: string) => Promise<{ success: boolean; error?: string }>,
    disconnectFromStage: () => Promise<void>
  ): Promise<void> {
    if (!stageId || !userId || reconnectAttempts >= this.maxReconnectAttempts) {
      const error = 'Maximum reconnection attempts reached';
      this.emit('connectionError', { error });
      return;
    }

    const currentAttempts = reconnectAttempts + 1;
    const delay = this.reconnectDelay * Math.pow(2, currentAttempts - 1); // Exponential backoff

    console.log(`Attempting reconnection ${currentAttempts}/${this.maxReconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await disconnectFromStage();
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait a bit before reconnecting
        await connectToStage(stageId, userId);
      } catch (error) {
        console.error('Reconnection failed:', error);
        this.attemptReconnection(stageId, userId, currentAttempts, connectToStage, disconnectFromStage);
      }
    }, delay);
  }

  cancelReconnection(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }

  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  cleanup(): void {
    this.cancelReconnection();
    this.eventListeners.clear();
  }
}
