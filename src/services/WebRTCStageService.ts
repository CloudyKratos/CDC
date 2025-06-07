
class WebRTCStageService {
  private static instance: WebRTCStageService;
  private localStream: MediaStream | null = null;
  private eventListeners: Map<string, Function[]> = new Map();
  private isInitialized = false;

  static getInstance(): WebRTCStageService {
    if (!WebRTCStageService.instance) {
      WebRTCStageService.instance = new WebRTCStageService();
    }
    return WebRTCStageService.instance;
  }

  async initializeMedia(constraints?: MediaStreamConstraints): Promise<MediaStream> {
    try {
      const defaultConstraints: MediaStreamConstraints = {
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 },
        },
      };

      const mediaConstraints = constraints || defaultConstraints;
      console.log('Initializing media with constraints:', mediaConstraints);

      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      this.isInitialized = true;
      
      console.log('Media initialized successfully');
      this.emit('mediaInitialized', { stream: this.localStream });
      
      return this.localStream;
    } catch (error) {
      console.error('Failed to initialize media:', error);
      throw new Error(`Media access denied: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localStream) return false;

    const audioTracks = this.localStream.getAudioTracks();
    if (audioTracks.length > 0) {
      const isEnabled = !audioTracks[0].enabled;
      audioTracks.forEach(track => {
        track.enabled = isEnabled;
      });
      
      this.emit('audioToggled', { enabled: isEnabled });
      return isEnabled;
    }
    return false;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localStream) return false;

    const videoTracks = this.localStream.getVideoTracks();
    if (videoTracks.length > 0) {
      const isEnabled = !videoTracks[0].enabled;
      videoTracks.forEach(track => {
        track.enabled = isEnabled;
      });
      
      this.emit('videoToggled', { enabled: isEnabled });
      return isEnabled;
    }
    return false;
  }

  async getAvailableDevices(): Promise<{
    audio: MediaDeviceInfo[];
    video: MediaDeviceInfo[];
  }> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      return {
        audio: devices.filter(device => device.kind === 'audioinput'),
        video: devices.filter(device => device.kind === 'videoinput'),
      };
    } catch (error) {
      console.error('Failed to get available devices:', error);
      return { audio: [], video: [] };
    }
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId } },
        video: this.localStream?.getVideoTracks().length > 0,
      });

      // Replace audio track
      if (this.localStream) {
        const oldAudioTracks = this.localStream.getAudioTracks();
        oldAudioTracks.forEach(track => {
          this.localStream!.removeTrack(track);
          track.stop();
        });

        newStream.getAudioTracks().forEach(track => {
          this.localStream!.addTrack(track);
        });
      }

      this.emit('audioDeviceChanged', { deviceId });
    } catch (error) {
      console.error('Failed to switch audio device:', error);
    }
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: this.localStream?.getAudioTracks().length > 0,
        video: { deviceId: { exact: deviceId } },
      });

      // Replace video track
      if (this.localStream) {
        const oldVideoTracks = this.localStream.getVideoTracks();
        oldVideoTracks.forEach(track => {
          this.localStream!.removeTrack(track);
          track.stop();
        });

        newStream.getVideoTracks().forEach(track => {
          this.localStream!.addTrack(track);
        });
      }

      this.emit('videoDeviceChanged', { deviceId });
    } catch (error) {
      console.error('Failed to switch video device:', error);
    }
  }

  on(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.push(listener);
    this.eventListeners.set(event, listeners);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event) || [];
    const index = listeners.indexOf(listener);
    if (index > -1) {
      listeners.splice(index, 1);
      this.eventListeners.set(event, listeners);
    }
  }

  private emit(event: string, data: any): void {
    const listeners = this.eventListeners.get(event) || [];
    listeners.forEach(listener => listener(data));
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => {
        track.stop();
      });
      this.localStream = null;
    }
    
    this.isInitialized = false;
    this.eventListeners.clear();
    console.log('WebRTC service cleaned up');
  }
}

export default WebRTCStageService.getInstance();
