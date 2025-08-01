
import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

export interface CallParticipant {
  userId: string;
  name: string;
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  connectionState: RTCPeerConnectionState;
  joinedAt: Date;
}

export interface CallStats {
  duration: number;
  participantCount: number;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkLatency: number;
}

export type CallState = 'idle' | 'connecting' | 'connected' | 'reconnecting' | 'disconnected' | 'error';

export class CallStateManager extends BrowserEventEmitter {
  private static instance: CallStateManager;
  private participants: Map<string, CallParticipant> = new Map();
  private callState: CallState = 'idle';
  private callStartTime: Date | null = null;
  private currentUserId: string | null = null;
  private stageId: string | null = null;
  private statsInterval: number | null = null;

  static getInstance(): CallStateManager {
    if (!CallStateManager.instance) {
      CallStateManager.instance = new CallStateManager();
    }
    return CallStateManager.instance;
  }

  startCall(stageId: string, userId: string, userName: string): void {
    this.stageId = stageId;
    this.currentUserId = userId;
    this.callStartTime = new Date();
    this.callState = 'connecting';

    // Add current user as participant
    this.addParticipant({
      userId,
      name: userName,
      isAudioEnabled: false,
      isVideoEnabled: true,
      isSpeaking: false,
      connectionState: 'connecting',
      joinedAt: new Date()
    });

    // Start stats monitoring
    this.startStatsMonitoring();

    this.emit('callStateChanged', { state: this.callState });
    console.log(`Call started for stage: ${stageId}, user: ${userId}`);
  }

  setCallState(state: CallState): void {
    if (this.callState !== state) {
      const previousState = this.callState;
      this.callState = state;
      
      console.log(`Call state changed: ${previousState} -> ${state}`);
      this.emit('callStateChanged', { state, previousState });

      if (state === 'connected' && previousState === 'connecting') {
        console.log('Call successfully connected');
        this.emit('callConnected');
      } else if (state === 'error') {
        console.error('Call entered error state');
        this.emit('callError');
      }
    }
  }

  addParticipant(participant: CallParticipant): void {
    this.participants.set(participant.userId, participant);
    this.emit('participantJoined', { participant });
    this.emit('participantsChanged', { participants: this.getParticipants() });
    
    console.log(`Participant joined: ${participant.name} (${participant.userId})`);
  }

  updateParticipant(userId: string, updates: Partial<CallParticipant>): void {
    const participant = this.participants.get(userId);
    if (participant) {
      const updatedParticipant = { ...participant, ...updates };
      this.participants.set(userId, updatedParticipant);
      
      this.emit('participantUpdated', { userId, participant: updatedParticipant });
      this.emit('participantsChanged', { participants: this.getParticipants() });
      
      // Log important state changes
      if (updates.isAudioEnabled !== undefined) {
        console.log(`${participant.name} ${updates.isAudioEnabled ? 'unmuted' : 'muted'} microphone`);
      }
      if (updates.isVideoEnabled !== undefined) {
        console.log(`${participant.name} turned camera ${updates.isVideoEnabled ? 'on' : 'off'}`);
      }
    }
  }

  removeParticipant(userId: string): void {
    const participant = this.participants.get(userId);
    if (participant) {
      this.participants.delete(userId);
      this.emit('participantLeft', { participant });
      this.emit('participantsChanged', { participants: this.getParticipants() });
      
      console.log(`Participant left: ${participant.name} (${userId})`);
    }
  }

  getParticipant(userId: string): CallParticipant | undefined {
    return this.participants.get(userId);
  }

  getParticipants(): CallParticipant[] {
    return Array.from(this.participants.values());
  }

  getCurrentUser(): CallParticipant | undefined {
    return this.currentUserId ? this.participants.get(this.currentUserId) : undefined;
  }

  getCallState(): CallState {
    return this.callState;
  }

  getCallDuration(): number {
    if (!this.callStartTime) return 0;
    return Date.now() - this.callStartTime.getTime();
  }

  getCallStats(): CallStats {
    const duration = this.getCallDuration();
    const participantCount = this.participants.size;

    // Simple quality estimation based on connection states
    const connectedParticipants = this.getParticipants().filter(p => p.connectionState === 'connected');
    const connectionRatio = connectedParticipants.length / Math.max(participantCount, 1);
    
    let audioQuality: CallStats['audioQuality'] = 'excellent';
    let videoQuality: CallStats['videoQuality'] = 'excellent';

    if (connectionRatio < 0.5) {
      audioQuality = 'poor';
      videoQuality = 'poor';
    } else if (connectionRatio < 0.8) {
      audioQuality = 'fair';
      videoQuality = 'fair';
    } else if (connectionRatio < 0.95) {
      audioQuality = 'good';
      videoQuality = 'good';
    }

    return {
      duration,
      participantCount,
      audioQuality,
      videoQuality,
      networkLatency: 50 // Placeholder - would be calculated from WebRTC stats
    };
  }

  private startStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
    }

    this.statsInterval = setInterval(() => {
      const stats = this.getCallStats();
      this.emit('statsUpdated', { stats });
    }, 5000) as unknown as number;
  }

  private stopStatsMonitoring(): void {
    if (this.statsInterval) {
      clearInterval(this.statsInterval);
      this.statsInterval = null;
    }
  }

  endCall(): void {
    console.log('Ending call...');
    
    this.stopStatsMonitoring();
    this.setCallState('disconnected');
    
    // Clean up participants
    this.participants.clear();
    this.emit('participantsChanged', { participants: [] });
    
    // Reset state
    this.callStartTime = null;
    this.currentUserId = null;
    this.stageId = null;
    
    this.emit('callEnded');
  }

  cleanup(): void {
    this.endCall();
    this.removeAllListeners();
    console.log('CallStateManager cleanup completed');
  }
}

export default CallStateManager.getInstance();
