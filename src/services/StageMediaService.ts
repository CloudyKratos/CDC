
interface MediaConstraints {
  audio: boolean;
  video: boolean;
  preferredAudioDeviceId?: string;
  preferredVideoDeviceId?: string;
}

interface AudioSettings {
  echoCancellation: boolean;
  noiseSuppression: boolean;
  autoGainControl: boolean;
  sampleRate: number;
}

interface VideoSettings {
  width: number;
  height: number;
  frameRate: number;
}

export class StageMediaService {
  private static instance: StageMediaService;
  private localStream: MediaStream | null = null;
  private audioDevices: MediaDeviceInfo[] = [];
  private videoDevices: MediaDeviceInfo[] = [];
  private currentAudioSettings: AudioSettings = {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
    sampleRate: 48000
  };
  private currentVideoSettings: VideoSettings = {
    width: 1280,
    height: 720,
    frameRate: 30
  };

  static getInstance(): StageMediaService {
    if (!StageMediaService.instance) {
      StageMediaService.instance = new StageMediaService();
    }
    return StageMediaService.instance;
  }

  async initializeMedia(constraints: MediaConstraints = { audio: true, video: true }): Promise<MediaStream> {
    try {
      // Request permissions and get devices
      await this.updateDeviceList();

      const mediaConstraints: MediaStreamConstraints = {
        audio: constraints.audio ? {
          echoCancellation: this.currentAudioSettings.echoCancellation,
          noiseSuppression: this.currentAudioSettings.noiseSuppression,
          autoGainControl: this.currentAudioSettings.autoGainControl,
          sampleRate: this.currentAudioSettings.sampleRate,
          deviceId: constraints.preferredAudioDeviceId || undefined
        } : false,
        video: constraints.video ? {
          width: { ideal: this.currentVideoSettings.width },
          height: { ideal: this.currentVideoSettings.height },
          frameRate: { ideal: this.currentVideoSettings.frameRate },
          deviceId: constraints.preferredVideoDeviceId || undefined
        } : false
      };

      this.localStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      console.log('Media initialized successfully:', {
        audioTracks: this.localStream.getAudioTracks().length,
        videoTracks: this.localStream.getVideoTracks().length
      });

      return this.localStream;
    } catch (error) {
      console.error('Error initializing media:', error);
      throw new Error('Failed to access camera/microphone. Please check permissions.');
    }
  }

  async updateDeviceList(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      this.audioDevices = devices.filter(device => device.kind === 'audioinput');
      this.videoDevices = devices.filter(device => device.kind === 'videoinput');
    } catch (error) {
      console.error('Error updating device list:', error);
    }
  }

  getAudioDevices(): MediaDeviceInfo[] {
    return this.audioDevices;
  }

  getVideoDevices(): MediaDeviceInfo[] {
    return this.videoDevices;
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    if (!this.localStream) return;

    try {
      const audioTracks = this.localStream.getAudioTracks();
      audioTracks.forEach(track => track.stop());

      const newAudioStream = await navigator.mediaDevices.getUserMedia({
        audio: {
          deviceId: { exact: deviceId },
          ...this.currentAudioSettings
        }
      });

      const newAudioTrack = newAudioStream.getAudioTracks()[0];
      
      // Replace audio track in the stream
      audioTracks.forEach(track => this.localStream?.removeTrack(track));
      this.localStream.addTrack(newAudioTrack);

      console.log('Audio device switched successfully');
    } catch (error) {
      console.error('Error switching audio device:', error);
    }
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    if (!this.localStream) return;

    try {
      const videoTracks = this.localStream.getVideoTracks();
      videoTracks.forEach(track => track.stop());

      const newVideoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: { exact: deviceId },
          ...this.currentVideoSettings
        }
      });

      const newVideoTrack = newVideoStream.getVideoTracks()[0];
      
      // Replace video track in the stream
      videoTracks.forEach(track => this.localStream?.removeTrack(track));
      this.localStream.addTrack(newVideoTrack);

      console.log('Video device switched successfully');
    } catch (error) {
      console.error('Error switching video device:', error);
    }
  }

  toggleAudio(enabled: boolean): void {
    if (!this.localStream) return;

    this.localStream.getAudioTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  toggleVideo(enabled: boolean): void {
    if (!this.localStream) return;

    this.localStream.getVideoTracks().forEach(track => {
      track.enabled = enabled;
    });
  }

  updateAudioSettings(settings: Partial<AudioSettings>): void {
    this.currentAudioSettings = { ...this.currentAudioSettings, ...settings };
  }

  updateVideoSettings(settings: Partial<VideoSettings>): void {
    this.currentVideoSettings = { ...this.currentVideoSettings, ...settings };
  }

  getLocalStream(): MediaStream | null {
    return this.localStream;
  }

  async getDisplayMedia(): Promise<MediaStream> {
    try {
      return await navigator.mediaDevices.getDisplayMedia({
        video: {
          width: { ideal: 1920 },
          height: { ideal: 1080 },
          frameRate: { ideal: 30 }
        },
        audio: true
      });
    } catch (error) {
      console.error('Error getting display media:', error);
      throw new Error('Failed to start screen sharing');
    }
  }

  cleanup(): void {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
  }
}

export default StageMediaService.getInstance();
