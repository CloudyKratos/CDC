
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useStageOrchestrator } from './hooks/useStageOrchestrator';
import { ConnectionError } from './ui/ConnectionError';
import { StageLoadingScreen } from './ui/StageLoadingScreen';
import { StageRoomContent } from './ui/StageRoomContent';
import { StageChat } from './ui/StageChat';
import { toast } from 'sonner';
import RealTimeStageService from '@/services/RealTimeStageService';
import WebRTCStageService from '@/services/WebRTCStageService';
import { StageParticipant, ChatMessage } from '@/services/core/types/StageTypes';

interface StageRoomProps {
  stageId: string;
  onLeave: () => void;
}

export const StageRoom: React.FC<StageRoomProps> = ({ stageId, onLeave }) => {
  const { user } = useAuth();
  const [userRole, setUserRole] = useState<'speaker' | 'audience' | 'moderator'>('audience');
  const [participants, setParticipants] = useState<StageParticipant[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
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
        console.log('Initializing enhanced stage room for user:', user.id);
        
        toast.info('Connecting to stage...', {
          duration: 2000,
          description: 'Setting up audio, video and real-time features'
        });

        // Initialize WebRTC first
        const stream = await WebRTCStageService.initializeMedia({
          audio: true,
          video: true
        });
        setLocalStream(stream);

        // Set up WebRTC event handlers
        WebRTCStageService.on('remoteStream', ({ userId, stream }) => {
          setRemoteStreams(prev => new Map(prev.set(userId, stream)));
        });

        // Join real-time stage
        const joined = await RealTimeStageService.joinStage(stageId, user.id, 'audience');
        if (!joined) {
          throw new Error('Failed to join real-time stage');
        }

        // Set up real-time event handlers
        RealTimeStageService.on('participantUpdate', (payload) => {
          console.log('Participant update:', payload);
          // Refresh participants list
          setParticipants(RealTimeStageService.getParticipants());
        });

        RealTimeStageService.on('chatMessage', (message: ChatMessage) => {
          setChatMessages(prev => [...prev, message]);
        });

        // Initialize stage orchestrator
        const result = await initializeStage({
          stageId,
          userId: user.id,
          userRole: 'audience',
          mediaConstraints: {
            audio: true,
            video: true
          },
          qualitySettings: {
            maxBitrate: 2500000,
            adaptiveStreaming: true,
            lowLatencyMode: true
          }
        });

        if (!result.success) {
          throw new Error(result.error || 'Failed to initialize stage');
        }

        toast.success('Connected to stage!', {
          description: 'All features are now active'
        });
      } catch (error) {
        console.error('Failed to initialize stage room:', error);
        toast.error('Connection failed', {
          description: error instanceof Error ? error.message : 'Please try again',
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
      
      if (user) {
        await RealTimeStageService.leaveStage(user.id);
      }
      
      WebRTCStageService.cleanup();
      await leaveStage();
      
      toast.success('Left the stage', { duration: 2000 });
      onLeave();
    } catch (error) {
      console.error('Error leaving stage:', error);
      toast.error('Error leaving stage');
      onLeave();
    }
  };

  const handleToggleAudio = async () => {
    try {
      const newState = await toggleAudio();
      await WebRTCStageService.toggleAudio(newState);
      
      if (user) {
        await RealTimeStageService.toggleMute(user.id, !newState);
      }
      
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
      await WebRTCStageService.toggleVideo(newState);
      
      if (user) {
        await RealTimeStageService.toggleVideo(user.id, newState);
      }
      
      toast.success(newState ? '📹 Camera on' : '📵 Camera off', {
        duration: 1500
      });
      return newState;
    } catch (error) {
      toast.error('Failed to toggle camera');
      return state.mediaState.videoEnabled;
    }
  };

  const handleRaiseHand = async () => {
    if (user) {
      await RealTimeStageService.raiseHand(user.id, true);
      toast.success('✋ Hand raised!', {
        description: 'Waiting for moderator approval...',
        duration: 3000
      });
    }
  };

  const handleStartScreenShare = async () => {
    try {
      await WebRTCStageService.startScreenShare();
      toast.success('🖥️ Screen sharing started');
    } catch (error) {
      toast.error('Failed to start screen sharing');
    }
  };

  const handleSendChatMessage = async (message: string) => {
    if (user) {
      await RealTimeStageService.sendChatMessage(
        user.id,
        user.user_metadata?.full_name || user.email || 'Anonymous',
        message
      );
    }
  };

  const handleEndStage = async () => {
    toast.success('Stage ended');
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
    <>
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
        localStream={localStream}
        remoteStreams={remoteStreams}
      />
      
      <StageChat
        messages={chatMessages}
        onSendMessage={handleSendChatMessage}
        isOpen={isChatOpen}
        onToggle={() => setIsChatOpen(!isChatOpen)}
        participantCount={participants.length + 1}
      />
    </>
  );
};
