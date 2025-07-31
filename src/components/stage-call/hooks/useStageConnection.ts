
import { useState, useEffect, useCallback } from 'react';
import { useStageOrchestrator } from './useStageOrchestrator';

interface StageConnectionConfig {
  stageId: string;
  userId: string;
  role?: 'host' | 'speaker' | 'audience';
}

export const useStageConnection = () => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(new Map());
  
  const { state, initializeStage, leaveStage } = useStageOrchestrator();

  const connect = useCallback(async (config: StageConnectionConfig) => {
    setIsConnecting(true);
    setConnectionError(null);

    try {
      // Initialize media first
      console.log('Getting user media...');
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          frameRate: { ideal: 30 }
        }
      });

      setLocalStream(stream);
      console.log('Local stream obtained');

      // Initialize stage with orchestrator - fix the role mapping
      const mappedRole = config.role === 'host' ? 'moderator' : (config.role || 'audience');
      const stageConfig = {
        stageId: config.stageId,
        userId: config.userId,
        userRole: mappedRole as 'speaker' | 'audience' | 'moderator',
        enableAudio: true,
        enableVideo: true,
        enableSecurity: false,
        enableCompliance: false
      };

      const result = await initializeStage(stageConfig);
      if (!result.success) {
        throw new Error(result.error);
      }

      console.log('Stage connection established');
      
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      
      // Cleanup on error
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [initializeStage, localStream]);

  const disconnect = useCallback(async () => {
    try {
      await leaveStage();
      
      // Clean up local stream
      if (localStream) {
        localStream.getTracks().forEach(track => track.stop());
        setLocalStream(null);
      }

      // Clear remote streams
      setRemoteStreams(new Map());
      setConnectionError(null);
      
    } catch (error) {
      console.error('Disconnect error:', error);
    }
  }, [leaveStage, localStream]);

  const addRemoteStream = useCallback((userId: string, stream: MediaStream) => {
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.set(userId, stream);
      return newMap;
    });
  }, []);

  const removeRemoteStream = useCallback((userId: string) => {
    setRemoteStreams(prev => {
      const newMap = new Map(prev);
      newMap.delete(userId);
      return newMap;
    });
  }, []);

  return {
    // Connection state
    isConnecting,
    isConnected: state.isConnected,
    connectionError,
    connectionState: state.connectionState,
    
    // Media streams
    localStream,
    remoteStreams,
    
    // Actions
    connect,
    disconnect,
    addRemoteStream,
    removeRemoteStream,
    
    // Stage state
    participantCount: state.participantCount,
    networkQuality: state.networkQuality
  };
};
