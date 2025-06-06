
import React from 'react';
import { ParticipantGrid } from './ParticipantGrid';
import { EnhancedStageControls } from './EnhancedStageControls';
import { StageHeader } from './StageHeader';
import { StageConnectionStatus } from './StageConnectionStatus';
import { ParticipantVideo } from './ParticipantVideo';
import { StageParticipant } from '@/services/core/types/StageTypes';

interface StageRoomContentProps {
  state: any;
  participants: StageParticipant[];
  userRole: 'speaker' | 'audience';
  onLeave: () => void;
  onToggleAudio: () => Promise<boolean>;
  onToggleVideo: () => Promise<boolean>;
  onEndStage?: () => void;
  onRaiseHand?: () => void;
  onStartScreenShare?: () => void;
  convertToMediaDeviceInfo: (devices: any[]) => MediaDeviceInfo[];
  switchAudioDevice: (deviceId: string) => void;
  switchVideoDevice: (deviceId: string) => void;
  localStream?: MediaStream | null;
  remoteStreams?: Map<string, MediaStream>;
}

export const StageRoomContent: React.FC<StageRoomContentProps> = ({
  state,
  participants,
  userRole,
  onLeave,
  onToggleAudio,
  onToggleVideo,
  onEndStage,
  onRaiseHand,
  onStartScreenShare,
  convertToMediaDeviceInfo,
  switchAudioDevice,
  switchVideoDevice,
  localStream,
  remoteStreams = new Map()
}) => {
  const getHeaderStatus = (connectionState: string): "disconnected" | "connecting" | "connected" => {
    if (connectionState === 'reconnecting') return 'connecting';
    return connectionState as "disconnected" | "connecting" | "connected";
  };

  const speakers = participants.filter(p => ['speaker', 'moderator'].includes(p.role));
  const audience = participants.filter(p => p.role === 'audience');

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-pink-500 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none"></div>

      <StageHeader
        status={getHeaderStatus(state.connectionState)}
        participantCount={participants.length + 1}
        onLeave={onLeave}
      />
      
      <div className="flex-1 relative p-4">
        {/* Main Video Grid */}
        <div className="h-full">
          {/* Local Video (Always visible) */}
          <div className="grid gap-4 h-full">
            {/* Speakers Section */}
            {speakers.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-2/3">
                {speakers.map(participant => (
                  <ParticipantVideo
                    key={participant.id}
                    participant={participant}
                    stream={remoteStreams.get(participant.id)}
                    isActiveSpeaker={participant.isSpeaking}
                    className="aspect-video"
                  />
                ))}
              </div>
            )}

            {/* Local User Video */}
            <div className="h-1/3">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-2 h-full">
                {/* Local video tile */}
                <ParticipantVideo
                  participant={{
                    id: 'local',
                    name: 'You',
                    role: userRole,
                    isAudioEnabled: state.mediaState.audioEnabled,
                    isVideoEnabled: state.mediaState.videoEnabled,
                    isHandRaised: false,
                    isSpeaking: false
                  }}
                  stream={localStream}
                  isLocal={true}
                  className="aspect-video"
                />

                {/* Audience members */}
                {audience.map(participant => (
                  <ParticipantVideo
                    key={participant.id}
                    participant={participant}
                    stream={remoteStreams.get(participant.id)}
                    className="aspect-video"
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Empty state when no participants */}
        {participants.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white/80">
              <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mb-4 mx-auto">
                <span className="text-2xl">👋</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">Welcome to the Stage!</h3>
              <p className="text-white/60">You're the first one here. Others will join soon.</p>
            </div>
          </div>
        )}
      </div>
      
      <EnhancedStageControls
        isAudioEnabled={state.mediaState.audioEnabled}
        isVideoEnabled={state.mediaState.videoEnabled}
        userRole={userRole}
        onToggleAudio={async () => {
          await onToggleAudio();
        }}
        onToggleVideo={async () => {
          await onToggleVideo();
        }}
        onLeave={onLeave}
        onEndStage={userRole === 'speaker' ? onEndStage : undefined}
        onRaiseHand={userRole === 'audience' ? onRaiseHand : undefined}
        onStartScreenShare={userRole === 'speaker' ? onStartScreenShare : undefined}
        connectionQuality={state.networkQuality.quality}
        audioDevices={convertToMediaDeviceInfo(state.mediaState.devices.audio)}
        videoDevices={convertToMediaDeviceInfo(state.mediaState.devices.video)}
        onAudioDeviceChange={switchAudioDevice}
        onVideoDeviceChange={switchVideoDevice}
        networkStats={{
          ping: state.networkQuality.ping,
          bandwidth: state.networkQuality.bandwidth,
          participantCount: state.participantCount
        }}
      />
      
      <StageConnectionStatus
        connectionState={state.connectionState}
        networkQuality={state.networkQuality}
        participantCount={state.participantCount}
      />
    </div>
  );
};
