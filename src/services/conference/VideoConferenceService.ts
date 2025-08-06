import { BrowserEventEmitter } from '../core/BrowserEventEmitter';

export interface ConferenceParticipant {
  id: string;
  name: string;
  email?: string;
  role: 'host' | 'presenter' | 'attendee';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isSpeaking: boolean;
  isHandRaised: boolean;
  isScreenSharing: boolean;
  joinedAt: Date;
  connectionState: RTCPeerConnectionState;
  networkQuality: 'excellent' | 'good' | 'poor' | 'unknown';
  stream?: MediaStream;
  audioLevel?: number;
}

export interface WebinarParticipant extends ConferenceParticipant {}

export interface WebinarSettings {
  allowAttendeeVideo: boolean;
  allowAttendeeAudio: boolean;
  allowAttendeeScreenShare: boolean;
  allowAttendeeChat: boolean;
  isRecording: boolean;
  maxParticipants: number;
  waitingRoomEnabled: boolean;
}

export interface ConferenceStats {
  totalParticipants: number;
  activeParticipants: number;
  participantCount: number;
  duration: number;
  networkQuality: string;
  networkLatency: number;
  connectionErrors: number;
  bandwidthUsage: {
    upload: number;
    download: number;
  };
  bandwidth: {
    upload: number;
    download: number;
  };
  videoQuality: {
    resolution: string;
    frameRate: number;
    bitrate: number;
  };
  audioQuality: {
    bitrate: number;
    sampleRate: number;
    channels: number;
  };
}

class VideoConferenceService extends BrowserEventEmitter {
  private static instance: VideoConferenceService;
  private participants: Map<string, WebinarParticipant> = new Map();
  private localParticipant: WebinarParticipant | null = null;
  private localStream: MediaStream | null = null;
  private isInitialized = false;
  private currentRole: 'host' | 'presenter' | 'attendee' = 'attendee';
  private webinarSettings: WebinarSettings = {
    allowAttendeeVideo: false,
    allowAttendeeAudio: false,
    allowAttendeeScreenShare: false,
    allowAttendeeChat: true,
    isRecording: false,
    maxParticipants: 100,
    waitingRoomEnabled: false
  };
  private conferenceStartTime: Date | null = null;

  static getInstance(): VideoConferenceService {
    if (!VideoConferenceService.instance) {
      VideoConferenceService.instance = new VideoConferenceService();
    }
    return VideoConferenceService.instance;
  }

