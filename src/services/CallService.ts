
import { WebRTCService } from './WebRTCService';
import ChatService from './ChatService';

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  audioEnabled: boolean;
  videoEnabled: boolean;
}

export type CallType = 'audio' | 'video';

export interface CallEvent {
  type: 'call_started' | 'call_ended' | 'participant_joined' | 'participant_left' | 'stream_updated' | 'media_status_changed';
  data: any;
}

class CallService {
  private webRTC: WebRTCService;
  private callListeners: ((event: CallEvent) => void)[] = [];
  private activeCall: {
    id: string;
    type: CallType;
    participants: CallParticipant[];
    startTime: Date;
  } | null = null;
  
  constructor() {
    this.webRTC = WebRTCService.getInstance();
    
    this.webRTC.onTrack((userId, stream) => {
      if (this.activeCall) {
        const participant = this.activeCall.participants.find(p => p.id === userId);
        if (participant) {
          participant.stream = stream;
          this.notifyCallListeners({
            type: 'stream_updated',
            data: { participantId: userId, stream }
          });
        }
      }
    });
    
    this.webRTC.onConnectionStateChange((userId, state) => {
      if (state === 'disconnected' || state === 'failed' || state === 'closed') {
        this.handleParticipantDisconnect(userId);
      }
    });
    
    // Listen for signaling messages from the chat service
    ChatService.onMessage((message) => {
      if (message.content.startsWith('__CALL_SIGNAL:')) {
        const signalData = JSON.parse(message.content.replace('__CALL_SIGNAL:', ''));
        this.webRTC.handleSignalingData(message.sender.id, signalData);
      }
    });
  }
  
  public async startCall(participants: string[], type: CallType): Promise<string> {
    if (this.activeCall) {
      throw new Error('Call already in progress');
    }
    
    const callId = `call_${Date.now()}`;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Initialize WebRTC connections
    await this.webRTC.initialize();
    
    const localStream = await this.webRTC.getLocalStream(type === 'video');
    
    this.activeCall = {
      id: callId,
      type,
      participants: [
        {
          id: user.id,
          name: user.name,
          avatar: user.avatar,
          stream: localStream,
          audioEnabled: true,
          videoEnabled: type === 'video'
        }
      ],
      startTime: new Date()
    };
    
    // Send call invitation to participants via chat service
    participants.forEach(participantId => {
      ChatService.sendMessage({
        content: `__CALL_INVITATION:${JSON.stringify({
          callId,
          type,
          initiator: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          }
        })}`,
        sender: {
          id: user.id,
          name: user.name,
          avatar: user.avatar
        },
        channelId: participantId // Direct message to participant
      });
    });
    
    this.notifyCallListeners({
      type: 'call_started',
      data: {
        callId,
        type,
        participants: this.activeCall.participants
      }
    });
    
    return callId;
  }
  
  public async joinCall(callId: string, initiatorId: string): Promise<void> {
    if (this.activeCall) {
      throw new Error('Already in a call');
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Request call details from initiator
    ChatService.sendMessage({
      content: `__CALL_JOIN_REQUEST:${callId}`,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      channelId: initiatorId // Direct message to initiator
    });
    
    // Initialize WebRTC connection with initiator
    await this.webRTC.initialize();
    await this.webRTC.createPeerConnection(initiatorId);
    
    // Wait for call details (this will be handled by the message listener)
  }
  
  public async endCall(): Promise<void> {
    if (!this.activeCall) {
      return;
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    // Notify other participants
    this.activeCall.participants.forEach(participant => {
      if (participant.id !== user.id) {
        ChatService.sendMessage({
          content: `__CALL_END:${this.activeCall!.id}`,
          sender: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          },
          channelId: participant.id
        });
      }
    });
    
    // Stop local stream
    if (this.activeCall.participants[0]?.stream) {
      this.activeCall.participants[0].stream.getTracks().forEach(track => track.stop());
    }
    
    // Close all peer connections
    this.webRTC.closeAllConnections();
    
    const callData = { ...this.activeCall };
    this.activeCall = null;
    
    this.notifyCallListeners({
      type: 'call_ended',
      data: {
        callId: callData.id,
        duration: new Date().getTime() - callData.startTime.getTime(),
        participants: callData.participants
      }
    });
  }
  
  public toggleAudio(enabled: boolean): void {
    if (!this.activeCall || !this.activeCall.participants[0]?.stream) {
      return;
    }
    
    const audioTracks = this.activeCall.participants[0].stream.getAudioTracks();
    audioTracks.forEach(track => {
      track.enabled = enabled;
    });
    
    this.activeCall.participants[0].audioEnabled = enabled;
    
    this.notifyCallListeners({
      type: 'media_status_changed',
      data: {
        participantId: this.activeCall.participants[0].id,
        audio: enabled,
        video: this.activeCall.participants[0].videoEnabled
      }
    });
  }
  
  public toggleVideo(enabled: boolean): void {
    if (!this.activeCall || !this.activeCall.participants[0]?.stream) {
      return;
    }
    
    const videoTracks = this.activeCall.participants[0].stream.getVideoTracks();
    videoTracks.forEach(track => {
      track.enabled = enabled;
    });
    
    this.activeCall.participants[0].videoEnabled = enabled;
    
    this.notifyCallListeners({
      type: 'media_status_changed',
      data: {
        participantId: this.activeCall.participants[0].id,
        audio: this.activeCall.participants[0].audioEnabled,
        video: enabled
      }
    });
  }
  
  public onCallEvent(listener: (event: CallEvent) => void): () => void {
    this.callListeners.push(listener);
    return () => {
      this.callListeners = this.callListeners.filter(l => l !== listener);
    };
  }
  
  public getActiveCall() {
    return this.activeCall;
  }
  
  private handleParticipantDisconnect(participantId: string): void {
    if (!this.activeCall) return;
    
    const participantIndex = this.activeCall.participants.findIndex(p => p.id === participantId);
    if (participantIndex > -1) {
      const participant = this.activeCall.participants[participantIndex];
      this.activeCall.participants.splice(participantIndex, 1);
      
      this.notifyCallListeners({
        type: 'participant_left',
        data: {
          callId: this.activeCall.id,
          participant
        }
      });
      
      // If no more participants (except self), end the call
      if (this.activeCall.participants.length <= 1) {
        this.endCall();
      }
    }
  }
  
  private notifyCallListeners(event: CallEvent): void {
    this.callListeners.forEach(listener => listener(event));
  }
  
  private static instance: CallService;
  
  public static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }
}

export default CallService.getInstance();
