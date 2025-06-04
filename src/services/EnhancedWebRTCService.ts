
interface Participant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isMuted: boolean;
  isHandRaised: boolean;
  stream?: MediaStream;
}

class EnhancedWebRTCService {
  private static instance: EnhancedWebRTCService;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private participants: Map<string, Participant> = new Map();
  private isInitialized = false;
  
  // ICE servers configuration for production use
  private iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN servers for production
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' }
  ];

  private constructor() {}

  public static getInstance(): EnhancedWebRTCService {
    if (!EnhancedWebRTCService.instance) {
      EnhancedWebRTCService.instance = new EnhancedWebRTCService();
    }
    return EnhancedWebRTCService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      // Check if WebRTC is supported
      if (!('RTCPeerConnection' in window)) {
        throw new Error('WebRTC is not supported in this browser');
      }
      
      this.isInitialized = true;
      console.log('Enhanced WebRTC Service initialized');
    } catch (error) {
      console.error('Failed to initialize WebRTC service:', error);
      throw error;
    }
  }

  public async getLocalStream(audio: boolean = true, video: boolean = true): Promise<MediaStream> {
    try {
      if (this.localStream) {
        return this.localStream;
      }

      const constraints: MediaStreamConstraints = {
        audio: audio ? {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000
        } : false,
        video: video ? {
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(constraints);
      return this.localStream;
    } catch (error) {
      console.error('Error getting local media stream:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  public async createPeerConnection(participantId: string): Promise<RTCPeerConnection> {
    try {
      const peerConnection = new RTCPeerConnection({
        iceServers: this.iceServers,
        iceCandidatePoolSize: 10
      });

      // Handle ICE candidates
      peerConnection.addEventListener('icecandidate', (event) => {
        if (event.candidate) {
          this.sendIceCandidate(participantId, event.candidate);
        }
      });

      // Handle remote stream
      peerConnection.addEventListener('track', (event) => {
        const remoteStream = event.streams[0];
        this.handleRemoteStream(participantId, remoteStream);
      });

      // Handle connection state changes
      peerConnection.addEventListener('connectionstatechange', () => {
        console.log(`Connection state for ${participantId}:`, peerConnection.connectionState);
        this.handleConnectionStateChange(participantId, peerConnection.connectionState);
      });

      // Add local stream if available
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          peerConnection.addTrack(track, this.localStream!);
        });
      }

      this.peerConnections.set(participantId, peerConnection);
      return peerConnection;
    } catch (error) {
      console.error('Error creating peer connection:', error);
      throw error;
    }
  }

  public async createOffer(participantId: string): Promise<RTCSessionDescriptionInit> {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (!peerConnection) {
        throw new Error(`No peer connection found for ${participantId}`);
      }

      const offer = await peerConnection.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });

      await peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      throw error;
    }
  }

  public async createAnswer(participantId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (!peerConnection) {
        throw new Error(`No peer connection found for ${participantId}`);
      }

      await peerConnection.setRemoteDescription(offer);
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      
      return answer;
    } catch (error) {
      console.error('Error creating answer:', error);
      throw error;
    }
  }

  public async handleAnswer(participantId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (!peerConnection) {
        throw new Error(`No peer connection found for ${participantId}`);
      }

      await peerConnection.setRemoteDescription(answer);
    } catch (error) {
      console.error('Error handling answer:', error);
      throw error;
    }
  }

  public async handleIceCandidate(participantId: string, candidate: RTCIceCandidateInit): Promise<void> {
    try {
      const peerConnection = this.peerConnections.get(participantId);
      if (!peerConnection) {
        console.warn(`No peer connection found for ${participantId}`);
        return;
      }

      await peerConnection.addIceCandidate(candidate);
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  public toggleAudio(enabled: boolean): void {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  public toggleVideo(enabled: boolean): void {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  public async getDisplayMedia(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
    } catch (error) {
      console.error('Error getting display media:', error);
      throw new Error('Failed to start screen sharing');
    }
  }

  public closeConnection(participantId: string): void {
    const peerConnection = this.peerConnections.get(participantId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(participantId);
    }
    this.participants.delete(participantId);
  }

  public cleanup(): void {
    // Close all peer connections
    this.peerConnections.forEach((connection, participantId) => {
      connection.close();
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    this.participants.clear();
  }

  public async getConnectionStats(participantId: string): Promise<RTCStatsReport> {
    const peerConnection = this.peerConnections.get(participantId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for ${participantId}`);
    }
    return peerConnection.getStats();
  }

  // Private helper methods
  private sendIceCandidate(participantId: string, candidate: RTCIceCandidate): void {
    // In a real implementation, this would send the candidate through your signaling server
    console.log(`Sending ICE candidate to ${participantId}:`, candidate);
    // Example: this.signalingService.sendIceCandidate(participantId, candidate);
  }

  private handleRemoteStream(participantId: string, stream: MediaStream): void {
    const participant = this.participants.get(participantId);
    if (participant) {
      participant.stream = stream;
      this.participants.set(participantId, participant);
    }
    
    // Emit event for UI to handle
    this.emit('remoteStream', { participantId, stream });
  }

  private handleConnectionStateChange(participantId: string, state: RTCPeerConnectionState): void {
    console.log(`Connection state changed for ${participantId}:`, state);
    
    if (state === 'failed' || state === 'disconnected') {
      // Attempt reconnection
      this.attemptReconnection(participantId);
    }
    
    this.emit('connectionStateChange', { participantId, state });
  }

  private async attemptReconnection(participantId: string): Promise<void> {
    console.log(`Attempting reconnection for ${participantId}`);
    // Implement reconnection logic
    // This could involve creating a new peer connection and re-establishing the connection
  }

  private eventListeners: Map<string, Function[]> = new Map();

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  public on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  public off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }
}

export default EnhancedWebRTCService.getInstance();
