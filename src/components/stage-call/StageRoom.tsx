
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
  const [isJoining, setIsJoining] = useState(false);
  
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
      if (!user || isJoining) return;

      setIsJoining(true);
      
      try {
        console.log('Initializing stage room for user:', user.id);
        
        // Show immediate feedback
        toast.info('Connecting to stage...', {
          duration: 2000,
          description: 'Setting up your audio and video'
        });
        
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
          toast.error(`Connection failed`, {
            description: result.error || 'Unable to join the stage',
            action: {
              label: 'Retry',
              onClick: () => initializeStageRoom()
            }
          });
        } else {
          toast.success('Welcome to the stage!', {
            description: 'You are now connected and ready to participate'
          });
        }
      } catch (error) {
        console.error('Failed to initialize stage room:', error);
        toast.error('Connection error', {
          description: 'Please check your internet connection and try again',
          action: {
            label: 'Retry',
            onClick: () => initializeStageRoom()
          }
        });
      } finally {
        setIsJoining(false);
      }
    };

    initializeStageRoom();

    return () => {
      handleLeave();
    };
  }, [stageId, user]);

  const handleLeave = async () => {
    try {
      toast.info('Leaving stage...', { duration: 1000 });
      await leaveStage();
      toast.success('Left the stage', { duration: 2000 });
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage', {
        description: 'You have been disconnected'
      });
      onLeave(); // Leave anyway
    }
  };

  const handleToggleAudio = async () => {
    try {
      const newState = await toggleAudio();
      toast.success(newState ? '🎤 Microphone on' : '🔇 Microphone muted', {
        duration: 1500
      });
      return newState;
    } catch (error) {
      toast.error('Failed to toggle microphone');
      return state.mediaState.audioEnabled;
    }
  };

  const handleToggleVideo = async () => {
    try {
      const newState = await toggleVideo();
      toast.success(newState ? '📹 Camera on' : '📵 Camera off', {
        duration: 1500
      });
      return newState;
    } catch (error) {
      toast.error('Failed to toggle camera');
      return state.mediaState.videoEnabled;
    }
  };

  const handleRaiseHand = () => {
    toast.success('✋ Hand raised!', {
      description: 'Waiting for moderator approval...',
      duration: 3000
    });
  };

  const handleStartScreenShare = () => {
    toast.info('🖥️ Screen sharing', {
      description: 'This feature is coming soon!',
      duration: 3000
    });
  };

  const handleEndStage = async () => {
    toast.success('Stage ended', {
      description: 'All participants have been disconnected'
    });
    await handleLeave();
  };

  const handleDeviceSwitch = async (deviceId: string, type: 'audio' | 'video') => {
    try {
      if (type === 'audio') {
        await switchAudioDevice(deviceId);
        toast.success('🎤 Audio device switched');
      } else {
        await switchVideoDevice(deviceId);
        toast.success('📹 Camera switched');
      }
    } catch (error) {
      toast.error(`Failed to switch ${type} device`);
    }
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
  if (state.connectionState === 'connecting' || isJoining) {
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
      switchAudioDevice={(deviceId) => handleDeviceSwitch(deviceId, 'audio')}
      switchVideoDevice={(deviceId) => handleDeviceSwitch(deviceId, 'video')}
    />
  );
};
