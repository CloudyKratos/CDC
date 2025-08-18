export interface StageError {
  code: string;
  message: string;
  timestamp: Date;
  context?: any;
  recoverable: boolean;
}

export class StageErrorHandler {
  private static instance: StageErrorHandler;
  private errorHistory: StageError[] = [];
  private maxHistorySize = 50;
  private errorListeners: Map<string, Function[]> = new Map();

  static getInstance(): StageErrorHandler {
    if (!StageErrorHandler.instance) {
      StageErrorHandler.instance = new StageErrorHandler();
    }
    return StageErrorHandler.instance;
  }

  handleError(error: Error | string, context?: any): StageError {
    const stageError: StageError = {
      code: error instanceof Error ? error.name : 'GENERIC_ERROR',
      message: error instanceof Error ? error.message : error,
      timestamp: new Date(),
      context,
      recoverable: this.isRecoverable(error)
    };

    console.error('Stage Error:', stageError);

    // Add to history
    this.errorHistory.push(stageError);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory.shift();
    }

    // Emit error event
    this.emit('error', stageError);

    // Auto-recovery for certain errors
    if (stageError.recoverable) {
      this.scheduleRecovery(stageError);
    }

    return stageError;
  }

  private isRecoverable(error: Error | string): boolean {
    const message = error instanceof Error ? error.message : error;
    
    // Define recoverable error patterns
    const recoverablePatterns = [
      'connection failed',
      'network error',
      'timeout',
      'ice connection failed',
      'signaling error',
      'websocket connection lost'
    ];

    return recoverablePatterns.some(pattern => 
      message.toLowerCase().includes(pattern)
    );
  }

  private scheduleRecovery(error: StageError): void {
    // Emit recovery event with a delay
    setTimeout(() => {
      this.emit('recovery-suggested', error);
    }, 2000);
  }

  getRecentErrors(minutes: number = 5): StageError[] {
    const cutoff = new Date(Date.now() - minutes * 60 * 1000);
    return this.errorHistory.filter(error => error.timestamp > cutoff);
  }

  clearHistory(): void {
    this.errorHistory = [];
  }

  on(event: string, listener: Function): void {
    const listeners = this.errorListeners.get(event) || [];
    listeners.push(listener);
    this.errorListeners.set(event, listeners);
  }

  off(event: string, listener: Function): void {
    const listeners = this.errorListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.errorListeners.set(event, listeners);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.errorListeners.get(event) || [];
    listeners.forEach(listener => {
      try {
        listener(data);
      } catch (err) {
        console.error('Error in error handler listener:', err);
      }
    });
  }

  cleanup(): void {
    this.errorHistory = [];
    this.errorListeners.clear();
  }
}