export interface TimeoutConfig {
  operation: string;
  timeout: number;
  retryCount?: number;
  maxRetries?: number;
}

export class StageTimeoutManager {
  private static instance: StageTimeoutManager;
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private timeoutConfigs: Map<string, TimeoutConfig> = new Map();

  static getInstance(): StageTimeoutManager {
    if (!StageTimeoutManager.instance) {
      StageTimeoutManager.instance = new StageTimeoutManager();
    }
    return StageTimeoutManager.instance;
  }

  constructor() {
    // Default timeout configurations
    this.setTimeoutConfig('connection', { operation: 'connection', timeout: 30000, maxRetries: 3 });
    this.setTimeoutConfig('signaling', { operation: 'signaling', timeout: 15000, maxRetries: 2 });
    this.setTimeoutConfig('webrtc-offer', { operation: 'webrtc-offer', timeout: 10000, maxRetries: 2 });
    this.setTimeoutConfig('webrtc-answer', { operation: 'webrtc-answer', timeout: 10000, maxRetries: 2 });
    this.setTimeoutConfig('ice-gathering', { operation: 'ice-gathering', timeout: 15000, maxRetries: 1 });
    this.setTimeoutConfig('media-access', { operation: 'media-access', timeout: 10000, maxRetries: 1 });
    this.setTimeoutConfig('cleanup', { operation: 'cleanup', timeout: 5000, maxRetries: 0 });
  }

  setTimeoutConfig(key: string, config: TimeoutConfig): void {
    this.timeoutConfigs.set(key, config);
  }

  async executeWithTimeout<T>(
    key: string,
    operation: () => Promise<T>,
    customTimeout?: number
  ): Promise<T> {
    const config = this.timeoutConfigs.get(key);
    const timeoutMs = customTimeout || config?.timeout || 10000;
    const operationKey = `${key}-${Date.now()}`;

    return new Promise<T>((resolve, reject) => {
      let completed = false;

      // Set up timeout
      const timeout = setTimeout(() => {
        if (!completed) {
          completed = true;
          this.activeTimeouts.delete(operationKey);
          reject(new Error(`Operation '${key}' timed out after ${timeoutMs}ms`));
        }
      }, timeoutMs);

      this.activeTimeouts.set(operationKey, timeout);

      // Execute operation
      operation()
        .then(result => {
          if (!completed) {
            completed = true;
            clearTimeout(timeout);
            this.activeTimeouts.delete(operationKey);
            resolve(result);
          }
        })
        .catch(error => {
          if (!completed) {
            completed = true;
            clearTimeout(timeout);
            this.activeTimeouts.delete(operationKey);
            reject(error);
          }
        });
    });
  }

  async executeWithRetry<T>(
    key: string,
    operation: () => Promise<T>,
    customRetries?: number
  ): Promise<T> {
    const config = this.timeoutConfigs.get(key);
    const maxRetries = customRetries ?? config?.maxRetries ?? 1;
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`Retrying operation '${key}', attempt ${attempt}/${maxRetries}`);
          // Exponential backoff delay
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt - 1) * 1000));
        }

        return await this.executeWithTimeout(key, operation);
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`Operation '${key}' failed, attempt ${attempt + 1}/${maxRetries + 1}:`, lastError.message);
        
        if (attempt === maxRetries) {
          break;
        }
      }
    }

    throw new Error(`Operation '${key}' failed after ${maxRetries + 1} attempts. Last error: ${lastError!.message}`);
  }

  clearTimeout(key: string): void {
    const timeout = this.activeTimeouts.get(key);
    if (timeout) {
      clearTimeout(timeout);
      this.activeTimeouts.delete(key);
    }
  }

  clearAllTimeouts(): void {
    this.activeTimeouts.forEach(timeout => clearTimeout(timeout));
    this.activeTimeouts.clear();
  }

  getActiveTimeouts(): string[] {
    return Array.from(this.activeTimeouts.keys());
  }

  cleanup(): void {
    this.clearAllTimeouts();
    this.timeoutConfigs.clear();
  }
}