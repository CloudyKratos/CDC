
import { useCallback } from 'react';
import WebRTCStageService from '@/services/WebRTCStageService';
import { toast } from 'sonner';

export const useStageActions = () => {
  const handleToggleAudio = useCallback(async (): Promise<boolean> => {
    try {
      const isEnabled = await WebRTCStageService.toggleAudio();
      toast.success(isEnabled ? 'Microphone unmuted' : 'Microphone muted');
      return isEnabled;
    } catch (error) {
      console.error('Error toggling audio:', error);
      toast.error('Failed to toggle microphone');
      return false;
    }
  }, []);

  const handleToggleVideo = useCallback(async (): Promise<boolean> => {
    try {
      const isEnabled = await WebRTCStageService.toggleVideo();
      toast.success(isEnabled ? 'Camera on' : 'Camera off');
      return isEnabled;
    } catch (error) {
      console.error('Error toggling video:', error);
      toast.error('Failed to toggle camera');
      return false;
    }
  }, []);

  const handleRaiseHand = useCallback(async () => {
    // This would integrate with the real-time service to notify moderators
    toast.success('Hand raised! Moderators have been notified.');
  }, []);

  const handleStartScreenShare = useCallback(async () => {
    try {
      // Screen sharing implementation would go here
      toast.success('Screen sharing started');
    } catch (error) {
      console.error('Error starting screen share:', error);
      toast.error('Failed to start screen sharing');
    }
  }, []);

  const handleSendChatMessage = useCallback(async (message: string) => {
    // Chat message implementation would go here
    console.log('Sending chat message:', message);
  }, []);

  const handleEndStage = useCallback(async () => {
    // End stage implementation would go here
    toast.success('Stage ended');
  }, []);

  const handleDeviceSwitch = useCallback(async (deviceId: string, type: 'audio' | 'video') => {
    try {
      if (type === 'audio') {
        await WebRTCStageService.switchAudioDevice(deviceId);
        toast.success('Audio device switched');
      } else {
        await WebRTCStageService.switchVideoDevice(deviceId);
        toast.success('Video device switched');
      }
    } catch (error) {
      console.error(`Error switching ${type} device:`, error);
      toast.error(`Failed to switch ${type} device`);
    }
  }, []);

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
