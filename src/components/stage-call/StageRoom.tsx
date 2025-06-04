
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { ParticipantGrid } from './ui/ParticipantGrid';
import { EnhancedStageControls } from './ui/EnhancedStageControls';
import { ConnectionError } from './ui/ConnectionError';
import { StageHeader } from './ui/StageHeader';
import { toast } from 'sonner';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'speaker' | 'audience'>('audience');
  const [participants, setParticipants] = useState<any[]>([]);
  
  const {
    state,
    isInitialized,
    initializeStage,
    leaveStage,
    toggleAudio,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice
  } = useStageOrchestrator();

  useEffect(() => {
    const initializeStageRoom = async () => {
      if (!user) return;

      try {
        console.log('Initializing stage room for user:', user.id);
        
        const result = await initializeStage({
          stageId,
          userId: user.id,
          userRole: 'audience', // Default role
          mediaConstraints: {
            audio: true,
            video: true
          },
          qualitySettings: {
            maxBitrate: 2500000, // 2.5 Mbps
            adaptiveStreaming: true,
            lowLatencyMode: true
          }
        });

        if (!result.success) {
          toast.error(`Failed to join stage: ${result.error}`);
        } else {
          toast.success('Successfully joined the stage!');
        }
      } catch (error) {
        console.error('Failed to initialize stage room:', error);
        toast.error('Failed to connect to stage');
      }
    };

    initializeStageRoom();

    return () => {
      handleLeave();
    };
  }, [stageId, user]);

  const handleLeave = async () => {
    try {
      await leaveStage();
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      onLeave(); // Leave anyway
    }
  };

  const handleToggleAudio = async () => {
    const newState = await toggleAudio();
    toast.success(newState ? 'Microphone unmuted' : 'Microphone muted');
  };

  const handleToggleVideo = async () => {
    const newState = await toggleVideo();
    toast.success(newState ? 'Camera enabled' : 'Camera disabled');
  };

  const handleRaiseHand = () => {
    toast.info('Hand raised! Waiting for moderator approval...');
  };

  const handleStartScreenShare = () => {
    toast.info('Screen sharing feature coming soon!');
  };

  const handleEndStage = async () => {
    toast.success('Stage ended successfully');
    await handleLeave();
  };

  // Convert MediaDevice to MediaDeviceInfo format
  const convertToMediaDeviceInfo = (devices: any[]): MediaDeviceInfo[] => {
    return devices.map(device => ({
      deviceId: device.deviceId,
      label: device.label,
      kind: device.kind,
      groupId: device.groupId || '',
      toJSON: () => ({
        deviceId: device.deviceId,
        label: device.label,
        kind: device.kind,
        groupId: device.groupId || ''
      })
    }));
  };

  // Map connection state to expected values
  const getHeaderStatus = (connectionState: string): "disconnected" | "connecting" | "connected" => {
    if (connectionState === 'reconnecting') return 'connecting';
    return connectionState as "disconnected" | "connecting" | "connected";
  };

  // Loading state
  if (state.connectionState === 'connecting') {
    return (
      <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900">
        <StageHeader
          status="connecting"
          participantCount={0}
          onLeave={onLeave}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-white mx-auto"></div>
            <p className="text-white text-xl font-semibold">Connecting to stage...</p>
            <p className="text-white/70 text-sm">Setting up secure connection with enterprise-grade encryption</p>
            <div className="space-y-2 text-sm text-white/60">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Initializing media services</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <span>Establishing WebRTC connections</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                <span>Optimizing network quality</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (state.connectionState === 'error') {
    return (
      <ConnectionError
        error={state.errors.join(', ') || 'Connection failed'}
        onRetry={() => initializeStage({
          stageId,
          userId: user?.id || '',
          userRole: 'audience'
        })}
        onLeave={onLeave}
      />
    );
  }

  // Connected state
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-purple-500 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-1/4 left-1/2 w-20 h-20 bg-pink-500 rounded-full blur-xl animate-pulse delay-2000"></div>
      </div>

      <StageHeader
        status={getHeaderStatus(state.connectionState)}
        participantCount={state.participantCount + 1} // +1 for local user
        onLeave={handleLeave}
      />
      
      <ParticipantGrid
        participants={participants}
        localStream={null} // Will be handled by orchestrator
        userRole={userRole}
        isVideoEnabled={state.mediaState.videoEnabled}
        isAudioEnabled={state.mediaState.audioEnabled}
      />
      
      <EnhancedStageControls
        isAudioEnabled={state.mediaState.audioEnabled}
        isVideoEnabled={state.mediaState.videoEnabled}
        userRole={userRole}
        onToggleAudio={handleToggleAudio}
        onToggleVideo={handleToggleVideo}
        onLeave={handleLeave}
        onEndStage={userRole === 'speaker' ? handleEndStage : undefined}
        onRaiseHand={userRole === 'audience' ? handleRaiseHand : undefined}
        onStartScreenShare={userRole === 'speaker' ? handleStartScreenShare : undefined}
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
      
      {/* Enhanced connection status indicator */}
      <div className="absolute top-20 right-4 text-sm text-white/70 space-y-2 bg-black/20 backdrop-blur-sm rounded-lg p-3 border border-white/10">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            state.connectionState === 'connected' ? 'bg-green-400 animate-pulse' : 'bg-red-400'
          }`}></div>
          <span className="font-medium">Stage: {state.connectionState}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${
            state.networkQuality.quality === 'excellent' || state.networkQuality.quality === 'good' 
              ? 'bg-green-400' : state.networkQuality.quality === 'fair' 
              ? 'bg-yellow-400' : 'bg-red-400'
          }`}></div>
          <span>Quality: {state.networkQuality.quality}</span>
        </div>
        <div className="text-xs space-y-1">
          <div>Participants: {state.participantCount}</div>
          <div>Ping: {state.networkQuality.ping.toFixed(0)}ms</div>
          <div>Bandwidth: {(state.networkQuality.bandwidth / 1000).toFixed(1)}Mbps</div>
        </div>
      </div>

      {/* Real-time quality indicator */}
      {state.networkQuality.quality === 'poor' && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-600/90 text-white px-4 py-2 rounded-lg shadow-lg animate-pulse">
          <span className="text-sm font-medium">⚠️ Poor connection quality detected</span>
        </div>
      )}
    </div>
  );
};
