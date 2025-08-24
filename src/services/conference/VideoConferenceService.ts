import { BrowserEventEmitter } from '../core/BrowserEventEmitter';
import RefactoredStageWebRTCService from '../webrtc/RefactoredStageWebRTCService';
import StageSignalingService from '../stage/StageSignalingService';

export interface ConferenceParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'host' | 'presenter' | 'attendee';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  connectionState: RTCPeerConnectionState;
  networkQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  stream?: MediaStream;
  audioLevel?: number;
}

export interface WebinarParticipant extends ConferenceParticipant {}

export interface WebinarSettings {
  allowAttendeeVideo: boolean;
  allowAttendeeAudio: boolean;
  allowAttendeeScreenShare: boolean;
  allowAttendeeChat: boolean;
  isRecording: boolean;
  maxParticipants: number;
  waitingRoomEnabled: boolean;
}

export interface ConferenceStats {
  totalParticipants: number;
  activeParticipants: number;
  participantCount: number;
  duration: number;
  networkQuality: string;
  networkLatency: number;
  connectionErrors: number;
  bandwidthUsage: {
    upload: number;
    download: number;
  };
  bandwidth: {
    upload: number;
    download: number;
  };
  videoQuality: {
    resolution: string;
    frameRate: number;
    bitrate: number;
  };
  audioQuality: {
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}

class VideoConferenceService extends BrowserEventEmitter {
  private static instance: VideoConferenceService;
  private participants: Map<string, WebinarParticipant> = new Map();
  private localParticipant: WebinarParticipant | null = null;
  private localStream: MediaStream | null = null;
  private remoteStreams: Map<string, MediaStream> = new Map();
  private isInitialized = false;
  private currentRole: 'host' | 'presenter' | 'attendee' = 'attendee';
  private currentRoomId: string | null = null;
  private webinarSettings: WebinarSettings = {
    allowAttendeeVideo: true,
    allowAttendeeAudio: true,
    allowAttendeeScreenShare: true,
    allowAttendeeChat: true,
    isRecording: false,
    maxParticipants: 100,
    waitingRoomEnabled: false
  };
  private conferenceStartTime: Date | null = null;

  static getInstance(): VideoConferenceService {
    if (!VideoConferenceService.instance) {
      VideoConferenceService.instance = new VideoConferenceService();
    }
    return VideoConferenceService.instance;
  }

  async joinConference(
    roomId: string,
    userId: string,
    name: string,
    role: 'host' | 'presenter' | 'attendee' = 'presenter'
  ): Promise<boolean> {
    try {
      console.log('🎥 Joining video conference:', { roomId, userId, name, role });
      
      // Get user media
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });

      const participantInfo = {
        id: userId,
        name,
        role
      };

      // Initialize WebRTC and signaling
      await this.initializeWebinar(stream, participantInfo);
      
      // Join signaling room for this conference
      this.currentRoomId = roomId;
      await StageSignalingService.joinStage(roomId, userId, name);
      
      // Initialize WebRTC with the stream
      await RefactoredStageWebRTCService.initialize(stream);
      
      // Set up WebRTC event handlers
      this.setupWebRTCHandlers();
      
      // Connect to existing users
      await RefactoredStageWebRTCService.connectToExistingUsers();

      this.emit('localStreamReady', { stream });
      
