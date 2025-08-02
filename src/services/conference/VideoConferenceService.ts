
import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

export interface ConferenceParticipant {
  id: string;
  name: string;
  stream?: MediaStream;
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  connectionState: RTCPeerConnectionState;
  joinedAt: Date;
}

export interface ConferenceStats {
  participantCount: number;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkLatency: number;
}

export class VideoConferenceService extends BrowserEventEmitter {
  private static instance: VideoConferenceService;
  private participants: Map<string, ConferenceParticipant> = new Map();
  private localParticipant: ConferenceParticipant | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isConnected = false;
  private roomId: string | null = null;

  private readonly config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10
  };

  static getInstance(): VideoConferenceService {
    if (!VideoConferenceService.instance) {
      VideoConferenceService.instance = new VideoConferenceService();
    }
    return VideoConferenceService.instance;
  }

  async joinConference(roomId: string, userId: string, userName: string): Promise<boolean> {
    try {
      console.log(`Joining conference room: ${roomId} as ${userName}`);
      
      this.roomId = roomId;
      
      // Initialize local media
      await this.initializeLocalMedia();
      
      // Create local participant
      this.localParticipant = {
        id: userId,
        name: userName,
        stream: this.localStream || undefined,
        isAudioEnabled: true,
        isVideoEnabled: true,
        isSpeaking: false,
        isHandRaised: false,
        connectionState: 'connected',
        joinedAt: new Date()
      };

      this.participants.set(userId, this.localParticipant);
      this.isConnected = true;

      // Simulate joining existing participants (in real app, this would come from signaling)
      setTimeout(() => {
        this.simulateExistingParticipants();
      }, 1000);

      this.emit('conferenceJoined', { roomId, participant: this.localParticipant });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });

      return true;
    } catch (error) {
      console.error('Failed to join conference:', error);
      return false;
    }
  }

  private async initializeLocalMedia(): Promise<void> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        },
        video: {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30 }
        }
      });

      this.emit('localStreamReady', { stream: this.localStream });
    } catch (error) {
      console.error('Failed to get local media:', error);
      throw new Error('Could not access camera/microphone');
    }
  }

  private simulateExistingParticipants(): void {
    // Simulate 2-3 existing participants
    const mockParticipants = [
      { id: 'user-1', name: 'Alice Johnson' },
      { id: 'user-2', name: 'Bob Smith' },
      { id: 'user-3', name: 'Carol Davis' }
    ];

    mockParticipants.forEach((mock, index) => {
      if (mock.id !== this.localParticipant?.id) {
        setTimeout(() => {
          this.addRemoteParticipant(mock.id, mock.name);
        }, (index + 1) * 500);
      }
    });
  }

  private async addRemoteParticipant(userId: string, userName: string): Promise<void> {
    const participant: ConferenceParticipant = {
      id: userId,
      name: userName,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isSpeaking: Math.random() > 0.7, // Random speaking state
      isHandRaised: false,
      connectionState: 'connected',
      joinedAt: new Date()
    };

    this.participants.set(userId, participant);

    // Create peer connection
    await this.createPeerConnection(userId);

    this.emit('participantJoined', { participant });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });

    // Simulate receiving remote stream
    setTimeout(() => {
      this.simulateRemoteStream(userId);
    }, 1000);
  }

  private async createPeerConnection(userId: string): Promise<void> {
    const pc = new RTCPeerConnection(this.config);

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle remote stream
    pc.ontrack = (event) => {
      const remoteStream = event.streams[0];
      const participant = this.participants.get(userId);
      if (participant) {
        participant.stream = remoteStream;
        this.emit('participantStreamUpdated', { userId, stream: remoteStream });
        this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      const participant = this.participants.get(userId);
      if (participant) {
        participant.connectionState = pc.connectionState;
        this.emit('participantConnectionChanged', { userId, state: pc.connectionState });
      }
    };

    this.peerConnections.set(userId, pc);
  }

  private simulateRemoteStream(userId: string): void {
    // Create a mock remote stream for demo purposes
    // In real implementation, this would come through WebRTC
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then(stream => {
        const participant = this.participants.get(userId);
        if (participant) {
          participant.stream = stream;
          this.emit('participantStreamUpdated', { userId, stream });
          this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
        }
      })
      .catch(console.error);
  }

  toggleLocalAudio(): boolean {
    if (!this.localStream || !this.localParticipant) return false;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const enabled = !audioTracks[0].enabled;
      audioTracks.forEach(track => track.enabled = enabled);
      
      this.localParticipant.isAudioEnabled = enabled;
      this.participants.set(this.localParticipant.id, this.localParticipant);
      
      this.emit('localAudioToggled', { enabled });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      
      return enabled;
    }
    return false;
  }

  toggleLocalVideo(): boolean {
    if (!this.localStream || !this.localParticipant) return false;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const enabled = !videoTracks[0].enabled;
      videoTracks.forEach(track => track.enabled = enabled);
      
      this.localParticipant.isVideoEnabled = enabled;
      this.participants.set(this.localParticipant.id, this.localParticipant);
      
      this.emit('localVideoToggled', { enabled });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      
      return enabled;
    }
    return false;
  }

  toggleHandRaise(): boolean {
    if (!this.localParticipant) return false;

    this.localParticipant.isHandRaised = !this.localParticipant.isHandRaised;
    this.participants.set(this.localParticipant.id, this.localParticipant);
    
    this.emit('handRaiseToggled', { 
      userId: this.localParticipant.id,
      isRaised: this.localParticipant.isHandRaised 
    });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    
    return this.localParticipant.isHandRaised;
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { width: 1920, height: 1080 },
        audio: true
      });

      // Replace video track in all peer connections
      this.peerConnections.forEach(async (pc) => {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && screenStream.getVideoTracks()[0]) {
          await sender.replaceTrack(screenStream.getVideoTracks()[0]);
        }
      });

      this.emit('screenShareStarted', { stream: screenStream });
      return screenStream;
    } catch (error) {
      console.error('Failed to start screen share:', error);
      return null;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localStream) return;

    // Replace screen share track back to camera
    this.peerConnections.forEach(async (pc) => {
      const sender = pc.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender && this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }
    });

    this.emit('screenShareStopped');
  }

  getParticipants(): ConferenceParticipant[] {
    return Array.from(this.participants.values());
  }

  getLocalParticipant(): ConferenceParticipant | null {
    return this.localParticipant;
  }

  getConferenceStats(): ConferenceStats {
    const connectedCount = Array.from(this.participants.values())
      .filter(p => p.connectionState === 'connected').length;
    
    const totalCount = this.participants.size;
    const connectionRatio = connectedCount / Math.max(totalCount, 1);
    
    let audioQuality: ConferenceStats['audioQuality'] = 'excellent';
    let videoQuality: ConferenceStats['videoQuality'] = 'excellent';

    if (connectionRatio < 0.5) {
      audioQuality = videoQuality = 'poor';
    } else if (connectionRatio < 0.8) {
      audioQuality = videoQuality = 'fair';
    } else if (connectionRatio < 0.95) {
      audioQuality = videoQuality = 'good';
    }

    return {
      participantCount: totalCount,
      audioQuality,
      videoQuality,
      networkLatency: 45 // Simulated latency
    };
  }

  async leaveConference(): Promise<void> {
    console.log('Leaving conference...');

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Clear participants
    this.participants.clear();
    this.localParticipant = null;
    this.localStream = null;
    this.isConnected = false;
    this.roomId = null;

    this.emit('conferenceLeft');
    this.removeAllListeners();
  }
}

export default VideoConferenceService.getInstance();
