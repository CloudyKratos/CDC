
class WebRTCService {
  private static instance: WebRTCService;
  private peerConnections: Record<string, RTCPeerConnection> = {};
  private localStream: MediaStream | null = null;
  private trackListeners: ((userId: string, stream: MediaStream) => void)[] = [];
  private connectionStateChangeListeners: ((userId: string, state: string) => void)[] = [];
  private isInitialized = false;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): WebRTCService {
    if (!WebRTCService.instance) {
      WebRTCService.instance = new WebRTCService();
    }
    return WebRTCService.instance;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    
    try {
      this.isInitialized = true;
      console.log('WebRTC service initialized');
    } catch (error) {
      console.error('Failed to initialize WebRTC:', error);
      this.isInitialized = false;
      throw error;
    }
  }

  public async getLocalStream(withVideo: boolean = true): Promise<MediaStream> {
    if (this.localStream) {
      return this.localStream;
    }

    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: withVideo ? {
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } : false
      });
      
      return this.localStream;
    } catch (error) {
      console.error('Error getting local stream:', error);
      throw error;
    }
  }

  public async createPeerConnection(userId: string): Promise<RTCPeerConnection> {
    if (this.peerConnections[userId]) {
      return this.peerConnections[userId];
    }

    const configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
        // In a production app, you would include TURN servers here
      ]
    };

    const peerConnection = new RTCPeerConnection(configuration);
    this.peerConnections[userId] = peerConnection;

    // Add local stream tracks to the connection
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Handle incoming tracks
    peerConnection.ontrack = (event) => {
      this.trackListeners.forEach(listener => listener(userId, event.streams[0]));
    };

    // Monitor connection state changes
    peerConnection.onconnectionstatechange = () => {
      this.connectionStateChangeListeners.forEach(listener => 
        listener(userId, peerConnection.connectionState)
      );
    };

    return peerConnection;
  }

  public onTrack(callback: (userId: string, stream: MediaStream) => void): void {
    this.trackListeners.push(callback);
  }

  public onConnectionStateChange(callback: (userId: string, state: string) => void): void {
    this.connectionStateChangeListeners.push(callback);
  }

  public async handleSignalingData(userId: string, data: any): Promise<void> {
    if (!this.peerConnections[userId]) {
      await this.createPeerConnection(userId);
    }

    const peerConnection = this.peerConnections[userId];

    try {
      if (data.type === 'offer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
        const answer = await peerConnection.createAnswer();
        await peerConnection.setLocalDescription(answer);
        return answer;
      } else if (data.type === 'answer') {
        await peerConnection.setRemoteDescription(new RTCSessionDescription(data));
      } else if (data.candidate) {
        await peerConnection.addIceCandidate(new RTCIceCandidate(data));
      }
    } catch (error) {
      console.error('Error handling signaling data:', error);
      throw error;
    }
  }

  public closeConnection(userId: string): void {
    if (this.peerConnections[userId]) {
      this.peerConnections[userId].close();
      delete this.peerConnections[userId];
    }
  }

  public closeAllConnections(): void {
    Object.keys(this.peerConnections).forEach(userId => {
      this.closeConnection(userId);
    });
  }

  public getState(): any {
    return {
      isInitialized: this.isInitialized,
      hasLocalStream: !!this.localStream,
      activeConnections: Object.keys(this.peerConnections).length,
      connectionStates: Object.fromEntries(
        Object.entries(this.peerConnections).map(([userId, pc]) => [userId, pc.connectionState])
      )
    };
  }
}

export default WebRTCService.getInstance();
