
import { useState, useEffect, useCallback } from 'react';
import StageOrchestrator, { StageConfig, StageState } from '@/services/core/StageOrchestrator';
import StageService from '@/services/core/StageService';

export const useStageOrchestrator = () => {
  const [state, setState] = useState<StageState>(StageOrchestrator.getState());
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const orchestrator = StageOrchestrator;

    // Listen to state changes
    const handleStateChange = (data: { state: StageState }) => {
      setState(data.state);
    };

    const handleStageInitialized = () => {
      setIsInitialized(true);
    };

    const handleStageLeft = () => {
      setIsInitialized(false);
    };

    orchestrator.on('stateChanged', handleStateChange);
    orchestrator.on('stageInitialized', handleStageInitialized);
    orchestrator.on('stageLeft', handleStageLeft);

    return () => {
      orchestrator.off('stateChanged', handleStateChange);
      orchestrator.off('stageInitialized', handleStageInitialized);
      orchestrator.off('stageLeft', handleStageLeft);
    };
  }, []);

  const initializeStage = useCallback(async (config: StageConfig) => {
    return await StageOrchestrator.initializeStage(config);
  }, []);

  const leaveStage = useCallback(async () => {
    await StageOrchestrator.leaveStage();
  }, []);

  const toggleAudio = useCallback(async () => {
    try {
      return await StageService.toggleAudio();
    } catch (error) {
      console.error('Stage audio toggle error:', error);
      return false;
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    try {
      return await StageService.toggleVideo();
    } catch (error) {
      console.error('Stage video toggle error:', error);
      return false;
    }
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    try {
      console.log('Audio device switching not implemented:', deviceId);
      // TODO: Implement audio device switching when needed
    } catch (error) {
      console.error('Error switching audio device:', error);
    }
  }, []);

  const switchVideoDevice = useCallback(async (deviceId: string) => {
    try {
      console.log('Video device switching not implemented:', deviceId);
      // TODO: Implement video device switching when needed
    } catch (error) {
      console.error('Error switching video device:', error);
    }
  }, []);

  return {
    state,
    isInitialized,
    initializeStage,
    leaveStage,
    toggleAudio,
    toggleVideo,
    switchAudioDevice,
    switchVideoDevice,
    currentStage: StageOrchestrator.getCurrentStage()
  };
};
