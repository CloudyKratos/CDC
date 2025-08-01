
import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

interface WebRTCConfig {
  iceServers: RTCIceServer[];
  maxRetries: number;
  retryDelay: number;
}

interface PeerConnectionInfo {
  connection: RTCPeerConnection;
  userId: string;
  dataChannel?: RTCDataChannel;
  remoteStream?: MediaStream;
  isInitiator: boolean;
  connectionState: RTCPeerConnectionState;
}

export class WebRTCManager extends BrowserEventEmitter {
  private static instance: WebRTCManager;
  private localStream: MediaStream | null = null;
  private peerConnections: Map<string, PeerConnectionInfo> = new Map();
  private config: WebRTCConfig;
  private isInitialized = false;

  private constructor() {
    super();
    this.config = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' }
      ],
      maxRetries: 3,
      retryDelay: 1000
    };
  }

  static getInstance(): WebRTCManager {
    if (!WebRTCManager.instance) {
      WebRTCManager.instance = new WebRTCManager();
    }
    return WebRTCManager.instance;
  }

  async initialize(localStream: MediaStream): Promise<void> {
    if (this.isInitialized) return;

    console.log('Initializing WebRTC Manager with local stream');
    this.localStream = localStream;
    this.isInitialized = true;
    this.emit('initialized');
  }

  async createPeerConnection(userId: string, isInitiator: boolean = false): Promise<RTCPeerConnection> {
    console.log(`Creating peer connection for ${userId}, initiator: ${isInitiator}`);

    if (this.peerConnections.has(userId)) {
      const existing = this.peerConnections.get(userId)!;
      if (existing.connectionState !== 'failed' && existing.connectionState !== 'closed') {
        return existing.connection;
      }
      this.closePeerConnection(userId);
    }

    const peerConnection = new RTCPeerConnection({
      iceServers: this.config.iceServers,
      iceCandidatePoolSize: 10
    });

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        console.log(`Adding ${track.kind} track to peer connection`);
        peerConnection.addTrack(track, this.localStream!);
      });
    }

    // Set up event handlers
    this.setupPeerConnectionHandlers(peerConnection, userId, isInitiator);

    // Create data channel if initiator
    let dataChannel: RTCDataChannel | undefined;
    if (isInitiator) {
      dataChannel = peerConnection.createDataChannel('messages', {
        ordered: true
      });
      this.setupDataChannelHandlers(dataChannel, userId);
    }

    const peerInfo: PeerConnectionInfo = {
      connection: peerConnection,
      userId,
      dataChannel,
      isInitiator,
      connectionState: 'new'
    };

    this.peerConnections.set(userId, peerInfo);
    return peerConnection;
  }

  private setupPeerConnectionHandlers(pc: RTCPeerConnection, userId: string, isInitiator: boolean): void {
    // ICE candidate handling
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        console.log(`Sending ICE candidate for ${userId}`);
        this.emit('iceCandidate', { userId, candidate: event.candidate });
      } else {
        console.log(`ICE gathering complete for ${userId}`);
      }
    };

    // Remote stream handling
    pc.ontrack = (event) => {
      console.log(`Received remote track from ${userId}:`, event.track.kind);
      const remoteStream = event.streams[0];
      
      const peerInfo = this.peerConnections.get(userId);
      if (peerInfo) {
        peerInfo.remoteStream = remoteStream;
        this.emit('remoteStream', { userId, stream: remoteStream });
      }
    };

    // Connection state monitoring
    pc.onconnectionstatechange = () => {
      const state = pc.connectionState;
      console.log(`Connection state changed for ${userId}: ${state}`);
      
      const peerInfo = this.peerConnections.get(userId);
      if (peerInfo) {
        peerInfo.connectionState = state;
      }

      this.emit('connectionStateChange', { userId, state });

      if (state === 'connected') {
        console.log(`Successfully connected to ${userId}`);
      } else if (state === 'failed') {
        console.log(`Connection failed to ${userId}, attempting restart`);
        this.handleConnectionFailure(userId);
      } else if (state === 'disconnected') {
        console.log(`Disconnected from ${userId}`);
      }
    };

    // ICE connection state monitoring
    pc.oniceconnectionstatechange = () => {
      console.log(`ICE connection state for ${userId}: ${pc.iceConnectionState}`);
    };

    // Data channel handling for non-initiators
    if (!isInitiator) {
      pc.ondatachannel = (event) => {
        const dataChannel = event.channel;
        const peerInfo = this.peerConnections.get(userId);
        if (peerInfo) {
          peerInfo.dataChannel = dataChannel;
        }
        this.setupDataChannelHandlers(dataChannel, userId);
      };
    }
  }

  private setupDataChannelHandlers(dataChannel: RTCDataChannel, userId: string): void {
    dataChannel.onopen = () => {
      console.log(`Data channel opened for ${userId}`);
      this.emit('dataChannelOpen', { userId });
    };

    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.emit('dataChannelMessage', { userId, message });
      } catch (error) {
        console.error('Error parsing data channel message:', error);
      }
    };

    dataChannel.onclose = () => {
      console.log(`Data channel closed for ${userId}`);
    };
  }

  async createOffer(userId: string): Promise<RTCSessionDescriptionInit> {
    console.log(`Creating offer for ${userId}`);
    const peerConnection = await this.createPeerConnection(userId, true);
    
    const offer = await peerConnection.createOffer({
      offerToReceiveAudio: true,
      offerToReceiveVideo: true
    });
    
    await peerConnection.setLocalDescription(offer);
    return offer;
  }

  async createAnswer(userId: string, offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    console.log(`Creating answer for ${userId}`);
    const peerConnection = await this.createPeerConnection(userId, false);
    
    await peerConnection.setRemoteDescription(offer);
    const answer = await peerConnection.createAnswer();
    await peerConnection.setLocalDescription(answer);
    
    return answer;
  }

  async handleAnswer(userId: string, answer: RTCSessionDescriptionInit): Promise<void> {
    const peerInfo = this.peerConnections.get(userId);
    if (!peerInfo) {
      console.error(`No peer connection found for ${userId}`);
      return;
    }

    console.log(`Handling answer from ${userId}`);
    await peerInfo.connection.setRemoteDescription(answer);
  }

  async handleIceCandidate(userId: string, candidate: RTCIceCandidateInit): Promise<void> {
    const peerInfo = this.peerConnections.get(userId);
    if (!peerInfo) {
      console.error(`No peer connection found for ${userId}`);
      return;
    }

    try {
      await peerInfo.connection.addIceCandidate(candidate);
      console.log(`Added ICE candidate for ${userId}`);
    } catch (error) {
      console.error(`Error adding ICE candidate for ${userId}:`, error);
    }
  }

  private async handleConnectionFailure(userId: string): Promise<void> {
    console.log(`Handling connection failure for ${userId}`);
    this.emit('connectionFailure', { userId });
    
    // Attempt to restart the connection
    setTimeout(() => {
      if (this.peerConnections.has(userId)) {
        this.restartConnection(userId);
      }
    }, this.config.retryDelay);
  }

  private async restartConnection(userId: string): Promise<void> {
    console.log(`Restarting connection for ${userId}`);
    this.closePeerConnection(userId);
    this.emit('restartConnection', { userId });
  }

  sendDataChannelMessage(userId: string, message: any): boolean {
    const peerInfo = this.peerConnections.get(userId);
    if (!peerInfo?.dataChannel || peerInfo.dataChannel.readyState !== 'open') {
      return false;
    }

    try {
      peerInfo.dataChannel.send(JSON.stringify(message));
      return true;
    } catch (error) {
      console.error(`Error sending data channel message to ${userId}:`, error);
      return false;
    }
  }

  broadcastDataChannelMessage(message: any): void {
    this.peerConnections.forEach((peerInfo, userId) => {
      this.sendDataChannelMessage(userId, message);
    });
  }

  updateLocalStream(newStream: MediaStream): void {
    console.log('Updating local stream for all peer connections');
    this.localStream = newStream;

    this.peerConnections.forEach((peerInfo, userId) => {
      const pc = peerInfo.connection;
      
      // Remove old tracks
      pc.getSenders().forEach(sender => {
        if (sender.track) {
          pc.removeTrack(sender);
        }
      });

      // Add new tracks
      newStream.getTracks().forEach(track => {
        pc.addTrack(track, newStream);
      });
    });

    this.emit('localStreamUpdated', { stream: newStream });
  }

  closePeerConnection(userId: string): void {
    const peerInfo = this.peerConnections.get(userId);
    if (!peerInfo) return;

    console.log(`Closing peer connection for ${userId}`);
    
    if (peerInfo.dataChannel) {
      peerInfo.dataChannel.close();
    }
    
    peerInfo.connection.close();
    this.peerConnections.delete(userId);
    
    this.emit('peerDisconnected', { userId });
  }

  getPeerConnection(userId: string): RTCPeerConnection | undefined {
    return this.peerConnections.get(userId)?.connection;
  }

  getRemoteStream(userId: string): MediaStream | undefined {
    return this.peerConnections.get(userId)?.remoteStream;
  }

  getAllRemoteStreams(): Map<string, MediaStream> {
    const streams = new Map<string, MediaStream>();
    this.peerConnections.forEach((peerInfo, userId) => {
      if (peerInfo.remoteStream) {
        streams.set(userId, peerInfo.remoteStream);
      }
    });
    return streams;
  }

  getConnectionStats(): { [userId: string]: RTCPeerConnectionState } {
    const stats: { [userId: string]: RTCPeerConnectionState } = {};
    this.peerConnections.forEach((peerInfo, userId) => {
      stats[userId] = peerInfo.connectionState;
    });
    return stats;
  }

  cleanup(): void {
    console.log('Cleaning up WebRTC Manager');
    
    this.peerConnections.forEach((_, userId) => {
      this.closePeerConnection(userId);
    });
    
    this.peerConnections.clear();
    this.localStream = null;
    this.isInitialized = false;
    this.removeAllListeners();
  }
}

export default WebRTCManager.getInstance();
