
import StageSignalingService, { SignalingMessage } from '../StageSignalingService';
import { PeerConnectionManager } from './PeerConnectionManager';
import { StageErrorHandler } from '../core/StageErrorHandler';
import { StageTimeoutManager } from '../core/StageTimeoutManager';

export class SignalingHandler {
  private peerManager: PeerConnectionManager;
  private errorHandler = StageErrorHandler.getInstance();
  private timeoutManager = StageTimeoutManager.getInstance();
  private isSetup = false;
  private handlerCallbacks: Map<string, Function> = new Map();

  constructor(peerManager: PeerConnectionManager) {
    this.peerManager = peerManager;
  }

  setupSignalingHandlers(): void {
    if (this.isSetup) {
      console.log('Signaling handlers already set up');
      return;
    }

    try {
      const offerHandler = this.handleOffer.bind(this);
      const answerHandler = this.handleAnswer.bind(this);
      const iceCandidateHandler = this.handleIceCandidate.bind(this);
      const userJoinedHandler = this.handleUserJoined.bind(this);
      const userLeftHandler = this.handleUserLeft.bind(this);

      StageSignalingService.onMessage('offer', offerHandler);
      StageSignalingService.onMessage('answer', answerHandler);
      StageSignalingService.onMessage('ice-candidate', iceCandidateHandler);
      StageSignalingService.onMessage('user-joined', userJoinedHandler);
      StageSignalingService.onMessage('user-left', userLeftHandler);

      // Store references for cleanup
      this.handlerCallbacks.set('offer', offerHandler);
      this.handlerCallbacks.set('answer', answerHandler);
      this.handlerCallbacks.set('ice-candidate', iceCandidateHandler);
      this.handlerCallbacks.set('user-joined', userJoinedHandler);
      this.handlerCallbacks.set('user-left', userLeftHandler);

      this.isSetup = true;
      console.log('Signaling handlers set up successfully');
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'setupSignalingHandlers' });
    }
  }

  private async handleUserJoined(message: SignalingMessage): Promise<void> {
    const { userId } = message.data;
    
    if (!this.peerManager.getPeerConnection(userId)) {
      console.log('Creating offer for new user:', userId);
      await this.createOfferForUser(userId);
    }
  }

  private async createOfferForUser(userId: string, retryCount: number = 0): Promise<void> {
    try {
      await this.timeoutManager.executeWithTimeout('webrtc-offer', async () => {
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
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'createOfferForUser', 
        userId, 
        retryCount 
      });
      
      if (retryCount < 3) {
        const delay = 1000 * Math.pow(2, retryCount); // Exponential backoff
        console.log(`Retrying offer creation for ${userId}, attempt ${retryCount + 1} in ${delay}ms`);
        setTimeout(() => this.createOfferForUser(userId, retryCount + 1), delay);
      } else {
        console.error('Maximum retries reached for offer creation to user:', userId);
      }
    }
  }

  private async handleOffer(message: SignalingMessage): Promise<void> {
    try {
      await this.timeoutManager.executeWithTimeout('webrtc-answer', async () => {
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
        } else {
          console.log('Peer connection already exists for user:', userId);
        }
      });
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'handleOffer', 
        userId: message.from 
      });
    }
  }

  private async handleAnswer(message: SignalingMessage): Promise<void> {
    try {
      const answer = message.data;
      const userId = message.from;
      
      console.log('Received answer from:', userId);
      
      const pc = this.peerManager.getPeerConnection(userId);
      if (pc && pc.signalingState !== 'stable') {
        await pc.setRemoteDescription(answer);
        console.log('Set remote description for answer from:', userId);
      } else if (!pc) {
        console.warn('No peer connection found for answer from:', userId);
      } else {
        console.warn('Peer connection not in correct state for answer from:', userId, 'State:', pc.signalingState);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'handleAnswer', 
        userId: message.from 
      });
    }
  }

  private async handleIceCandidate(message: SignalingMessage): Promise<void> {
    try {
      const candidate = message.data;
      const userId = message.from;
      
      const pc = this.peerManager.getPeerConnection(userId);
      if (pc && pc.remoteDescription) {
        await pc.addIceCandidate(candidate);
        console.log('Added ICE candidate from:', userId);
      } else if (!pc) {
        console.warn('No peer connection found for ICE candidate from:', userId);
      } else {
        console.warn('Remote description not set for ICE candidate from:', userId);
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'handleIceCandidate', 
        userId: message.from 
      });
    }
  }

  private handleUserLeft(message: SignalingMessage): void {
    try {
      const userId = message.from;
      console.log('User left:', userId);
      this.peerManager.closePeerConnection(userId);
    } catch (error) {
      this.errorHandler.handleError(error as Error, { 
        operation: 'handleUserLeft', 
        userId: message.from 
      });
    }
  }

  async connectToExistingUsers(): Promise<void> {
    try {
      const connectedUsers = StageSignalingService.getConnectedUsers();
      console.log('Connecting to existing users:', connectedUsers);
      
      for (const userId of connectedUsers) {
        if (!this.peerManager.getPeerConnection(userId)) {
          await this.createOfferForUser(userId);
          // Add delay between connections to avoid overwhelming
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }
    } catch (error) {
      this.errorHandler.handleError(error as Error, { operation: 'connectToExistingUsers' });
    }
  }

  cleanup(): void {
    try {
      console.log('Cleaning up signaling handlers');
      
      // Clear stored references (actual handler removal would need StageSignalingService API)
      this.handlerCallbacks.clear();
      this.isSetup = false;
      
      console.log('Signaling handlers cleaned up');
    } catch (error) {
      console.error('Error during signaling handler cleanup:', error);
    }
  }
}
