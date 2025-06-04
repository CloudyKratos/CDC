
import { supabase } from "@/integrations/supabase/client";
import StageService from './StageService';

interface ConnectionState {
  isConnected: boolean;
  stageId: string | null;
  userId: string | null;
  lastPing: number;
}

class StageConnectionManager {
  private static instance: StageConnectionManager;
  private connectionState: ConnectionState = {
    isConnected: false,
    stageId: null,
    userId: null,
    lastPing: Date.now()
  };
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private cleanupTimeouts: Map<string, NodeJS.Timeout> = new Map();

  private constructor() {
    this.setupVisibilityHandlers();
    this.setupBeforeUnloadHandler();
  }

  static getInstance(): StageConnectionManager {
    if (!StageConnectionManager.instance) {
      StageConnectionManager.instance = new StageConnectionManager();
    }
    return StageConnectionManager.instance;
  }

  async forceDisconnect(stageId: string, userId?: string): Promise<void> {
    console.log('Force disconnecting from stage:', stageId);
    
    try {
      // Clear any existing timeouts
      this.cleanupTimeouts.forEach(timeout => clearTimeout(timeout));
      this.cleanupTimeouts.clear();
      
      // Stop heartbeat
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Force leave stage in database
      if (userId) {
        await StageService.leaveStage(stageId);
      }

      // Reset connection state
      this.connectionState = {
        isConnected: false,
        stageId: null,
        userId: null,
        lastPing: Date.now()
      };

      console.log('Force disconnect completed');
    } catch (error) {
      console.error('Error during force disconnect:', error);
      // Reset state anyway to prevent getting stuck
      this.connectionState.isConnected = false;
    }
  }

  async attemptConnection(stageId: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // First, force disconnect any existing connection
      await this.forceDisconnect(stageId, userId);
      
      // Wait a moment before attempting new connection
      await new Promise(resolve => setTimeout(resolve, 500));

      // Check if user is already participating and clean up if needed
      const participants = await StageService.getStageParticipants(stageId);
      const existingParticipant = participants.find(p => p.user_id === userId && !p.left_at);
      
      if (existingParticipant) {
        console.log('Found existing participant, cleaning up...');
        await StageService.leaveStage(stageId);
        await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for cleanup
      }

      // Attempt to join
      const joinResult = await StageService.joinStage(stageId, 'audience');
      
      if (joinResult.success) {
        this.connectionState = {
          isConnected: true,
          stageId,
          userId,
          lastPing: Date.now()
        };
        
        this.startHeartbeat();
        return { success: true };
      } else {
        return { success: false, error: joinResult.error };
      }
    } catch (error) {
      console.error('Connection attempt failed:', error);
      return { success: false, error: 'Failed to establish connection' };
    }
  }

  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }

    this.heartbeatInterval = setInterval(() => {
      this.connectionState.lastPing = Date.now();
      // Could send heartbeat to server here if needed
    }, 30000); // 30 second intervals
  }

  private setupVisibilityHandlers(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.connectionState.isConnected) {
        // Page hidden, prepare for potential cleanup
        this.scheduleCleanup();
      } else if (!document.hidden) {
        // Page visible again, cancel cleanup
        this.cancelScheduledCleanup();
      }
    });
  }

  private setupBeforeUnloadHandler(): void {
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
