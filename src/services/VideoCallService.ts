
import WebRTCService from './WebRTCService';
import { CallParticipant } from './CallService';
import { User } from '@/types/workspace';
import { Observable, Subject } from 'rxjs';

export enum CallType {
  STANDARD = 'standard',
  STAGE = 'stage' // Discord stage-like call
}

export enum ParticipantRole {
  SPEAKER = 'speaker',
  LISTENER = 'listener',
  HOST = 'host'
}

export interface StageParticipant extends CallParticipant {
  role: ParticipantRole;
  isSpeaking: boolean;
  hasRequestedToSpeak: boolean;
}

export interface StageCall {
  id: string;
  name: string;
  description?: string;
  startTime: Date;
  scheduledEndTime?: Date;
  type: CallType;
  participants: StageParticipant[];
  hostId: string;
}

class VideoCallService {
  private static instance: VideoCallService;
  private webRTCService: typeof WebRTCService;
  private activeCalls: Map<string, StageCall> = new Map();
  private currentUserRole: Map<string, ParticipantRole> = new Map();
  private speakRequestsSubject = new Subject<{callId: string, userId: string, approved: boolean}>();
  
  private constructor() {
    this.webRTCService = WebRTCService;
  }
  
  public static getInstance(): VideoCallService {
    if (!VideoCallService.instance) {
      VideoCallService.instance = new VideoCallService();
    }
    return VideoCallService.instance;
  }
  
  public async initialize(): Promise<void> {
    await this.webRTCService.initialize();
    console.log('Video call service initialized');
  }
  
  public async createStageCall(name: string, description?: string): Promise<StageCall> {
    const callId = `call-${Date.now()}`;
    
    const stageCall: StageCall = {
      id: callId,
      name,
      description,
      startTime: new Date(),
      type: CallType.STAGE,
      participants: [],
      hostId: 'current-user' // Would be replaced with actual user ID in real implementation
    };
    
    this.activeCalls.set(callId, stageCall);
    this.currentUserRole.set(callId, ParticipantRole.HOST);
    
    return stageCall;
  }
  
  public async joinStageCall(callId: string, user: User, asListener = true): Promise<StageCall> {
    const call = this.activeCalls.get(callId);
    if (!call) {
      throw new Error(`Call with ID ${callId} not found`);
    }
    
    const role = call.hostId === user.id 
      ? ParticipantRole.HOST 
      : (asListener ? ParticipantRole.LISTENER : ParticipantRole.SPEAKER);
    
    this.currentUserRole.set(callId, role);
    
    const localStream = await this.webRTCService.getLocalStream(!asListener);
    
    const participant: StageParticipant = {
      id: user.id,
      name: user.name,
      avatar: user.avatar || '',
      isMuted: role === ParticipantRole.LISTENER,
      isVideoEnabled: role !== ParticipantRole.LISTENER,
      isScreenSharing: false,
      role,
      isSpeaking: false,
      hasRequestedToSpeak: false,
      stream: localStream
    };
    
    call.participants.push(participant);
    this.activeCalls.set(callId, {...call});
    
    return call;
  }
  
  public leaveStageCall(callId: string, userId: string): void {
    const call = this.activeCalls.get(callId);
    if (!call) return;
    
    call.participants = call.participants.filter(p => p.id !== userId);
    
    if (call.participants.length === 0) {
      this.activeCalls.delete(callId);
    } else {
      this.activeCalls.set(callId, {...call});
    }
    
    this.currentUserRole.delete(callId);
    
    // Close WebRTC connections as well
    this.webRTCService.closeConnection(userId);
  }
  
  public requestToSpeak(callId: string, userId: string): void {
    const call = this.activeCalls.get(callId);
    if (!call) return;
    
    const participant = call.participants.find(p => p.id === userId);
    if (!participant) return;
    
    participant.hasRequestedToSpeak = true;
    this.activeCalls.set(callId, {...call});
    
    // In a real app, this would send a notification to the host
    console.log(`User ${userId} requested to speak in call ${callId}`);
  }
  
  public approveRequestToSpeak(callId: string, userId: string, approved: boolean): void {
    const call = this.activeCalls.get(callId);
    if (!call) return;
    
    const participant = call.participants.find(p => p.id === userId);
    if (!participant) return;
    
    if (approved) {
      participant.role = ParticipantRole.SPEAKER;
      participant.isMuted = false;
      participant.hasRequestedToSpeak = false;
      
      this.speakRequestsSubject.next({
        callId,
        userId,
        approved: true
      });
    } else {
      participant.hasRequestedToSpeak = false;
      
      this.speakRequestsSubject.next({
        callId,
        userId,
        approved: false
      });
    }
    
    this.activeCalls.set(callId, {...call});
  }
  
  public onSpeakRequestUpdated(): Observable<{callId: string, userId: string, approved: boolean}> {
    return this.speakRequestsSubject.asObservable();
  }
  
  public getCurrentUserRole(callId: string): ParticipantRole | undefined {
    return this.currentUserRole.get(callId);
  }
  
  public muteParticipant(callId: string, userId: string, mute: boolean): void {
    const call = this.activeCalls.get(callId);
    if (!call) return;
    
    const participant = call.participants.find(p => p.id === userId);
    if (!participant) return;
    
    participant.isMuted = mute;
    this.activeCalls.set(callId, {...call});
  }
  
  public getActiveStageCalls(): StageCall[] {
    return Array.from(this.activeCalls.values());
  }
  
  public getStageCall(callId: string): StageCall | undefined {
    return this.activeCalls.get(callId);
  }
}

export default VideoCallService.getInstance();
