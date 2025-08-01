
import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

export interface MediaDeviceInfo {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
}

export interface MediaConstraints {
  audio: boolean | MediaTrackConstraints;
  video: boolean | MediaTrackConstraints;
}

export class MediaDeviceManager extends BrowserEventEmitter {
  private static instance: MediaDeviceManager;
  private currentStream: MediaStream | null = null;
  private audioDevices: MediaDeviceInfo[] = [];
  private videoDevices: MediaDeviceInfo[] = [];
  private selectedAudioDevice: string | null = null;
  private selectedVideoDevice: string | null = null;
  private isAudioEnabled = false;
  private isVideoEnabled = false;

  static getInstance(): MediaDeviceManager {
    if (!MediaDeviceManager.instance) {
      MediaDeviceManager.instance = new MediaDeviceManager();
    }
    return MediaDeviceManager.instance;
  }

  async initialize(): Promise<void> {
    try {
      // Request permissions to enumerate devices
      await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      await this.updateDeviceList();
      
      // Listen for device changes
      navigator.mediaDevices.addEventListener('devicechange', () => {
        this.updateDeviceList();
      });

      console.log('MediaDeviceManager initialized');
    } catch (error) {
      console.error('Failed to initialize MediaDeviceManager:', error);
      throw error;
    }
  }

  async updateDeviceList(): Promise<void> {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      
      this.audioDevices = devices
        .filter(device => device.kind === 'audioinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Microphone ${device.deviceId.slice(0, 8)}`,
          kind: 'audioinput' as const
        }));

      this.videoDevices = devices
        .filter(device => device.kind === 'videoinput')
        .map(device => ({
          deviceId: device.deviceId,
          label: device.label || `Camera ${device.deviceId.slice(0, 8)}`,
          kind: 'videoinput' as const
        }));

      this.emit('devicesUpdated', {
        audio: this.audioDevices,
        video: this.videoDevices
      });

      console.log('Device list updated:', {
        audio: this.audioDevices.length,
        video: this.videoDevices.length
      });
    } catch (error) {
      console.error('Failed to update device list:', error);
    }
  }

  async createStream(constraints: MediaConstraints = { audio: true, video: true }): Promise<MediaStream> {
    try {
      const mediaConstraints: MediaStreamConstraints = {
        audio: constraints.audio ? {
          deviceId: this.selectedAudioDevice ? { exact: this.selectedAudioDevice } : undefined,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 48000,
          ...(typeof constraints.audio === 'object' ? constraints.audio : {})
        } : false,
        video: constraints.video ? {
          deviceId: this.selectedVideoDevice ? { exact: this.selectedVideoDevice } : undefined,
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 },
          facingMode: 'user',
          ...(typeof constraints.video === 'object' ? constraints.video : {})
        } : false
      };

      // Stop existing stream
      if (this.currentStream) {
        this.currentStream.getTracks().forEach(track => track.stop());
      }

      this.currentStream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
      
      // Set initial states
      this.isAudioEnabled = !!constraints.audio;
      this.isVideoEnabled = !!constraints.video;

      // Apply current mute states
      this.updateTrackStates();

      console.log('Media stream created successfully');
      this.emit('streamCreated', { stream: this.currentStream });

      return this.currentStream;
    } catch (error) {
      console.error('Failed to create media stream:', error);
      throw new Error(`Failed to access camera/microphone: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  toggleAudio(): boolean {
    if (!this.currentStream) return false;

    const audioTrack = this.currentStream.getAudioTracks()[0];
    if (audioTrack) {
      this.isAudioEnabled = !this.isAudioEnabled;
      audioTrack.enabled = this.isAudioEnabled;
      
      console.log(`Audio ${this.isAudioEnabled ? 'enabled' : 'disabled'}`);
      this.emit('audioToggled', { enabled: this.isAudioEnabled });
      
      return this.isAudioEnabled;
    }
    return false;
  }

  toggleVideo(): boolean {
    if (!this.currentStream) return false;

    const videoTrack = this.currentStream.getVideoTracks()[0];
    if (videoTrack) {
      this.isVideoEnabled = !this.isVideoEnabled;
      videoTrack.enabled = this.isVideoEnabled;
      
      console.log(`Video ${this.isVideoEnabled ? 'enabled' : 'disabled'}`);
      this.emit('videoToggled', { enabled: this.isVideoEnabled });
      
      return this.isVideoEnabled;
    }
    return false;
  }

  async switchAudioDevice(deviceId: string): Promise<void> {
    if (deviceId === this.selectedAudioDevice) return;

    this.selectedAudioDevice = deviceId;
    
    if (this.currentStream) {
      await this.recreateStream();
    }

    console.log('Audio device switched to:', deviceId);
    this.emit('audioDeviceSwitched', { deviceId });
  }

  async switchVideoDevice(deviceId: string): Promise<void> {
    if (deviceId === this.selectedVideoDevice) return;

    this.selectedVideoDevice = deviceId;
    
    if (this.currentStream) {
      await this.recreateStream();
    }

    console.log('Video device switched to:', deviceId);
    this.emit('videoDeviceSwitched', { deviceId });
  }

  private async recreateStream(): Promise<void> {
    if (!this.currentStream) return;

    const hasAudio = this.currentStream.getAudioTracks().length > 0;
    const hasVideo = this.currentStream.getVideoTracks().length > 0;
    const wasAudioEnabled = this.isAudioEnabled;
    const wasVideoEnabled = this.isVideoEnabled;

    await this.createStream({
      audio: hasAudio,
      video: hasVideo
    });

    // Restore previous states
    this.isAudioEnabled = wasAudioEnabled;
    this.isVideoEnabled = wasVideoEnabled;
    this.updateTrackStates();
  }

  private updateTrackStates(): void {
    if (!this.currentStream) return;

    const audioTrack = this.currentStream.getAudioTracks()[0];
    if (audioTrack) {
      audioTrack.enabled = this.isAudioEnabled;
    }

    const videoTrack = this.currentStream.getVideoTracks()[0];
    if (videoTrack) {
      videoTrack.enabled = this.isVideoEnabled;
    }
  }

  getCurrentStream(): MediaStream | null {
    return this.currentStream;
  }

  getAudioDevices(): MediaDeviceInfo[] {
    return [...this.audioDevices];
  }

  getVideoDevices(): MediaDeviceInfo[] {
    return [...this.videoDevices];
  }

  getSelectedAudioDevice(): string | null {
    return this.selectedAudioDevice;
  }

  getSelectedVideoDevice(): string | null {
    return this.selectedVideoDevice;
  }

  isAudioActive(): boolean {
    return this.isAudioEnabled;
  }

  isVideoActive(): boolean {
    return this.isVideoEnabled;
  }

  cleanup(): void {
    if (this.currentStream) {
      this.currentStream.getTracks().forEach(track => track.stop());
      this.currentStream = null;
    }

    this.isAudioEnabled = false;
    this.isVideoEnabled = false;
    this.selectedAudioDevice = null;
    this.selectedVideoDevice = null;
    
    this.removeAllListeners();
    console.log('MediaDeviceManager cleanup completed');
  }
}

export default MediaDeviceManager.getInstance();
