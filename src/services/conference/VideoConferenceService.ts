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
  audioLevel?: number;
}

export interface ConferenceStats {
  participantCount: number;
  audioQuality: 'excellent' | 'good' | 'fair' | 'poor';
  videoQuality: 'excellent' | 'good' | 'fair' | 'poor';
  networkLatency: number;
  bandwidth: number;
}

export interface MediaDeviceSettings {
  audioDeviceId?: string;
  videoDeviceId?: string;
  audioQuality: 'low' | 'medium' | 'high';
  videoQuality: 'low' | 'medium' | 'high';
}

export class VideoConferenceService extends BrowserEventEmitter {
  private static instance: VideoConferenceService;
  private participants: Map<string, ConferenceParticipant> = new Map();
  private localParticipant: ConferenceParticipant | null = null;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private screenShareStream: MediaStream | null = null;
  private isConnected = false;
  private roomId: string | null = null;
  private mediaDeviceSettings: MediaDeviceSettings = {
    audioQuality: 'high',
    videoQuality: 'high'
  };
  private activeSpeakerDetector: any = null;
  private connectionQualityMonitor: any = null;

  private readonly config = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
      { urls: 'stun:stun2.l.google.com:19302' },
      { urls: 'stun:stun3.l.google.com:19302' },
      { urls: 'stun:stun4.l.google.com:19302' }
    ],
    iceCandidatePoolSize: 10,
    bundlePolicy: 'max-bundle' as RTCBundlePolicy,
    rtcpMuxPolicy: 'require' as RTCRtcpMuxPolicy
  };

  static getInstance(): VideoConferenceService {
    if (!VideoConferenceService.instance) {
      VideoConferenceService.instance = new VideoConferenceService();
    }
    return VideoConferenceService.instance;
  }

  async joinConference(roomId: string, userId: string, userName: string): Promise<boolean> {
    try {
      console.log(`🎥 Joining conference room: ${roomId} as ${userName}`);
      
      this.roomId = roomId;
      
      // Initialize local media with enhanced settings
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
        joinedAt: new Date(),
        audioLevel: 0
      };

      this.participants.set(userId, this.localParticipant);
      this.isConnected = true;

      // Start monitoring systems
      this.startActiveSpeakerDetection();
      this.startConnectionQualityMonitoring();

      // Simulate joining existing participants
      setTimeout(() => {
        this.simulateExistingParticipants();
      }, 1000);

      this.emit('conferenceJoined', { roomId, participant: this.localParticipant });
      this.emit('localStreamReady', { stream: this.localStream });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });

      return true;
    } catch (error) {
      console.error('❌ Failed to join conference:', error);
      this.emit('error', { type: 'join_failed', error });
      return false;
    }
  }

  private async initializeLocalMedia(): Promise<void> {
    try {
      const constraints = this.getMediaConstraints();
      console.log('🎬 Initializing media with constraints:', constraints);
      
      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Add error handling for media tracks
      this.localStream.getTracks().forEach(track => {
        track.addEventListener('ended', () => {
          console.warn(`🔇 Media track ended: ${track.kind}`);
          this.handleTrackEnded(track);
        });
      });

      console.log('✅ Local media initialized successfully');
    } catch (error) {
      console.error('❌ Failed to get local media:', error);
      
      // Try with fallback constraints
      try {
        console.log('🔄 Trying fallback media constraints...');
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: { width: 640, height: 480 }
        });
      } catch (fallbackError) {
        console.error('❌ Fallback media also failed:', fallbackError);
        throw new Error('Could not access camera/microphone');
      }
    }
  }

  private getMediaConstraints() {
    const { audioQuality, videoQuality } = this.mediaDeviceSettings;
    
    const audioConstraints = {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
      sampleRate: audioQuality === 'high' ? 48000 : 44100,
      channelCount: 1
    };

    const videoConstraints = {
      width: videoQuality === 'high' ? { ideal: 1280, max: 1920 } : 
             videoQuality === 'medium' ? { ideal: 854, max: 1280 } : 
             { ideal: 640, max: 854 },
      height: videoQuality === 'high' ? { ideal: 720, max: 1080 } : 
              videoQuality === 'medium' ? { ideal: 480, max: 720 } : 
              { ideal: 360, max: 480 },
      frameRate: { ideal: 30, max: 60 }
    };

    return { audio: audioConstraints, video: videoConstraints };
  }

  private handleTrackEnded(track: MediaStreamTrack): void {
    if (track.kind === 'video') {
      this.emit('videoTrackEnded', { trackKind: track.kind });
    } else if (track.kind === 'audio') {
      this.emit('audioTrackEnded', { trackKind: track.kind });
    }
  }

  private startActiveSpeakerDetection(): void {
    if (!this.localStream) return;

    try {
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(this.localStream);
      
      analyser.fftSize = 256;
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      
      microphone.connect(analyser);

      const detectAudio = () => {
        if (!this.isConnected) return;
        
        analyser.getByteFrequencyData(dataArray);
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        
        const isSpeaking = average > 20; // Threshold for speaking detection
        
        if (this.localParticipant && this.localParticipant.isSpeaking !== isSpeaking) {
          this.localParticipant.isSpeaking = isSpeaking;
          this.localParticipant.audioLevel = average;
          this.participants.set(this.localParticipant.id, this.localParticipant);
          
          this.emit('speakingChanged', { 
            userId: this.localParticipant.id, 
            isSpeaking,
            audioLevel: average 
          });
          this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
        }

        this.activeSpeakerDetector = requestAnimationFrame(detectAudio);
      };

      detectAudio();
    } catch (error) {
      console.warn('⚠️ Could not start audio level detection:', error);
    }
  }

  private startConnectionQualityMonitoring(): void {
    this.connectionQualityMonitor = setInterval(() => {
      this.monitorConnectionQuality();
    }, 5000);
  }

  private async monitorConnectionQuality(): Promise<void> {
    for (const [userId, pc] of this.peerConnections) {
      try {
        const stats = await pc.getStats();
        let bytesReceived = 0;
        let bytesSent = 0;
        let packetsLost = 0;
        let rtt = 0;

        stats.forEach(report => {
          if (report.type === 'inbound-rtp') {
            bytesReceived += report.bytesReceived || 0;
            packetsLost += report.packetsLost || 0;
          } else if (report.type === 'outbound-rtp') {
            bytesSent += report.bytesSent || 0;
          } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
            rtt = report.currentRoundTripTime || 0;
          }
        });

        // Update participant connection quality
        const participant = this.participants.get(userId);
        if (participant) {
          if (packetsLost > 10) {
            participant.connectionState = 'failed';
          } else if (rtt > 300) {
            participant.connectionState = 'connecting';
          } else {
            participant.connectionState = 'connected';
          }
        }
      } catch (error) {
        console.warn(`⚠️ Could not get stats for ${userId}:`, error);
      }
    }
  }

  private simulateExistingParticipants(): void {
    const mockParticipants = [
      { id: 'alice-demo', name: 'Alice Johnson' },
      { id: 'bob-demo', name: 'Bob Smith' }
    ];

    mockParticipants.forEach((mock, index) => {
      if (mock.id !== this.localParticipant?.id) {
        setTimeout(() => {
          this.addRemoteParticipant(mock.id, mock.name);
        }, (index + 1) * 800);
      }
    });
  }

  private async addRemoteParticipant(userId: string, userName: string): Promise<void> {
    const participant: ConferenceParticipant = {
      id: userId,
      name: userName,
      isAudioEnabled: true,
      isVideoEnabled: Math.random() > 0.3, // Some participants without video
      isSpeaking: false,
      isHandRaised: false,
      connectionState: 'connecting',
      joinedAt: new Date(),
      audioLevel: 0
    };

    this.participants.set(userId, participant);

    // Create peer connection
    await this.createPeerConnection(userId);

    this.emit('participantJoined', { participant });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });

    // Simulate connection establishment
    setTimeout(() => {
      participant.connectionState = 'connected';
      this.simulateRemoteStream(userId);
    }, 2000);
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
      console.log(`📹 Received remote track from ${userId}:`, event.track.kind);
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
      console.log(`🔗 Connection state changed for ${userId}: ${pc.connectionState}`);
      const participant = this.participants.get(userId);
      if (participant) {
        participant.connectionState = pc.connectionState;
        this.emit('participantConnectionChanged', { userId, state: pc.connectionState });
        this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`🧊 ICE connection state for ${userId}: ${pc.iceConnectionState}`);
      if (pc.iceConnectionState === 'failed') {
        this.handleConnectionFailure(userId);
      }
    };

    this.peerConnections.set(userId, pc);
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    console.log(`🔧 Attempting to recover connection for ${userId}`);
    
    const pc = this.peerConnections.get(userId);
    if (pc) {
      try {
        // Attempt ICE restart
        await pc.restartIce();
        console.log(`✅ ICE restart initiated for ${userId}`);
      } catch (error) {
        console.error(`❌ Failed to restart ICE for ${userId}:`, error);
        // Remove failed participant
        this.removeParticipant(userId);
      }
    }
  }

  private removeParticipant(userId: string): void {
    this.participants.delete(userId);
    const pc = this.peerConnections.get(userId);
    if (pc) {
      pc.close();
      this.peerConnections.delete(userId);
    }
    this.emit('participantLeft', { userId });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  private simulateRemoteStream(userId: string): void {
    // Create a canvas-based mock stream for demo
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple animated background
      const colors = ['#1e40af', '#7c3aed', '#dc2626', '#059669'];
      const colorIndex = Math.floor(Math.random() * colors.length);
      
      ctx.fillStyle = colors[colorIndex];
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.fillStyle = 'white';
      ctx.font = '24px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(userId.split('-')[0], canvas.width / 2, canvas.height / 2);
    }

    const stream = canvas.captureStream(30);
    
    const participant = this.participants.get(userId);
    if (participant) {
      participant.stream = stream;
      this.emit('participantStreamUpdated', { userId, stream });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    }
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
      
      console.log(`🎤 Audio ${enabled ? 'enabled' : 'disabled'}`);
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
      
      console.log(`📹 Video ${enabled ? 'enabled' : 'disabled'}`);
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
    
    console.log(`✋ Hand ${this.localParticipant.isHandRaised ? 'raised' : 'lowered'}`);
    return this.localParticipant.isHandRaised;
  }

  async startScreenShare(): Promise<MediaStream | null> {
    try {
      console.log('🖥️ Starting screen share...');
      
      this.screenShareStream = await navigator.mediaDevices.getDisplayMedia({
        video: { 
          width: 1920, 
          height: 1080,
          frameRate: { ideal: 30 }
        },
        audio: {
          echoCancellation: true,
          noiseSuppression: true
        }
      });

      // Handle screen share end
      this.screenShareStream.getVideoTracks()[0].addEventListener('ended', () => {
        console.log('🖥️ Screen share ended by user');
        this.stopScreenShare();
      });

      // Replace video track in all peer connections
      for (const [userId, pc] of this.peerConnections) {
        const sender = pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender && this.screenShareStream.getVideoTracks()[0]) {
          await sender.replaceTrack(this.screenShareStream.getVideoTracks()[0]);
        }
      }

      this.emit('screenShareStarted', { stream: this.screenShareStream });
      console.log('✅ Screen share started successfully');
      return this.screenShareStream;
    } catch (error) {
      console.error('❌ Failed to start screen share:', error);
      this.emit('error', { type: 'screen_share_failed', error });
      return null;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localStream) return;

    console.log('🛑 Stopping screen share...');

    // Stop screen share tracks
    if (this.screenShareStream) {
      this.screenShareStream.getTracks().forEach(track => track.stop());
      this.screenShareStream = null;
    }

    // Replace screen share track back to camera
    for (const [userId, pc] of this.peerConnections) {
      const sender = pc.getSenders().find(s => 
        s.track && s.track.kind === 'video'
      );
      if (sender && this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0];
        if (videoTrack) {
          await sender.replaceTrack(videoTrack);
        }
      }
    }

    this.emit('screenShareStopped');
    console.log('✅ Screen share stopped');
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
      networkLatency: Math.floor(Math.random() * 50) + 20,
      bandwidth: Math.floor(Math.random() * 500) + 100
    };
  }

  async leaveConference(): Promise<void> {
    console.log('👋 Leaving conference...');

    // Stop monitoring
    if (this.activeSpeakerDetector) {
      cancelAnimationFrame(this.activeSpeakerDetector);
    }
    if (this.connectionQualityMonitor) {
      clearInterval(this.connectionQualityMonitor);
    }

    // Stop all tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    if (this.screenShareStream) {
      this.screenShareStream.getTracks().forEach(track => track.stop());
    }

    // Close peer connections
    this.peerConnections.forEach(pc => pc.close());
    this.peerConnections.clear();

    // Clear state
    this.participants.clear();
    this.localParticipant = null;
    this.localStream = null;
    this.screenShareStream = null;
    this.isConnected = false;
    this.roomId = null;

    this.emit('conferenceLeft');
    console.log('✅ Successfully left conference');
  }

  // Device management methods
  async getAvailableDevices() {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audioInputs: devices.filter(d => d.kind === 'audioinput'),
        videoInputs: devices.filter(d => d.kind === 'videoinput'),
        audioOutputs: devices.filter(d => d.kind === 'audiooutput')
      };
    } catch (error) {
      console.error('❌ Failed to enumerate devices:', error);
      return { audioInputs: [], videoInputs: [], audioOutputs: [] };
    }
  }

  async switchAudioDevice(deviceId: string): Promise<boolean> {
    try {
      this.mediaDeviceSettings.audioDeviceId = deviceId;
      // In a real implementation, you would recreate the stream with the new device
      console.log(`🎤 Switched to audio device: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to switch audio device:', error);
      return false;
    }
  }

  async switchVideoDevice(deviceId: string): Promise<boolean> {
    try {
      this.mediaDeviceSettings.videoDeviceId = deviceId;
      // In a real implementation, you would recreate the stream with the new device
      console.log(`📹 Switched to video device: ${deviceId}`);
      return true;
    } catch (error) {
      console.error('❌ Failed to switch video device:', error);
      return false;
    }
  }
}

export default VideoConferenceService.getInstance();