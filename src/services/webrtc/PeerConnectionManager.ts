
import StageSignalingService, { SignalingMessage } from '../StageSignalingService';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  isOfferer: boolean;
}

export class PeerConnectionManager {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' }
  ];

  private onRemoteStreamHandler: ((userId: string, stream: MediaStream) => void) | null = null;
  private onConnectionStateChangeHandler: ((userId: string, state: RTCPeerConnectionState) => void) | null = null;

  setLocalStream(stream: MediaStream): void {
    this.localStream = stream;
  }

  setEventHandlers(
    onRemoteStream: (userId: string, stream: MediaStream) => void,
    onConnectionStateChange: (userId: string, state: RTCPeerConnectionState) => void
  ): void {
    this.onRemoteStreamHandler = onRemoteStream;
    this.onConnectionStateChangeHandler = onConnectionStateChange;
  }

  async createPeerConnection(userId: string, isOfferer: boolean): Promise<RTCPeerConnection> {
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

  private handleConnectionFailure(userId: string): void {
    console.log('Connection failed for user:', userId);
    // Could implement reconnection logic here
  }

  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId)?.pc;
  }

  closePeerConnection(userId: string): void {
    const connection = this.peerConnections.get(userId);
    if (connection) {
      connection.pc.close();
      this.peerConnections.delete(userId);
      console.log('Closed connection for user:', userId);
    }
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
    console.log('PeerConnectionManager cleaned up');
  }
}
