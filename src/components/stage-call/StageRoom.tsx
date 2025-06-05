
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { ConnectionError } from './ui/ConnectionError';
import { StageLoadingScreen } from './ui/StageLoadingScreen';
import { StageRoomContent } from './ui/StageRoomContent';
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

  // Loading state
  if (state.connectionState === 'connecting') {
    return <StageLoadingScreen onLeave={onLeave} />;
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
    <StageRoomContent
      state={state}
      participants={participants}
      userRole={userRole}
      onLeave={handleLeave}
      onToggleAudio={handleToggleAudio}
      onToggleVideo={handleToggleVideo}
      onEndStage={userRole === 'speaker' ? handleEndStage : undefined}
      onRaiseHand={userRole === 'audience' ? handleRaiseHand : undefined}
      onStartScreenShare={userRole === 'speaker' ? handleStartScreenShare : undefined}
      convertToMediaDeviceInfo={convertToMediaDeviceInfo}
      switchAudioDevice={switchAudioDevice}
      switchVideoDevice={switchVideoDevice}
    />
  );
};
