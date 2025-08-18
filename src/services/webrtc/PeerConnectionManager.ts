
import StageSignalingService, { SignalingMessage } from '../StageSignalingService';
import { StageErrorHandler } from '../core/StageErrorHandler';
import { StageTimeoutManager } from '../core/StageTimeoutManager';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
  isOfferer: boolean;
}

export class PeerConnectionManager {
  private peerConnections: Map<string, PeerConnection> = new Map();
  private localStream: MediaStream | null = null;
  private errorHandler = StageErrorHandler.getInstance();
  private timeoutManager = StageTimeoutManager.getInstance();
  
  private readonly iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
    { urls: 'stun:stun3.l.google.com:19302' },
    { urls: 'stun:stun4.l.google.com:19302' }
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
    try {
      // Close existing connection if it exists
      if (this.peerConnections.has(userId)) {
        console.log('Closing existing connection for user:', userId);
        this.closePeerConnection(userId);
      }

      const pc = new RTCPeerConnection({
        iceServers: this.iceServers,
        iceCandidatePoolSize: 10,
        iceTransportPolicy: 'all',
        bundlePolicy: 'max-bundle',
        rtcpMuxPolicy: 'require'
      });

      // Add local stream tracks
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          pc.addTrack(track, this.localStream!);
          console.log(`Added ${track.kind} track for user:`, userId);
        });
      }

      // Handle ICE candidates with timeout
      pc.onicecandidate = (event) => {
        if (event.candidate) {
          this.timeoutManager.executeWithTimeout('ice-candidate', async () => {
            await StageSignalingService.sendSignalingMessage({
              type: 'ice-candidate',
              to: userId,
              data: event.candidate
            });
          }).catch(error => {
            this.errorHandler.handleError(error as Error, { 
              operation: 'sendIceCandidate', 
              userId 
            });
          });
        } else {
          console.log('ICE gathering completed for user:', userId);
        }
      };

      // Handle remote stream
      pc.ontrack = (event) => {
        console.log('Received remote track from:', userId);
        const remoteStream = event.streams[0];
        if (this.onRemoteStreamHandler && remoteStream) {
          this.onRemoteStreamHandler(userId, remoteStream);
        }
      };

      // Enhanced connection state handling
      pc.onconnectionstatechange = () => {
        const state = pc.connectionState;
        console.log(`Connection state for ${userId}:`, state);
        
        if (this.onConnectionStateChangeHandler) {
          this.onConnectionStateChangeHandler(userId, state);
        }

        switch (state) {
          case 'connected':
            console.log('Connection established with user:', userId);
            break;
          case 'failed':
            console.error('Connection failed for user:', userId);
            this.handleConnectionFailure(userId);
            break;
          case 'disconnected':
            console.warn('Connection disconnected for user:', userId);
            // Give disconnected connections time to recover
            setTimeout(() => {
              if (pc.connectionState === 'disconnected') {
                this.handleConnectionFailure(userId);
              }
            }, 10000); // Increased timeout to 10 seconds
            break;
          case 'closed':
            console.log('Connection closed for user:', userId);
            this.peerConnections.delete(userId);
            break;
        }
      };

      // Handle ICE connection state changes
      pc.oniceconnectionstatechange = () => {
        console.log(`ICE connection state for ${userId}:`, pc.iceConnectionState);
        
        if (pc.iceConnectionState === 'failed') {
          console.error('ICE connection failed for user:', userId);
          this.handleConnectionFailure(userId);
        }
      };

      // Handle signaling state changes
      pc.onsignalingstatechange = () => {
        console.log(`Signaling state for ${userId}:`, pc.signalingState);
      };

      this.peerConnections.set(userId, { pc, userId, isOfferer });
      console.log('Created peer connection for user:', userId, 'as', isOfferer ? 'offerer' : 'answerer');
      
      return pc;
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'createPeerConnection', 
        userId, 
        isOfferer 
      });
      throw error;
    }
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    try {
      console.log('Handling connection failure for user:', userId);
      
      const connection = this.peerConnections.get(userId);
      if (!connection) return;

      console.log('Attempting to restart connection for user:', userId);
      
      // Close the failed connection
      connection.pc.close();
      this.peerConnections.delete(userId);
      
      // Wait before attempting reconnection with exponential backoff
      const delay = 2000 + Math.random() * 1000; // 2-3 seconds with jitter
      setTimeout(async () => {
        try {
          if (connection.isOfferer && !this.peerConnections.has(userId)) {
            console.log('Recreating connection as offerer for user:', userId);
            // If we were the offerer, create a new offer
            const newPc = await this.createPeerConnection(userId, true);
            
            const offer = await newPc.createOffer({
              offerToReceiveAudio: true,
              offerToReceiveVideo: true
            });
            await newPc.setLocalDescription(offer);
            
            await StageSignalingService.sendSignalingMessage({
              type: 'offer',
              to: userId,
              data: offer
            });
            
            console.log('Sent reconnection offer to:', userId);
          }
        } catch (error) {
          this.errorHandler.handleError(error as Error, { 
            operation: 'handleConnectionFailure', 
            userId 
          });
        }
      }, delay);
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'handleConnectionFailure', 
        userId 
      });
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
    try {
      console.log('Starting PeerConnectionManager cleanup');
      
      // Close all connections with proper cleanup
      this.peerConnections.forEach(({ pc, userId }) => {
        try {
          console.log('Closing connection for user:', userId);
          
          // Stop all transceivers
          pc.getTransceivers().forEach(transceiver => {
            if (transceiver.stop) {
              transceiver.stop();
            }
          });
          
          pc.close();
        } catch (error) {
          console.error('Error closing connection for user:', userId, error);
        }
      });
      
      this.peerConnections.clear();
      
      // Clean up local stream
      if (this.localStream) {
        this.localStream.getTracks().forEach(track => {
          try {
            track.stop();
          } catch (error) {
            console.error('Error stopping track:', error);
          }
        });
        this.localStream = null;
      }
      
      // Clear handlers
      this.onRemoteStreamHandler = null;
      this.onConnectionStateChangeHandler = null;
      
      console.log('PeerConnectionManager cleaned up successfully');
    } catch (error) {
      console.error('Error during PeerConnectionManager cleanup:', error);
    }
  }
}