  async joinConference(
    roomId: string,
    userId: string,
    name: string
  ): Promise<boolean> {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true
      });

      const participantInfo = {
        id: userId,
        name,
        role: 'attendee' as const
      };

      await this.initializeWebinar(stream, participantInfo);
      return true;
    } catch (error) {
      console.error('Failed to join conference:', error);
      return false;
    }
  }

  async initializeWebinar(
    localStream: MediaStream,
    participantInfo: { id: string; name: string; email?: string; role: 'host' | 'presenter' | 'attendee' }
  ): Promise<void> {
    this.localStream = localStream;
    this.currentRole = participantInfo.role;
    this.conferenceStartTime = new Date();

    this.localParticipant = {
      id: participantInfo.id,
      name: participantInfo.name,
      email: participantInfo.email,
      role: participantInfo.role,
      isAudioEnabled: true,
      isVideoEnabled: true,
      isSpeaking: false,
      isHandRaised: false,
      isScreenSharing: false,
      joinedAt: new Date(),
      connectionState: 'connected',
      networkQuality: 'good'
    };

    this.participants.set(participantInfo.id, this.localParticipant);
    this.isInitialized = true;

    this.emit('conferenceJoined', { participant: this.localParticipant });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async toggleAudio(): Promise<boolean> {
    if (!this.localParticipant) return false;
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeAudio) {
      throw new Error('Audio is disabled for attendees in this webinar');
    }
    
    this.localParticipant.isAudioEnabled = !this.localParticipant.isAudioEnabled;
    if (this.localStream) {
      this.localStream.getAudioTracks().forEach(track => {
        track.enabled = this.localParticipant!.isAudioEnabled;
      });
    }
    
    this.emit('localAudioToggled', this.localParticipant.isAudioEnabled);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isAudioEnabled;
  }

  async toggleVideo(): Promise<boolean> {
    if (!this.localParticipant) return false;
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeVideo) {
      throw new Error('Video is disabled for attendees in this webinar');
    }
    
    this.localParticipant.isVideoEnabled = !this.localParticipant.isVideoEnabled;
    if (this.localStream) {
      this.localStream.getVideoTracks().forEach(track => {
        track.enabled = this.localParticipant!.isVideoEnabled;
      });
    }
    
    this.emit('localVideoToggled', this.localParticipant.isVideoEnabled);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isVideoEnabled;
  }

  async toggleHandRaise(): Promise<boolean> {
    if (!this.localParticipant) return false;
    this.localParticipant.isHandRaised = !this.localParticipant.isHandRaised;
    this.emit('handRaiseToggled', this.localParticipant.isHandRaised);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    return this.localParticipant.isHandRaised;
  }

  async startScreenShare(): Promise<MediaStream> {
    if (!this.localParticipant) throw new Error('Not in conference');
    if (this.currentRole === 'attendee' && !this.webinarSettings.allowAttendeeScreenShare) {
      throw new Error('Screen sharing is disabled for attendees in this webinar');
    }

    const screenStream = await navigator.mediaDevices.getDisplayMedia({
      video: true,
      audio: true
    });

    this.localStream = screenStream;
    this.localParticipant.isScreenSharing = true;
    this.emit('screenShareStarted', screenStream);
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    
    screenStream.getVideoTracks()[0].onended = () => this.stopScreenShare();
    return screenStream;
  }

  async stopScreenShare(): Promise<void> {
    if (!this.localParticipant) return;
    this.localParticipant.isScreenSharing = false;
    this.emit('screenShareStopped');
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async updateWebinarSettings(settings: Partial<WebinarSettings>): Promise<void> {
    if (this.currentRole !== 'host') {
      throw new Error('Only hosts can update webinar settings');
    }
    this.webinarSettings = { ...this.webinarSettings, ...settings };
    this.emit('webinarSettingsUpdated', this.webinarSettings);
  }

  async muteParticipant(participantId: string): Promise<void> {
    if (this.currentRole !== 'host' && this.currentRole !== 'presenter') {
      throw new Error('Insufficient permissions to mute participants');
    }
    const participant = this.participants.get(participantId);
    if (participant && participant.role === 'attendee') {
      participant.isAudioEnabled = false;
      this.emit('participantMuted', { participantId });
      this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
    }
  }

  async removeParticipant(participantId: string): Promise<void> {
    if (this.currentRole !== 'host') {
      throw new Error('Only hosts can remove participants');
    }
    this.participants.delete(participantId);
    this.emit('participantRemoved', { participantId });
    this.emit('participantsUpdated', { participants: Array.from(this.participants.values()) });
  }

  async leaveConference(): Promise<void> {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    this.participants.clear();
    this.localParticipant = null;
    this.isInitialized = false;
    this.conferenceStartTime = null;
    this.emit('conferenceLeft');
  }

  getParticipants(): WebinarParticipant[] {
    return Array.from(this.participants.values());
  }

  getLocalParticipant(): WebinarParticipant | null {
    return this.localParticipant;
  }

  getWebinarSettings(): WebinarSettings {
    return { ...this.webinarSettings };
  }

  getCurrentRole(): 'host' | 'presenter' | 'attendee' {
    return this.currentRole;
  }

  getConferenceStats(): ConferenceStats {
    const duration = this.conferenceStartTime 
      ? Math.floor((Date.now() - this.conferenceStartTime.getTime()) / 1000)
      : 0;

    return {
      totalParticipants: this.participants.size,
      activeParticipants: Array.from(this.participants.values()).filter(p => 
        p.connectionState === 'connected'
      ).length,
      participantCount: this.participants.size,
      duration,
      networkQuality: 'good',
      networkLatency: 50,
      connectionErrors: 0,
      bandwidthUsage: { upload: 0, download: 0 },
      bandwidth: { upload: 0, download: 0 },
      videoQuality: {
        resolution: '720p',
        frameRate: 30,
        bitrate: 1000
      },
      audioQuality: {
        bitrate: 128,
        sampleRate: 48000,
        channels: 2
      }
    };
  }
}

export default VideoConferenceService.getInstance();