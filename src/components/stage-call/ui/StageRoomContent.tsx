
import React from 'react';
import { ParticipantGrid } from './ParticipantGrid';
import { EnhancedStageControls } from './EnhancedStageControls';
import { StageHeader } from './StageHeader';
import { StageConnectionStatus } from './StageConnectionStatus';

interface StageRoomContentProps {
  state: any;
  participants: any[];
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
  switchVideoDevice
}) => {
  // Map connection state to expected values
  const getHeaderStatus = (connectionState: string): "disconnected" | "connecting" | "connected" => {
    if (connectionState === 'reconnecting') return 'connecting';
    return connectionState as "disconnected" | "connecting" | "connected";
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Enhanced animated background */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-pink-500 rounded-full blur-xl animate-pulse delay-2000"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 bg-cyan-500 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      {/* Gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none"></div>

      <StageHeader
        status={getHeaderStatus(state.connectionState)}
        participantCount={state.participantCount + 1} // +1 for local user
        onLeave={onLeave}
      />
      
      <div className="flex-1 relative">
        <ParticipantGrid
          participants={participants}
          localStream={null} // Will be handled by orchestrator
          userRole={userRole}
          isVideoEnabled={state.mediaState.videoEnabled}
          isAudioEnabled={state.mediaState.audioEnabled}
        />
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
