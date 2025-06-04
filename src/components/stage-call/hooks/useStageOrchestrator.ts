
import { useState, useEffect, useCallback } from 'react';
import StageOrchestrator, { StageConfig, StageState } from '@/services/core/StageOrchestrator';

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
    return await StageOrchestrator.toggleAudio();
  }, []);

  const toggleVideo = useCallback(async () => {
    return await StageOrchestrator.toggleVideo();
  }, []);

  const switchAudioDevice = useCallback(async (deviceId: string) => {
    await StageOrchestrator.switchAudioDevice(deviceId);
  }, []);

  const switchVideoDevice = useCallback(async (deviceId: string) => {
    await StageOrchestrator.switchVideoDevice(deviceId);
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
