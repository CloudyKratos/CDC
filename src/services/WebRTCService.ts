
// WebRTCService.ts - Basic implementation of WebRTC functionality
// This is a simplified version that will need to be expanded based on specific needs

type PeerConnection = RTCPeerConnection;
type DataChannel = RTCDataChannel;

interface WebRTCOptions {
  iceServers?: RTCIceServer[];
  onMessage?: (message: any) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
}

class WebRTCService {
  private peerConnection: PeerConnection | null = null;
  private dataChannel: DataChannel | null = null;
  private remoteStream: MediaStream | null = null;
  private localStream: MediaStream | null = null;
  private options: WebRTCOptions;
  
  constructor(options: WebRTCOptions = {}) {
    this.options = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
      ],
      ...options
    };
  }
  
  // Initialize a peer connection
  public initConnection(): PeerConnection {
    if (this.peerConnection) {
      return this.peerConnection;
    }
    
    this.peerConnection = new RTCPeerConnection({
      iceServers: this.options.iceServers
    });
    
    // Set up event handlers for the peer connection
    this.setupPeerConnectionEvents();
    
    return this.peerConnection;
  }
  
  // Set up a data channel for text chat
  public createDataChannel(label: string = 'chat'): DataChannel | null {
    if (!this.peerConnection) {
      console.error('Peer connection must be initialized first');
      return null;
    }
    
    try {
      this.dataChannel = this.peerConnection.createDataChannel(label);
      this.setupDataChannelEvents();
      return this.dataChannel;
    } catch (error) {
      console.error('Error creating data channel:', error);
      return null;
    }
  }
  
  // Start a video call
  public async startVideoCall(): Promise<MediaStream | null> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({ 
        video: true, 
        audio: true 
      });
      
      if (this.peerConnection && this.localStream) {
        this.localStream.getTracks().forEach(track => {
          if (this.peerConnection && this.localStream) {
            this.peerConnection.addTrack(track, this.localStream);
          }
        });
      }
      
      return this.localStream;
    } catch (error) {
      console.error('Error accessing media devices:', error);
      return null;
    }
  }
  
  // Send a message via the data channel
  public sendMessage(message: any): boolean {
    if (!this.dataChannel || this.dataChannel.readyState !== 'open') {
      console.error('Data channel not open');
      return false;
    }
    
    try {
      // Convert to string if it's an object
      const messageStr = typeof message === 'object' ? JSON.stringify(message) : message;
      this.dataChannel.send(messageStr);
      return true;
    } catch (error) {
      console.error('Error sending message:', error);
      return false;
    }
  }
  
  // Create an offer for the peer connection
  public async createOffer(): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) {
      console.error('Peer connection must be initialized first');
      return null;
    }
    
    try {
      const offer = await this.peerConnection.createOffer();
      await this.peerConnection.setLocalDescription(offer);
      return offer;
    } catch (error) {
      console.error('Error creating offer:', error);
      return null;
    }
  }
  
  // Accept an offer and create an answer
  public async acceptOffer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit | null> {
    if (!this.peerConnection) {
      console.error('Peer connection must be initialized first');
      return null;
    }
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await this.peerConnection.createAnswer();
      await this.peerConnection.setLocalDescription(answer);
      return answer;
    } catch (error) {
      console.error('Error accepting offer:', error);
      return null;
    }
  }
  
  // Accept an answer to your offer
  public async acceptAnswer(answer: RTCSessionDescriptionInit): Promise<boolean> {
    if (!this.peerConnection) {
      console.error('Peer connection must be initialized first');
      return false;
    }
    
    try {
      await this.peerConnection.setRemoteDescription(new RTCSessionDescription(answer));
      return true;
    } catch (error) {
      console.error('Error accepting answer:', error);
      return false;
    }
  }
  
  // Add an ICE candidate
  public async addIceCandidate(candidate: RTCIceCandidateInit): Promise<boolean> {
    if (!this.peerConnection) {
      console.error('Peer connection must be initialized first');
      return false;
    }
    
    try {
      await this.peerConnection.addIceCandidate(new RTCIceCandidate(candidate));
      return true;
    } catch (error) {
      console.error('Error adding ICE candidate:', error);
      return false;
    }
  }
  
  // Close the connection
  public closeConnection(): void {
    if (this.dataChannel) {
      this.dataChannel.close();
      this.dataChannel = null;
    }
    
    if (this.peerConnection) {
      this.peerConnection.close();
      this.peerConnection = null;
    }
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.remoteStream = null;
    
    if (this.options.onDisconnect) {
      this.options.onDisconnect();
    }
  }
  
  // Private method to set up peer connection events
  private setupPeerConnectionEvents(): void {
    if (!this.peerConnection) return;
    
    this.peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        // This candidate needs to be sent to the peer through your signaling server
        console.log('New ICE candidate:', event.candidate);
      }
    };
    
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0];
      // The remote stream can now be attached to a video element
      console.log('Received remote track');
    };
    
    this.peerConnection.ondatachannel = (event) => {
      this.dataChannel = event.channel;
      this.setupDataChannelEvents();
    };
    
    this.peerConnection.onconnectionstatechange = () => {
      console.log('Connection state:', this.peerConnection?.connectionState);
      if (this.peerConnection?.connectionState === 'connected' && this.options.onConnect) {
        this.options.onConnect();
      }
    };
  }
  
  // Private method to set up data channel events
  private setupDataChannelEvents(): void {
    if (!this.dataChannel) return;
    
    this.dataChannel.onopen = () => {
      console.log('Data channel is open');
    };
    
    this.dataChannel.onclose = () => {
      console.log('Data channel is closed');
    };
    
    this.dataChannel.onmessage = (event) => {
      console.log('Received message:', event.data);
      if (this.options.onMessage) {
        try {
          // Try to parse as JSON, but fallback to raw data
          const data = JSON.parse(event.data);
          this.options.onMessage(data);
        } catch {
          this.options.onMessage(event.data);
        }
      }
    };
  }
  
  // Get the local stream
  public getLocalStream(): MediaStream | null {
    return this.localStream;
  }
  
  // Get the remote stream
  public getRemoteStream(): MediaStream | null {
    return this.remoteStream;
  }
}

export default WebRTCService;
