
import RefactoredStageWebRTCService from './webrtc/RefactoredStageWebRTCService';

interface MediaConstraints {
  audio?: boolean | MediaTrackConstraints;
  video?: boolean | MediaTrackConstraints;
}

interface WebRTCEventHandlers {
  onRemoteStream?: (userId: string, stream: MediaStream) => void;
  onConnectionStateChange?: (userId: string, state: RTCPeerConnectionState) => void;
  onUserDisconnected?: (userId: string) => void;
  remoteStream?: (userId: string, stream: MediaStream) => void;
}

class WebRTCStageService {
  private static instance: WebRTCStageService;
  private localStream: MediaStream | null = null;
  private remoteStreams = new Map<string, MediaStream>();
  private eventHandlers: WebRTCEventHandlers = {};
  private isScreenSharing = false;
  private screenShareStream: MediaStream | null = null;

  static getInstance(): WebRTCStageService {
    if (!WebRTCStageService.instance) {
      WebRTCStageService.instance = new WebRTCStageService();
    }
    return WebRTCStageService.instance;
  }

  async initializeMedia(constraints: MediaConstraints = { audio: true, video: true }): Promise<MediaStream> {
    try {
      console.log('Initializing media with constraints:', constraints);
      
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      this.localStream = stream;
      
      // Initialize the refactored WebRTC service
      await RefactoredStageWebRTCService.initialize(stream);
      
      // Set up event handlers
      RefactoredStageWebRTCService.onRemoteStream((userId, remoteStream) => {
        this.remoteStreams.set(userId, remoteStream);
        this.eventHandlers.onRemoteStream?.(userId, remoteStream);
        this.eventHandlers.remoteStream?.(userId, remoteStream);
      });

      RefactoredStageWebRTCService.onConnectionStateChange((userId, state) => {
        if (state === 'disconnected' || state === 'failed') {
          this.remoteStreams.delete(userId);
          this.eventHandlers.onUserDisconnected?.(userId);
        }
        this.eventHandlers.onConnectionStateChange?.(userId, state);
      });

      console.log('Media initialized successfully');
      return stream;
    } catch (error) {
      console.error('Failed to initialize media:', error);
      throw new Error('Failed to access camera/microphone. Please check your permissions.');
    }
  }

  async connectToExistingUsers(): Promise<void> {
    await RefactoredStageWebRTCService.connectToExistingUsers();
  }

  async toggleAudio(enabled: boolean): Promise<void> {
    if (this.localStream) {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async toggleVideo(enabled: boolean): Promise<void> {
    if (this.localStream) {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => {
        track.enabled = enabled;
      });
    }
  }

  async startScreenShare(): Promise<MediaStream> {
    try {
      if (this.isScreenSharing) {
        throw new Error('Screen sharing is already active');
      }

      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      this.screenShareStream = screenStream;
      this.isScreenSharing = true;

      // Update the local stream for WebRTC
      RefactoredStageWebRTCService.updateLocalStream(screenStream);

      // Listen for screen share end
      screenStream.getVideoTracks()[0].onended = () => {
        this.stopScreenShare();
      };

      return screenStream;
    } catch (error) {
      console.error('Failed to start screen sharing:', error);
      throw error;
    }
  }

  async stopScreenShare(): Promise<void> {
    if (this.screenShareStream) {
      this.screenShareStream.getTracks().forEach(track => track.stop());
      this.screenShareStream = null;
    }
    
    this.isScreenSharing = false;
    
    // Revert to original stream
    if (this.localStream) {
      RefactoredStageWebRTCService.updateLocalStream(this.localStream);
    }
  }

  on(event: keyof WebRTCEventHandlers, handler: any): void {
    this.eventHandlers[event] = handler;
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  getRemoteStreams(): Map<string, MediaStream> {
    return this.remoteStreams;
  }

  getIsScreenSharing(): boolean {
    return this.isScreenSharing;
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }

    if (this.screenShareStream) {
      this.screenShareStream.getTracks().forEach(track => track.stop());
      this.screenShareStream = null;
    }

    this.remoteStreams.clear();
    this.isScreenSharing = false;
    RefactoredStageWebRTCService.cleanup();
  }
}

export default WebRTCStageService.getInstance();
