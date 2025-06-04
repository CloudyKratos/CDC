
export interface MediaConstraints {
  audio: boolean;
  video: boolean;
}

export interface QualitySettings {
  maxBitrate: number;
  adaptiveStreaming: boolean;
  lowLatencyMode: boolean;
}

export class NextGenWebRTCService {
  private static instance: NextGenWebRTCService;
  private peerConnections: Map<string, RTCPeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isInitialized = false;

  static getInstance(): NextGenWebRTCService {
    if (!NextGenWebRTCService.instance) {
      NextGenWebRTCService.instance = new NextGenWebRTCService();
    }
    return NextGenWebRTCService.instance;
  }

  static cleanup(): void {
    const instance = NextGenWebRTCService.getInstance();
    instance.cleanup();
  }

  async initialize(constraints: MediaConstraints, qualitySettings: QualitySettings): Promise<boolean> {
    if (this.isInitialized) return true;

    try {
      console.log('Initializing NextGen WebRTC Service...');

      // Get user media
      if (constraints.audio || constraints.video) {
        this.localStream = await navigator.mediaDevices.getUserMedia({
          audio: constraints.audio,
          video: constraints.video ? {
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            frameRate: { ideal: 30 }
          } : false
        });
      }

      this.isInitialized = true;
      console.log('NextGen WebRTC Service initialized successfully');
      return true;

    } catch (error) {
      console.error('Failed to initialize NextGen WebRTC Service:', error);
      return false;
    }
  }

  async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    const configuration: RTCConfiguration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ],
      iceCandidatePoolSize: 10
    };

    const peerConnection = new RTCPeerConnection(configuration);

    // Add local stream to peer connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        if (this.localStream) {
          peerConnection.addTrack(track, this.localStream);
        }
      });
    }

    // Set up event handlers
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log('ICE candidate generated for user:', userId);
      }
    };

    peerConnection.ontrack = (event) => {
      console.log('Remote track received from user:', userId);
    };

    peerConnection.onconnectionstatechange = () => {
      console.log('Connection state changed for user:', userId, peerConnection.connectionState);
    };

    this.peerConnections.set(userId, peerConnection);
    return peerConnection;
  }

  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for user: ${userId}`);
    }

    const offer = await peerConnection.createOffer();
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(userId: string): Promise<RTCSessionDescriptionInit> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for user: ${userId}`);
    }

    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    return answer;
  }

  async setRemoteDescription(userId: string, description: RTCSessionDescriptionInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for user: ${userId}`);
    }

    await peerConnection.setRemoteDescription(description);
  }

  async addIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerConnection = this.peerConnections.get(userId);
    if (!peerConnection) {
      throw new Error(`No peer connection found for user: ${userId}`);
    }

    await peerConnection.addIceCandidate(candidate);
  }

  removePeerConnection(userId: string): void {
    const peerConnection = this.peerConnections.get(userId);
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(userId);
      console.log('Peer connection removed for user:', userId);
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTrack = this.localStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = !audioTrack.enabled;
      return audioTrack.enabled;
    }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTrack = this.localStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = !videoTrack.enabled;
      return videoTrack.enabled;
    }
    return false;
  }

  cleanup(): void {
    console.log('Cleaning up NextGen WebRTC Service...');

    // Close all peer connections
    this.peerConnections.forEach((peerConnection, userId) => {
      peerConnection.close();
      console.log('Closed peer connection for user:', userId);
    });
    this.peerConnections.clear();

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }

    this.isInitialized = false;
    console.log('NextGen WebRTC Service cleanup completed');
  }

  getConnectionStates(): Map<string, RTCPeerConnectionState> {
    const states = new Map<string, RTCPeerConnectionState>();
    this.peerConnections.forEach((peerConnection, userId) => {
      states.set(userId, peerConnection.connectionState);
    });
    return states;
  }

  getStats(userId: string): Promise<RTCStatsReport> | null {
    const peerConnection = this.peerConnections.get(userId);
    return peerConnection ? peerConnection.getStats() : null;
  }

  isHealthy(): boolean {
    return this.isInitialized && this.localStream !== null;
  }
}

export default NextGenWebRTCService.getInstance();
