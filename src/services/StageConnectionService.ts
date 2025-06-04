
import { supabase } from "@/integrations/supabase/client";
import StageService from './StageService';

interface ConnectionResult {
  success: boolean;
  error?: string;
}

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  stageId: string | null;
  userId: string | null;
  lastActivity: number;
}

class StageConnectionService {
  private static instance: StageConnectionService;
  private state: ConnectionState = {
    isConnected: false,
    isConnecting: false,
    stageId: null,
    userId: null,
    lastActivity: Date.now()
  };
  
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private readonly HEARTBEAT_INTERVAL = 30000; // 30 seconds
  private readonly CONNECTION_TIMEOUT = 15000; // 15 seconds

  static getInstance(): StageConnectionService {
    if (!StageConnectionService.instance) {
      StageConnectionService.instance = new StageConnectionService();
    }
    return StageConnectionService.instance;
  }

  async connectToStage(stageId: string, userId: string): Promise<ConnectionResult> {
    console.log('Starting stage connection process:', { stageId, userId });
    
    if (this.state.isConnecting) {
      return { success: false, error: 'Connection already in progress' };
    }

    this.state.isConnecting = true;
    
    try {
      // Step 1: Clean up any existing connections
      await this.cleanupExistingConnection(stageId, userId);
      
      // Step 2: Wait for cleanup to complete
      await this.delay(1000);
      
      // Step 3: Validate stage access
      const accessCheck = await StageService.validateStageAccess(stageId);
      if (!accessCheck.canAccess) {
        throw new Error(accessCheck.reason || 'Cannot access stage');
      }
      
      // Step 4: Join the stage with timeout
      const joinResult = await Promise.race([
        this.attemptStageJoin(stageId, userId),
        this.createTimeout(this.CONNECTION_TIMEOUT, 'Connection timeout')
      ]);
      
      if (!joinResult.success) {
        throw new Error(joinResult.error);
      }
      
      // Step 5: Update connection state
      this.state = {
        isConnected: true,
        isConnecting: false,
        stageId,
        userId,
        lastActivity: Date.now()
      };
      
      // Step 6: Start heartbeat
      this.startHeartbeat();
      
      console.log('Stage connection successful');
      return { success: true };
      
    } catch (error) {
      console.error('Stage connection failed:', error);
      this.state.isConnecting = false;
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Connection failed' 
      };
    }
  }

  async disconnectFromStage(): Promise<void> {
    console.log('Disconnecting from stage');
    
    if (this.state.stageId && this.state.userId) {
      try {
        await StageService.leaveStage(this.state.stageId);
      } catch (error) {
        console.error('Error during stage leave:', error);
      }
    }
    
    this.stopHeartbeat();
    this.resetState();
  }

  private async cleanupExistingConnection(stageId: string, userId: string): Promise<void> {
    console.log('Cleaning up existing connections');
    
    try {
      // Force disconnect from any existing sessions
      await StageService.forceDisconnectUser(stageId, userId);
      
      // Clean up ghost participants
      await StageService.cleanupGhostParticipants(stageId);
      
    } catch (error) {
      console.error('Cleanup error (non-fatal):', error);
    }
  }

  private async attemptStageJoin(stageId: string, userId: string): Promise<ConnectionResult> {
    try {
      const result = await StageService.joinStage(stageId, 'audience');
      return result;
    } catch (error) {
      console.error('Join attempt failed:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Join failed' 
      };
    }
  }

  private startHeartbeat(): void {
    this.stopHeartbeat();
    
    this.heartbeatInterval = setInterval(() => {
      this.state.lastActivity = Date.now();
      console.log('Heartbeat - connection alive');
    }, this.HEARTBEAT_INTERVAL);
  }

  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  private resetState(): void {
    this.state = {
      isConnected: false,
      isConnecting: false,
      stageId: null,
      userId: null,
      lastActivity: Date.now()
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private createTimeout(ms: number, message: string): Promise<never> {
    return new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), ms);
    });
  }

  getConnectionState(): ConnectionState {
    return { ...this.state };
  }

  isConnectedToStage(stageId?: string): boolean {
    if (stageId) {
      return this.state.isConnected && this.state.stageId === stageId;
    }
    return this.state.isConnected;
  }
}

export default StageConnectionService;
