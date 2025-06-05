
export interface StageConfig {
  stageId: string;
  userId: string;
  userRole?: 'speaker' | 'audience';
  maxParticipants?: number;
  enableRecording?: boolean;
  enableSecurity?: boolean;
  enableMonitoring?: boolean;
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

export interface NetworkQuality {
  quality: 'excellent' | 'good' | 'fair' | 'poor';
  ping: number;
  bandwidth: number;
  jitter?: number;
  packetLoss?: number;
}

export interface MediaDevice {
  deviceId: string;
  label: string;
  kind: 'audioinput' | 'videoinput' | 'audiooutput';
  groupId?: string;
}

export interface MediaState {
  audioEnabled: boolean;
  videoEnabled: boolean;
  devices: {
    audio: MediaDevice[];
    video: MediaDevice[];
  };
}

export interface StageState {
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'error';
  isConnected: boolean;
  isConnecting: boolean;
  participantCount: number;
  networkQuality: NetworkQuality;
  securityLevel: 'basic' | 'enhanced' | 'military';
  performanceScore: number;
  complianceStatus: 'compliant' | 'warning' | 'violation';
  mediaState: MediaState;
  errors: string[];
}
