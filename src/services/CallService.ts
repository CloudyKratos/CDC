
import WebRTCService from './WebRTCService';
import ChatService from './ChatService';
import { Message } from '../types/chat';

export interface CallParticipant {
  id: string;
  name: string;
  avatar: string;
  stream?: MediaStream;
  connectionState?: string;
  isMuted?: boolean;
  isVideoOff?: boolean;
  isScreenSharing?: boolean;
}

export interface Call {
  id: string;
  initiator: CallParticipant;
  type: 'audio' | 'video';
  participants: CallParticipant[];
  startTime: Date;
  endTime?: Date;
  status: 'ringing' | 'active' | 'ended' | 'missed';
}

type CallEventListener = (call: Call) => void;

class CallService {
  private static instance: CallService;
  private webRTC = WebRTCService;
  private activeCall: Call | null = null;
  private callEventListeners: CallEventListener[] = [];

  private constructor() {
    // Set up event listeners
    this.webRTC.onTrack((userId: string, stream: MediaStream) => {
      if (!this.activeCall) return;
      
      const participantIndex = this.activeCall.participants.findIndex(p => p.id === userId);
      if (participantIndex !== -1) {
        this.activeCall.participants[participantIndex].stream = stream;
        this.notifyCallEventListeners();
      }
    });
    
    this.webRTC.onConnectionStateChange((userId: string, state: string) => {
      if (!this.activeCall) return;
      
      const participantIndex = this.activeCall.participants.findIndex(p => p.id === userId);
      if (participantIndex !== -1) {
        this.activeCall.participants[participantIndex].connectionState = state;
        this.notifyCallEventListeners();
      }
    });
    
    // Set up chat message handler
    const chatServiceInstance = ChatService;
    chatServiceInstance.onMessage((message: Message) => {
      if (message.content.startsWith('__CALL_SIGNAL:')) {
        const signalData = JSON.parse(message.content.replace('__CALL_SIGNAL:', ''));
        this.webRTC.handleSignalingData(message.sender.id, signalData);
      }
      
      this.handleChatMessage(message);
    });
  }
  
  public static getInstance(): CallService {
    if (!CallService.instance) {
      CallService.instance = new CallService();
    }
    return CallService.instance;
  }
  
  public async initiateCall(participants: string[], type: 'audio' | 'video'): Promise<Call> {
    const callId = `call_${Date.now()}`;
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    await this.webRTC.initialize();
    
    const localStream = await this.webRTC.getLocalStream(type === 'video');
    
    // Create the call object
    this.activeCall = {
      id: callId,
      initiator: {
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        stream: localStream,
        connectionState: 'new',
      },
      type,
      participants: [{
        id: user.id,
        name: user.name,
        avatar: user.avatar,
        stream: localStream,
      }],
      status: 'ringing',
      startTime: new Date()
    };
    
    const chatServiceInstance = ChatService;
    participants.forEach(participantId => {
      chatServiceInstance.sendMessage({
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
        channelId: participantId
      });
    });
    
    this.notifyCallEventListeners();
    
    // Setup connections for each participant
    participants.forEach(async participantId => {
      await this.webRTC.createPeerConnection(participantId);
      
      // Add the participant to the call
      this.activeCall?.participants.push({
        id: participantId,
        name: '', // To be updated when they join
        avatar: '', // To be updated when they join
        connectionState: 'connecting',
      });
    });
    
    return this.activeCall;
  }
  
  public async joinCall(callId: string, initiatorId: string): Promise<Call | null> {
    if (this.activeCall) {
      return null; // Already in a call
    }
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const chatServiceInstance = ChatService;
    
    chatServiceInstance.sendMessage({
      content: `__CALL_JOIN_REQUEST:${callId}`,
      sender: {
        id: user.id,
        name: user.name,
        avatar: user.avatar
      },
      channelId: initiatorId
    });
    
    await this.webRTC.initialize();
    await this.webRTC.createPeerConnection(initiatorId);
    
    return null; // Will be updated when call details are received
  }
  
