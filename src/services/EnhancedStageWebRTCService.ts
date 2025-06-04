
import StageSignalingService, { SignalingMessage } from './StageSignalingService';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  isOfferer: boolean;
  remoteStream?: MediaStream;
}

interface WebRTCEventHandlers {
  onRemoteStream?: (userId: string, stream: MediaStream) => void;
  onConnectionStateChange?: (userId: string, state: RTCPeerConnectionState) => void;
  onUserDisconnected?: (userId: string) => void;
}

class EnhancedStageWebRTCService {
  private static instance: EnhancedStageWebRTCService;
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private isInitialized = false;
  private eventHandlers: WebRTCEventHandlers = {};
  
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' }
  ];

  static getInstance(): EnhancedStageWebRTCService {
    if (!EnhancedStageWebRTCService.instance) {
      EnhancedStageWebRTCService.instance = new EnhancedStageWebRTCService();
    }
    return EnhancedStageWebRTCService.instance;
  }

  async initialize(localStream: MediaStream, handlers: WebRTCEventHandlers = {}): Promise<void> {
    if (this.isInitialized) return;

    this.localStream = localStream;
    this.eventHandlers = handlers;
    this.setupSignalingHandlers();
    this.isInitialized = true;
    
    console.log('Enhanced StageWebRTCService initialized with local stream');
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
      
      // Update peer connection with remote stream
      const connection = this.peerConnections.get(userId);
      if (connection) {
        connection.remoteStream = remoteStream;
        this.peerConnections.set(userId, connection);
      }
      
      if (this.eventHandlers.onRemoteStream) {
        this.eventHandlers.onRemoteStream(userId, remoteStream);
      }
    };

    // Handle connection state changes
    pc.onconnectionstatechange = () => {
      console.log(`Connection state for ${userId}:`, pc.connectionState);
      
      if (this.eventHandlers.onConnectionStateChange) {
        this.eventHandlers.onConnectionStateChange(userId, pc.connectionState);
      }

      if (pc.connectionState === 'failed' || pc.connectionState === 'disconnected') {
        this.handleConnectionFailure(userId);
      }
    };

    // Handle ICE connection state changes
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}:`, pc.iceConnectionState);
      
      if (pc.iceConnectionState === 'failed') {
        console.log('ICE connection failed, attempting restart');
        pc.restartIce();
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
      if (connection && connection.pc.remoteDescription) {
        await connection.pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleUserLeft(message: SignalingMessage): void {
    const userId = message.from;
    this.closePeerConnection(userId);
    
    if (this.eventHandlers.onUserDisconnected) {
      this.eventHandlers.onUserDisconnected(userId);
    }
  }

  private handleConnectionFailure(userId: string): void {
    console.log('Connection failed for user:', userId);
    this.closePeerConnection(userId);
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

  getRemoteStreams(): Map<string, MediaStream> {
    const streams = new Map<string, MediaStream>();
    
    this.peerConnections.forEach((connection, userId) => {
      if (connection.remoteStream) {
        streams.set(userId, connection.remoteStream);
      }
    });
    
    return streams;
  }

  getConnectionStates(): Map<string, RTCPeerConnectionState> {
    const states = new Map<string, RTCPeerConnectionState>();
    
    this.peerConnections.forEach((connection, userId) => {
      states.set(userId, connection.pc.connectionState);
    });
    
    return states;
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
    this.eventHandlers = {};
    
    console.log('Enhanced StageWebRTCService cleaned up');
  }
}

export default EnhancedStageWebRTCService.getInstance();
