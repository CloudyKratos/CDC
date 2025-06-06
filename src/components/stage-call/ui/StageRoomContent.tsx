
import React, { useState } from 'react';
import { ParticipantGrid } from './ParticipantGrid';
import { EnhancedStageControls } from './EnhancedStageControls';
import { StageHeader } from './StageHeader';
import { StageConnectionStatus } from './StageConnectionStatus';
import { StageParticipant } from '@/services/core/types/StageTypes';
import { Button } from '@/components/ui/button';
import { Users, MessageCircle, Monitor } from 'lucide-react';

interface StageRoomContentProps {
  state: any;
  participants: StageParticipant[];
  userRole: 'speaker' | 'audience' | 'moderator';
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
  connectionQuality?: 'excellent' | 'good' | 'fair' | 'poor';
  participantCount?: number;
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
  remoteStreams = new Map(),
  connectionQuality = 'fair',
  participantCount = 0
}) => {
  const [showParticipants, setShowParticipants] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);

  const getHeaderStatus = (connectionState: string): "disconnected" | "connecting" | "connected" => {
    if (connectionState === 'reconnecting') return 'connecting';
    return connectionState as "disconnected" | "connecting" | "connected";
  };

  const handleScreenShare = async () => {
    setIsScreenSharing(!isScreenSharing);
    if (onStartScreenShare) {
      await onStartScreenShare();
    }
  };

  const handlePromoteToSpeaker = (participantId: string) => {
    console.log('Promoting participant to speaker:', participantId);
    // This would typically call an API to promote the user
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

      <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-black/20 pointer-events-none"></div>

      <StageHeader
        status={getHeaderStatus(state.connectionState)}
        participantCount={participantCount}
        onLeave={onLeave}
      />
      
      {/* Quick Actions Bar */}
      <div className="px-4 py-2 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setShowParticipants(!showParticipants)}
              className="text-white/80 hover:text-white hover:bg-white/10"
            >
              <Users className="w-4 h-4 mr-2" />
              Participants ({participantCount})
            </Button>
            
            {userRole === 'moderator' && (
              <Button
                size="sm"
                variant="ghost"
                className="text-white/80 hover:text-white hover:bg-white/10"
              >
                <Monitor className="w-4 h-4 mr-2" />
                Manage Stage
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-white/60">
            <span className="capitalize">{connectionQuality} quality</span>
            <div className={`w-2 h-2 rounded-full ${
              connectionQuality === 'excellent' ? 'bg-green-400' :
              connectionQuality === 'good' ? 'bg-blue-400' :
              connectionQuality === 'fair' ? 'bg-yellow-400' : 'bg-red-400'
            }`} />
          </div>
        </div>
      </div>
      
      <div className="flex-1 relative p-4">
        <ParticipantGrid
          participants={participants}
          localStream={localStream}
          remoteStreams={remoteStreams}
          userRole={userRole}
          onPromoteToSpeaker={userRole === 'moderator' ? handlePromoteToSpeaker : undefined}
          className="h-full"
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
        onEndStage={userRole === 'moderator' ? onEndStage : undefined}
        onRaiseHand={userRole === 'audience' ? onRaiseHand : undefined}
        onStartScreenShare={userRole === 'speaker' || userRole === 'moderator' ? handleScreenShare : undefined}
        isScreenSharing={isScreenSharing}
        connectionQuality={connectionQuality}
        audioDevices={convertToMediaDeviceInfo(state.mediaState.devices.audio)}
        videoDevices={convertToMediaDeviceInfo(state.mediaState.devices.video)}
        onAudioDeviceChange={switchAudioDevice}
        onVideoDeviceChange={switchVideoDevice}
        networkStats={{
          ping: state.networkQuality?.ping || 0,
          bandwidth: state.networkQuality?.bandwidth || 0,
          participantCount: participantCount
        }}
      />
      
      <StageConnectionStatus
        connectionState={state.connectionState}
        networkQuality={state.networkQuality}
        participantCount={participantCount}
      />
    </div>
  );
};
