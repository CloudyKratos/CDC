
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

  onRemoteStream(handler: (userId: string, stream: MediaStream) => void): void {
    this.peerManager.setEventHandlers(
      handler,
      () => {} // placeholder for connection state handler
    );
  }

  onConnectionStateChange(handler: (userId: string, state: RTCPeerConnectionState) => void): void {
    this.peerManager.setEventHandlers(
      () => {}, // placeholder for remote stream handler
      handler
    );
  }

  async connectToExistingUsers(): Promise<void> {
    await this.signalingHandler.connectToExistingUsers();
  }

  updateLocalStream(stream: MediaStream): void {
    this.peerManager.updateLocalStream(stream);
  }

  cleanup(): void {
    this.peerManager.cleanup();
    this.isInitialized = false;
    console.log('RefactoredStageWebRTCService cleaned up');
  }
}

export default RefactoredStageWebRTCService.getInstance();
