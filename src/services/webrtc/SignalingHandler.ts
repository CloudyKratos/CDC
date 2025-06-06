
import StageSignalingService, { SignalingMessage } from '../StageSignalingService';
import { PeerConnectionManager } from './PeerConnectionManager';

export class SignalingHandler {
  private peerManager: PeerConnectionManager;

  constructor(peerManager: PeerConnectionManager) {
    this.peerManager = peerManager;
  }

  setupSignalingHandlers(): void {
    StageSignalingService.onMessage('offer', this.handleOffer.bind(this));
    StageSignalingService.onMessage('answer', this.handleAnswer.bind(this));
    StageSignalingService.onMessage('ice-candidate', this.handleIceCandidate.bind(this));
    StageSignalingService.onMessage('user-joined', this.handleUserJoined.bind(this));
    StageSignalingService.onMessage('user-left', this.handleUserLeft.bind(this));
  }

  private async handleUserJoined(message: SignalingMessage): Promise<void> {
    const { userId } = message.data;
    
    if (!this.peerManager.getPeerConnection(userId)) {
      console.log('Creating offer for new user:', userId);
      await this.createOfferForUser(userId);
    }
  }

  private async createOfferForUser(userId: string): Promise<void> {
    try {
      const pc = await this.peerManager.createPeerConnection(userId, true);
      
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
      
      if (!this.peerManager.getPeerConnection(userId)) {
        const pc = await this.peerManager.createPeerConnection(userId, false);
        
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
      
      const pc = this.peerManager.getPeerConnection(userId);
      if (pc) {
        await pc.setRemoteDescription(answer);
      }
    } catch (error) {
      console.error('Error handling answer:', error);
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      const candidate = message.data;
      const userId = message.from;
      
      const pc = this.peerManager.getPeerConnection(userId);
      if (pc) {
        await pc.addIceCandidate(candidate);
      }
    } catch (error) {
      console.error('Error handling ICE candidate:', error);
    }
  }

  private handleUserLeft(message: SignalingMessage): void {
    const userId = message.from;
    this.peerManager.closePeerConnection(userId);
  }

  async connectToExistingUsers(): Promise<void> {
    const connectedUsers = StageSignalingService.getConnectedUsers();
    
    for (const userId of connectedUsers) {
      if (!this.peerManager.getPeerConnection(userId)) {
        await this.createOfferForUser(userId);
      }
    }
  }
}
