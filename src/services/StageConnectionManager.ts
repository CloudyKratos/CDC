
import { supabase } from "@/integrations/supabase/client";
import StageService from './StageService';

interface ConnectionState {
  isConnected: boolean;
  stageId: string | null;
  userId: string | null;
  lastPing: number;
  isConnecting: boolean;
}

class StageConnectionManager {
  private static instance: StageConnectionManager;
  private connectionState: ConnectionState = {
    isConnected: false,
    stageId: null,
    userId: null,
    lastPing: Date.now(),
    isConnecting: false
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private connectionLock = false;

  private constructor() {
    this.setupEventHandlers();
  }

  static getInstance(): StageConnectionManager {
    if (!StageConnectionManager.instance) {
      StageConnectionManager.instance = new StageConnectionManager();
    }
    return StageConnectionManager.instance;
  }

  async forceDisconnect(stageId: string, userId?: string): Promise<void> {
    if (this.connectionLock) {
      console.log('Connection operation in progress, waiting...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    this.connectionLock = true;
    
    try {
      console.log('Force disconnecting from stage:', stageId);
      
      // Clear any existing timeouts and intervals
      this.clearAllTimeouts();
      this.stopHeartbeat();

      // Force cleanup in database with retries
      if (userId) {
        await this.retryOperation(() => StageService.forceDisconnectUser(stageId, userId), 3);
      }

      // Reset connection state
      this.connectionState = {
        isConnected: false,
        stageId: null,
        userId: null,
        lastPing: Date.now(),
        isConnecting: false
      };

      console.log('Force disconnect completed');
    } catch (error) {
      console.error('Error during force disconnect:', error);
      // Reset state anyway to prevent getting stuck
      this.connectionState.isConnected = false;
      this.connectionState.isConnecting = false;
    } finally {
      this.connectionLock = false;
    }
  }

  async attemptConnection(stageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    if (this.connectionLock || this.connectionState.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.connectionLock = true;
    this.connectionState.isConnecting = true;
    
    try {
      console.log('Attempting connection to stage:', stageId);
      
      // Step 1: Force cleanup any existing connections
      await this.forceDisconnect(stageId, userId);
      await this.waitForCleanup(1000);

      // Step 2: Validate access
      const validation = await StageService.validateStageAccess(stageId);
      if (!validation.canAccess) {
        return { success: false, error: validation.reason };
      }

      // Step 3: Clean up ghost participants
      await StageService.cleanupGhostParticipants(stageId);
      await this.waitForCleanup(500);

      // Step 4: Attempt to join with retries
      const joinResult = await this.retryOperation(
        () => StageService.joinStage(stageId, 'audience'),
        3
      );
      
      if (joinResult.success) {
        this.connectionState = {
          isConnected: true,
          stageId,
          userId,
          lastPing: Date.now(),
          isConnecting: false
        };
        
        this.startHeartbeat();
        console.log('Connection successful');
        return { success: true };
      } else {
        return { success: false, error: joinResult.error };
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      return { success: false, error: 'Failed to establish connection' };
    } finally {
      this.connectionState.isConnecting = false;
      this.connectionLock = false;
    }
  }

  private async retryOperation<T>(operation: () => Promise<T>, maxRetries: number): Promise<T> {
    let lastError: Error;
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;
        console.log(`Operation failed (attempt ${i + 1}/${maxRetries}):`, error);
        
        if (i < maxRetries - 1) {
          await this.waitForCleanup(1000 * (i + 1)); // Exponential backoff
        }
      }
    }
    
    throw lastError!;
  }

  private async waitForCleanup(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.connectionState.lastPing = Date.now();
      console.log('Heartbeat ping');
    }, 30000);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private clearAllTimeouts(): void {
    this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
    this.cleanupTimeouts.clear();
  }

  private setupEventHandlers(): void {
    // Handle page visibility changes
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.connectionState.isConnected) {
        this.scheduleCleanup();
      } else if (!document.hidden) {
        this.cancelScheduledCleanup();
      }
    });

    // Handle page unload
    window.addEventListener('beforeunload', () => {
      if (this.connectionState.isConnected && this.connectionState.stageId) {
        // Attempt synchronous cleanup
        navigator.sendBeacon(
          '/api/stage-disconnect',
          JSON.stringify({
            stageId: this.connectionState.stageId,
            userId: this.connectionState.userId
          })
        );
      }
    });
  }

  private scheduleCleanup(): void {
    const cleanupTimeout = setTimeout(() => {
      if (this.connectionState.isConnected && this.connectionState.stageId) {
        this.forceDisconnect(this.connectionState.stageId, this.connectionState.userId);
      }
    }, 60000); // 1 minute delay

    this.cleanupTimeouts.set('visibility', cleanupTimeout);
  }

  private cancelScheduledCleanup(): void {
    const timeout = this.cleanupTimeouts.get('visibility');
    if (timeout) {
      clearTimeout(timeout);
      this.cleanupTimeouts.delete('visibility');
    }
  }

  getConnectionState(): ConnectionState {
    return { ...this.connectionState };
  }

  isConnectedToStage(stageId: string): boolean {
    return this.connectionState.isConnected && this.connectionState.stageId === stageId;
  }
}

export default StageConnectionManager;
