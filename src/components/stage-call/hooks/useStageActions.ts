
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import RealTimeStageService from '@/services/RealTimeStageService';
import WebRTCStageService from '@/services/WebRTCStageService';
import { useStageOrchestrator } from './useStageOrchestrator';

export const useStageActions = () => {
  const { user } = useAuth();
  const { state, toggleAudio, toggleVideo, switchAudioDevice, switchVideoDevice } = useStageOrchestrator();

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
      // Use user.email as fallback for username since user object structure differs
      const userName = user.email?.split('@')[0] || 'Anonymous';
      await RealTimeStageService.sendChatMessage(
        user.id,
        userName,
        message
      );
    }
  };

  const handleEndStage = async () => {
    toast.success('Stage ended');
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

  return {
    handleToggleAudio,
    handleToggleVideo,
    handleRaiseHand,
    handleStartScreenShare,
    handleSendChatMessage,
    handleEndStage,
    handleDeviceSwitch
  };
};
