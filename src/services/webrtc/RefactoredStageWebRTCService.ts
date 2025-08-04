
import { PeerConnectionManager } from './PeerConnectionManager';
import { SignalingHandler } from './SignalingHandler';

class RefactoredStageWebRTCService {
  private static instance: RefactoredStageWebRTCService;
  private peerManager = new PeerConnectionManager();
  private signalingHandler = new SignalingHandler(this.peerManager);
  private isInitialized = false;

  static getInstance(): RefactoredStageWebRTCService {
    if (!RefactoredStageWebRTCService.instance) {
      RefactoredStageWebRTCService.instance = new RefactoredStageWebRTCService();
    }
    return RefactoredStageWebRTCService.instance;
  }

  async initialize(localStream: MediaStream): Promise<void> {
    if (this.isInitialized) return;

    this.peerManager.setLocalStream(localStream);
    this.signalingHandler.setupSignalingHandlers();
    this.isInitialized = true;
    
    console.log('RefactoredStageWebRTCService initialized with local stream');
  }

  private remoteStreamHandler: ((userId: string, stream: MediaStream) => void) | null = null;
  private connectionStateHandler: ((userId: string, state: RTCPeerConnectionState) => void) | null = null;

  onRemoteStream(handler: (userId: string, stream: MediaStream) => void): void {
    this.remoteStreamHandler = handler;
    this.updatePeerManagerHandlers();
  }

  onConnectionStateChange(handler: (userId: string, state: RTCPeerConnectionState) => void): void {
    this.connectionStateHandler = handler;
    this.updatePeerManagerHandlers();
  }

  private updatePeerManagerHandlers(): void {
    this.peerManager.setEventHandlers(
      this.remoteStreamHandler || (() => {}),
      this.connectionStateHandler || (() => {})
    );
  }

  async connectToExistingUsers(): Promise<void> {
    await this.signalingHandler.connectToExistingUsers();
  }

  async updateLocalStream(stream: MediaStream): Promise<void> {
    await this.peerManager.updateLocalStream(stream);
  }

  cleanup(): void {
    this.peerManager.cleanup();
    this.isInitialized = false;
    console.log('RefactoredStageWebRTCService cleaned up');
  }
}

export default RefactoredStageWebRTCService.getInstance();
