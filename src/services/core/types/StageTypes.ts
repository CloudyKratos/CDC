export interface StageConfig {
  stageId: string;
  userId: string;
  userRole: 'speaker' | 'audience' | 'moderator';
  enableAudio?: boolean;
  enableVideo?: boolean;
  enableSecurity?: boolean;
  enableCompliance?: boolean;
  mediaConstraints?: {
    audio: boolean;
    video: boolean;
  };
  qualitySettings?: {
    maxBitrate: number;
    adaptiveStreaming: boolean;
    lowLatencyMode: boolean;
  };
}

export interface StageState {
  isConnected: boolean;
  isConnecting: boolean;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  participantCount: number;
  mediaState: {
    audioEnabled: boolean;
    videoEnabled: boolean;
    devices: {
      audio: MediaDevice[];
      video: MediaDevice[];
    };
  };
  networkQuality: {
    quality: 'excellent' | 'good' | 'fair' | 'poor';
    ping: number;
    bandwidth: number;
  };
  errors: string[];
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: string;
  groupId?: string;
}

export interface StageParticipant {
  id: string;
  name: string;
  role: 'speaker' | 'audience' | 'moderator';
  isAudioEnabled: boolean;
  isVideoEnabled: boolean;
  isHandRaised: boolean;
  isSpeaking: boolean;
  stream?: MediaStream;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  type: 'text' | 'system' | 'emoji';
}
