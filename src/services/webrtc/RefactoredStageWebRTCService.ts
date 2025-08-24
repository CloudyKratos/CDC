
import { PeerConnectionManager } from './PeerConnectionManager';
import { SignalingHandler } from './SignalingHandler';
import StageSignalingService from '../stage/StageSignalingService';

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

    console.log('🚀 Initializing RefactoredStageWebRTCService with local stream');
    
    this.peerManager.setLocalStream(localStream);
    this.signalingHandler.setupSignalingHandlers();
    this.isInitialized = true;
    
    console.log('✅ RefactoredStageWebRTCService initialized successfully');
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
    console.log('🧹 Cleaning up RefactoredStageWebRTCService');
    this.peerManager.cleanup();
    this.remoteStreamHandler = null;
    this.connectionStateHandler = null;
    this.isInitialized = false;
    console.log('✅ RefactoredStageWebRTCService cleaned up successfully');
  }
}

export default RefactoredStageWebRTCService.getInstance();
