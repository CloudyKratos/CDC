
import StageSignalingService, { SignalingMessage } from './StageSignalingService';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  isOfferer: boolean;
}

class StageWebRTCService {
  private static instance: StageWebRTCService;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isInitialized = false;
  
  // Event handlers
  private onRemoteStreamHandler: ((userId: string, stream: MediaStream) => void) | null = null;
  private onConnectionStateChangeHandler: ((userId: string, state: RTCPeerConnectionState) => void) | null = null;

  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  static getInstance(): StageWebRTCService {
    if (!StageWebRTCService.instance) {
      StageWebRTCService.instance = new StageWebRTCService();
    }
    return StageWebRTCService.instance;
  }

  async initialize(localStream: MediaStream): Promise<void> {
    if (this.isInitialized) return;

    this.localStream = localStream;
    this.setupSignalingHandlers();
    this.isInitialized = true;
    
    console.log('StageWebRTCService initialized with local stream');
  }

  private setupSignalingHandlers(): void {
    StageSignalingService.onMessage('offer', this.handleOffer.bind(this));
    StageSignalingService.onMessage('answer', this.handleAnswer.bind(this));
    StageSignalingService.onMessage('ice-candidate', this.handleIceCandidate.bind(this));
    StageSignalingService.onMessage('user-joined', this.handleUserJoined.bind(this));
    StageSignalingService.onMessage('user-left', this.handleUserLeft.bind(this));
  }

  private async createPeerConnection(userId: string, isOfferer: boolean): Promise<RTCPeerConnection> {
    const pc = new RTCPeerConnection({
      iceServers: this.iceServers,
      iceCandidatePoolSize: 10
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        pc.addTrack(track, this.localStream!);
      });
    }

    // Handle ICE candidates
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        StageSignalingService.sendSignalingMessage({
          type: 'ice-candidate',
          to: userId,
          data: event.candidate
        });
      }
    };

    // Handle remote stream
    pc.ontrack = (event) => {
      console.log('Received remote track from:', userId);
      const remoteStream = event.streams[0];
      if (this.onRemoteStreamHandler) {
        this.onRemoteStreamHandler(userId, remoteStream);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, pc.connectionState);
      if (this.onConnectionStateChangeHandler) {
        this.onConnectionStateChangeHandler(userId, pc.connectionState);
      }

      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.handleConnectionFailure(userId);
      }
    };

    this.peerConnections.set(userId, { pc, userId, isOfferer });
    return pc;
  }

  private async handleUserJoined(message: SignalingMessage): Promise<void> {
    const { userId } = message.data;
    
    if (!this.peerConnections.has(userId)) {
      console.log('Creating offer for new user:', userId);
      await this.createOfferForUser(userId);
    }
  }

  private async createOfferForUser(userId: string): Promise<void> {
    try {
      const pc = await this.createPeerConnection(userId, true);
      
      const offer = await pc.createOffer({
        offerToReceiveAudio: true,
        offerToReceiveVideo: true
      });
      
      await pc.setLocalDescription(offer);
      
      await StageSignalingService.sendSignalingMessage({
        type: 'offer',
        to: userId,
        data: offer
      });
      
      console.log('Sent offer to:', userId);
    } catch (error) {
      console.error('Error creating offer for user:', userId, error);
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    try {
      const offer = message.data;
      const userId = message.from;
      
      console.log('Received offer from:', userId);
      
      if (!this.peerConnections.has(userId)) {
        const pc = await this.createPeerConnection(userId, false);
        
        await pc.setRemoteDescription(offer);
        
        const answer = await pc.createAnswer();
        await pc.setLocalDescription(answer);
        
        await StageSignalingService.sendSignalingMessage({
          type: 'answer',
          to: userId,
          data: answer
        });
        
        console.log('Sent answer to:', userId);
      }
    } catch (error) {
      console.error('Error handling offer:', error);
    }
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    try {
      const answer = message.data;
      const userId = message.from;
      
      console.log('Received answer from:', userId);
      
      const connection = this.peerConnections.get(userId);
      if (connection) {
        await connection.pc.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      const candidate = message.data;
      const userId = message.from;
      
      const connection = this.peerConnections.get(userId);
      if (connection) {
        await connection.pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleUserLeft(message: SignalingMessage): void {
    const userId = message.from;
    this.closePeerConnection(userId);
  }

  private handleConnectionFailure(userId: string): void {
    console.log('Connection failed for user:', userId);
    // Could implement reconnection logic here
  }

  private closePeerConnection(userId: string): void {
    const connection = this.peerConnections.get(userId);
    if (connection) {
      connection.pc.close();
      this.peerConnections.delete(userId);
      console.log('Closed connection for user:', userId);
    }
  }

  async connectToExistingUsers(): Promise<void> {
    const connectedUsers = StageSignalingService.getConnectedUsers();
    
    for (const userId of connectedUsers) {
      if (!this.peerConnections.has(userId)) {
        await this.createOfferForUser(userId);
      }
    }
  }

  onRemoteStream(handler: (userId: string, stream: MediaStream) => void): void {
    this.onRemoteStreamHandler = handler;
  }

  onConnectionStateChange(handler: (userId: string, state: RTCPeerConnectionState) => void): void {
    this.onConnectionStateChangeHandler = handler;
  }

  updateLocalStream(stream: MediaStream): void {
    this.localStream = stream;
    
    // Update all existing peer connections with new stream
    this.peerConnections.forEach(({ pc }) => {
      // Remove old tracks
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });
      
      // Add new tracks
      stream.getTracks().forEach(track => {
        pc.addTrack(track, stream);
      });
    });
  }

  cleanup(): void {
    this.peerConnections.forEach(({ pc }) => pc.close());
    this.peerConnections.clear();
    this.localStream = null;
    this.isInitialized = false;
    
    console.log('StageWebRTCService cleaned up');
  }
}

export default StageWebRTCService.getInstance();