  public async endCall(): Promise<void> {
    if (!this.activeCall) return;
    
    this.activeCall.status = 'ended';
    this.activeCall.endTime = new Date();
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const chatServiceInstance = ChatService;
    
    this.activeCall.participants.forEach(participant => {
      if (participant.id !== user.id) {
        chatServiceInstance.sendMessage({
          content: `__CALL_END:${JSON.stringify({
            callId: this.activeCall?.id
          })}`,
          sender: {
            id: user.id,
            name: user.name,
            avatar: user.avatar
          },
          channelId: participant.id
        });
      }
    });
    
    if (this.activeCall.participants[0]?.stream) {
      this.activeCall.participants[0].stream.getTracks().forEach(track => track.stop());
    }
    
    this.webRTC.closeAllConnections();
    
    const callData = { ...this.activeCall };
    this.activeCall = null;
    
    this.notifyCallEventListeners();
    
    return;
  }
  
  public getActiveCall(): Call | null {
    return this.activeCall;
  }
  
  public onCallEvent(callback: CallEventListener): () => void {
    this.callEventListeners.push(callback);
    
    // Return unsubscribe function
    return () => {
      this.callEventListeners = this.callEventListeners.filter(cb => cb !== callback);
    };
  }
  
  public toggleMute(): boolean {
    if (!this.activeCall) return false;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const participantIndex = this.activeCall.participants.findIndex(p => p.id === user.id);
    
    if (participantIndex !== -1 && this.activeCall.participants[participantIndex].stream) {
      const participant = this.activeCall.participants[participantIndex];
      const audioTracks = participant.stream?.getAudioTracks();
      
      if (audioTracks && audioTracks.length > 0) {
        const isMuted = !audioTracks[0].enabled;
        audioTracks[0].enabled = isMuted;
        participant.isMuted = !isMuted;
        this.notifyCallEventListeners();
        return participant.isMuted;
      }
    }
    
    return false;
  }
  
  public toggleVideo(): boolean {
    if (!this.activeCall) return false;
    
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const participantIndex = this.activeCall.participants.findIndex(p => p.id === user.id);
    
    if (participantIndex !== -1 && this.activeCall.participants[participantIndex].stream) {
      const participant = this.activeCall.participants[participantIndex];
      const videoTracks = participant.stream?.getVideoTracks();
      
      if (videoTracks && videoTracks.length > 0) {
        const isVideoOff = !videoTracks[0].enabled;
        videoTracks[0].enabled = isVideoOff;
        participant.isVideoOff = !isVideoOff;
        this.notifyCallEventListeners();
        return participant.isVideoOff;
      }
    }
    
    return false;
  }
  
  private notifyCallEventListeners(): void {
    if (this.activeCall) {
      this.callEventListeners.forEach(listener => listener(this.activeCall!));
    }
  }
  
  private handleChatMessage(message: Message): void {
    if (message.content.startsWith('__CALL_INVITATION:')) {
      // Handle incoming call
      const callData = JSON.parse(message.content.replace('__CALL_INVITATION:', ''));
      // Dispatch to UI for user to accept/decline
      
    } else if (message.content.startsWith('__CALL_JOIN_REQUEST:')) {
      // Handle join request
      const callId = message.content.replace('__CALL_JOIN_REQUEST:', '');
      
      if (this.activeCall && this.activeCall.id === callId) {
        // Send call details to the participant
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        
        // Add participant to the call
        this.activeCall.participants.push({
          id: message.sender.id,
          name: message.sender.name,
          avatar: message.sender.avatar,
          connectionState: 'connecting'
        });
        
        this.notifyCallEventListeners();
      }
      
    } else if (message.content.startsWith('__CALL_END:')) {
      // Handle call end
      const callData = JSON.parse(message.content.replace('__CALL_END:', ''));
      
      if (this.activeCall && this.activeCall.id === callData.callId) {
        // Remove participant from call
        this.activeCall.participants = this.activeCall.participants.filter(p => {
          return p.id !== message.sender.id;
        });
        
        // If it was the initiator who left, mark call as ended
        if (this.activeCall.initiator.id === message.sender.id) {
          this.activeCall.status = 'ended';
          this.activeCall.endTime = new Date();
          this.notifyCallEventListeners();
          this.activeCall = null;
          return;
        }
      
        if (this.activeCall.participants.length <= 1) {
          this.endCall();
        }
        
        this.notifyCallEventListeners();
      }
    }
  }
  
  // For testing and debugging
  public getDebugInfo(): any {
    return {
      activeCall: this.activeCall,
      listenerCount: this.callEventListeners.length,
      webRTCState: this.webRTC.getState()
    };
  }
}

export default CallService.getInstance();
