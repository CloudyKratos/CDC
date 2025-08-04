
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

      if (pc.connectionState === 'failed') {
        this.handleConnectionFailure(userId);
      } else if (pc.connectionState === 'disconnected') {
        // Give disconnected connections some time to recover
        setTimeout(() => {
          if (pc.connectionState === 'disconnected') {
            this.handleConnectionFailure(userId);
          }
        }, 5000);
      }
    };

    this.peerConnections.set(userId, { pc, userId, isOfferer });
    return pc;
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    console.log('Connection failed for user:', userId);
    
    const connection = this.peerConnections.get(userId);
    if (connection) {
      console.log('Attempting to restart connection for user:', userId);
      
      // Close the failed connection
      connection.pc.close();
      this.peerConnections.delete(userId);
      
      // Wait a bit before attempting reconnection
      setTimeout(async () => {
        try {
          if (connection.isOfferer) {
            // If we were the offerer, create a new offer
            const newPc = await this.createPeerConnection(userId, true);
            const offer = await newPc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await newPc.setLocalDescription(offer);
            
            // Signal through StageSignalingService (would need import)
            console.log('Would send reconnection offer to:', userId);
          }
        } catch (error) {
          console.error('Failed to reconnect to user:', userId, error);
        }
      }, 2000);
    }
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

  async updateLocalStream(stream: MediaStream): Promise<void> {
    this.localStream = stream;
    
    // Update all existing peer connections with new stream
    for (const [userId, { pc }] of this.peerConnections) {
      try {
        // Replace tracks instead of removing/adding to maintain connection
        const senders = pc.getSenders();
        const newTracks = stream.getTracks();
        
        // Replace existing tracks with new ones
        for (const sender of senders) {
          const newTrack = newTracks.find(track => track.kind === sender.track?.kind);
          if (newTrack && sender.track) {
            await sender.replaceTrack(newTrack);
            console.log(`Replaced ${newTrack.kind} track for user:`, userId);
          }
        }
        
        // Add any missing tracks
        for (const track of newTracks) {
          const hasTrackOfKind = senders.some(sender => sender.track?.kind === track.kind);
          if (!hasTrackOfKind) {
            pc.addTrack(track, stream);
            console.log(`Added ${track.kind} track for user:`, userId);
          }
        }
      } catch (error) {
        console.error(`Error updating stream for user ${userId}:`, error);
      }
    }
  }

  cleanup(): void {
    this.peerConnections.forEach(({ pc }) => pc.close());
    this.peerConnections.clear();
    this.localStream = null;
    console.log('PeerConnectionManager cleaned up');
  }
}