      return true;
    } catch (error) {
      console.error('❌ Failed to join conference:', error);
      return false;
    }
  }

  private setupWebRTCHandlers(): void {
    console.log('🔗 Setting up WebRTC event handlers');
    
    // Handle remote streams from other participants
    RefactoredStageWebRTCService.onRemoteStream((userId: string, stream: MediaStream) => {
      console.log('📺 Received remote stream from:', userId);
      this.remoteStreams.set(userId, stream);
      
      // Update or add remote participant
      let participant = this.participants.get(userId);
      if (!participant) {
        participant = {
          id: userId,
          name: `User ${userId.slice(0, 8)}`,
          role: 'presenter',
          isAudioEnabled: stream.getAudioTracks().some(t => t.enabled),
          isVideoEnabled: stream.getVideoTracks().some(t => t.enabled),
          isSpeaking: false,
          isHandRaised: false,
          isScreenSharing: false,
          joinedAt: new Date(),
          connectionState: 'connected',
          networkQuality: 'good',
          stream
        };
        this.participants.set(userId, participant);
      } else {
        participant.stream = stream;
        participant.connectionState = 'connected';
      }
      
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    });

    // Handle connection state changes
    RefactoredStageWebRTCService.onConnectionStateChange((userId: string, state: RTCPeerConnectionState) => {
      console.log('📡 Connection state changed for', userId, ':', state);
      const participant = this.participants.get(userId);
      if (participant) {
        participant.connectionState = state;
        this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      }
    });
  }

  async initializeWebinar(
    localStream: MediaStream,
    participantInfo: { id: string; name: string; email?: string; role: 'host' | 'presenter' | 'attendee' }
  ): Promise<void> {
    this.localStream = localStream;
    this.currentRole = participantInfo.role;
    this.conferenceStartTime = new Date();

    this.localParticipant = {
      id: participantInfo.id,
      name: participantInfo.name,
      email: participantInfo.email,
      role: participantInfo.role,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isSpeaking: false,
      isHandRaised: false,
      isScreenSharing: false,
      joinedAt: new Date(),
      connectionState: 'connected',
      networkQuality: 'good',
      stream: localStream
    };

    this.participants.set(participantInfo.id, this.localParticipant);
    this.isInitialized = true;

    console.log('📹 Conference initialized for participant:', this.localParticipant);
    this.emit('conferenceJoined', { participant: this.localParticipant });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localParticipant) return false;
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeAudio) {
      throw new Error('Audio is disabled for attendees in this webinar');
    }
    
    console.log('🎤 Toggling audio from', this.localParticipant.isAudioEnabled, 'to', !this.localParticipant.isAudioEnabled);
    
    this.localParticipant.isAudioEnabled = !this.localParticipant.isAudioEnabled;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.localParticipant!.isAudioEnabled;
        console.log('🔊 Audio track enabled:', track.enabled);
      });
    }
    
    this.emit('localAudioToggled', this.localParticipant.isAudioEnabled);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isAudioEnabled;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localParticipant) return false;
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeVideo) {
      throw new Error('Video is disabled for attendees in this webinar');
    }
    
    console.log('📹 Toggling video from', this.localParticipant.isVideoEnabled, 'to', !this.localParticipant.isVideoEnabled);
    
    this.localParticipant.isVideoEnabled = !this.localParticipant.isVideoEnabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = this.localParticipant!.isVideoEnabled;
        console.log('🎥 Video track enabled:', track.enabled);
      });
    }
    
    this.emit('localVideoToggled', this.localParticipant.isVideoEnabled);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isVideoEnabled;
  }

  async toggleHandRaise(): Promise<boolean> {
    if (!this.localParticipant) return false;
    this.localParticipant.isHandRaised = !this.localParticipant.isHandRaised;
    this.emit('handRaiseToggled', this.localParticipant.isHandRaised);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isHandRaised;
  }

  async startScreenShare(): Promise<MediaStream> {
    if (!this.localParticipant) throw new Error('Not in conference');
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeScreenShare) {
      throw new Error('Screen sharing is disabled for attendees in this webinar');
    }

    console.log('🖥️ Starting screen share');

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: {
        echoCancellation: true,
        noiseSuppression: true
      }
    });

    // Replace local stream and update WebRTC
    this.localStream = screenStream;
    this.localParticipant.isScreenSharing = true;
    this.localParticipant.stream = screenStream;
    
    // Update WebRTC with new screen share stream
    await RefactoredStageWebRTCService.updateLocalStream(screenStream);
    
    this.emit('screenShareStarted', screenStream);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    
    // Auto-stop when user stops sharing
    screenStream.getVideoTracks()[0].onended = () => this.stopScreenShare();
    return screenStream;
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localParticipant) return;
    
    console.log('🚫 Stopping screen share');
    
    this.localParticipant.isScreenSharing = false;
    
    // Get camera stream back
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      
      this.localStream = cameraStream;
      this.localParticipant.stream = cameraStream;
      
      // Update WebRTC with camera stream
      await RefactoredStageWebRTCService.updateLocalStream(cameraStream);
      
    } catch (error) {
      console.error('Failed to restore camera stream:', error);
    }
    
    this.emit('screenShareStopped');
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async updateWebinarSettings(settings: Partial<WebinarSettings>): Promise<void> {
    if (this.currentRole !== 'host') {
      throw new Error('Only hosts can update webinar settings');
    }
    this.webinarSettings = { ...this.webinarSettings, ...settings };
    this.emit('webinarSettingsUpdated', this.webinarSettings);
  }

  async muteParticipant(participantId: string): Promise<void> {
    if (this.currentRole !== 'host' && this.currentRole !== 'presenter') {
      throw new Error('Insufficient permissions to mute participants');
    }
    const participant = this.participants.get(participantId);
    if (participant && participant.role === 'attendee') {
      participant.isAudioEnabled = false;
      this.emit('participantMuted', { participantId });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    }
  }

  async removeParticipant(participantId: string): Promise<void> {
    if (this.currentRole !== 'host') {
      throw new Error('Only hosts can remove participants');
    }
    this.participants.delete(participantId);
    this.emit('participantRemoved', { participantId });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async leaveConference(): Promise<void> {
    console.log('👋 Leaving conference');
    
    // Clean up WebRTC connections
    RefactoredStageWebRTCService.cleanup();
    
    // Leave signaling room
    if (this.currentRoomId) {
      await StageSignalingService.leaveStage(this.currentRoomId);
      this.currentRoomId = null;
    }
    
    // Stop local media tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log('🔇 Stopping track:', track.kind, track.label);
        track.stop();
      });
    }
    
    // Clear state
    this.participants.clear();
    this.remoteStreams.clear();
    this.localParticipant = null;
    this.localStream = null;
    this.isInitialized = false;
    this.conferenceStartTime = null;
    
    this.emit('conferenceLeft');
  }

  getParticipants(): WebinarParticipant[] {
    return Array.from(this.participants.values());
  }

  getLocalParticipant(): WebinarParticipant | null {
    return this.localParticipant;
  }

  getWebinarSettings(): WebinarSettings {
    return { ...this.webinarSettings };
  }

  getCurrentRole(): 'host' | 'presenter' | 'attendee' {
    return this.currentRole;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return new Map(this.remoteStreams);
  }

  getConferenceStats(): ConferenceStats {
    const duration = this.conferenceStartTime 
      ? Math.floor((Date.now() - this.conferenceStartTime.getTime()) / 1000)
      : 0;

    const connectedParticipants = Array.from(this.participants.values()).filter(p => 
      p.connectionState === 'connected'
    );

    return {
      totalParticipants: this.participants.size,
      activeParticipants: connectedParticipants.length,
      participantCount: this.participants.size,
      duration,
      networkQuality: connectedParticipants.length > 0 ? 'good' : 'unknown',
      networkLatency: Math.random() * 100 + 30, // Simulated latency
      connectionErrors: 0,
      bandwidthUsage: { 
        upload: Math.random() * 1000 + 500, 
        download: Math.random() * 2000 + 1000 
      },
      bandwidth: { 
        upload: Math.random() * 1000 + 500, 
        download: Math.random() * 2000 + 1000 
      },
      videoQuality: {
        resolution: '720p',
        frameRate: 30,
        bitrate: Math.random() * 500 + 1000
      },
      audioQuality: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 2
      }
    };
  }
}

export default VideoConferenceService.getInstance();