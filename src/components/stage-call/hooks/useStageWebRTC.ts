
import { useState, useRef, useEffect, useCallback } from 'react';
import StageSignalingService from '@/services/StageSignalingService';
import StageWebRTCService from '@/services/StageWebRTCService';

interface RemoteParticipant {
  userId: string;
  stream: MediaStream;
  connectionState: RTCPeerConnectionState;
}

export const useStageWebRTC = (stageId: string, userId: string, localStream: MediaStream | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  
  const isInitialized = useRef(false);

  // Initialize WebRTC when local stream is available
  useEffect(() => {
    const initializeWebRTC = async () => {
      if (!localStream || !stageId || !userId || isInitialized.current) return;

      try {
        console.log('Initializing WebRTC for stage:', stageId);
        
        // Join signaling channel
        const signalConnected = await StageSignalingService.joinStage(stageId, userId);
        if (!signalConnected) {
          throw new Error('Failed to join signaling channel');
        }

        // Initialize WebRTC service
        await StageWebRTCService.initialize(localStream);

        // Set up event handlers
        StageWebRTCService.onRemoteStream((userId, stream) => {
          console.log('Adding remote stream for user:', userId);
          setRemoteParticipants(prev => {
            const updated = new Map(prev);
            const existing = updated.get(userId);
            updated.set(userId, {
              userId,
              stream,
              connectionState: existing?.connectionState || 'connecting'
            });
            return updated;
          });
        });

        StageWebRTCService.onConnectionStateChange((userId, state) => {
          console.log('Connection state changed for user:', userId, state);
          setRemoteParticipants(prev => {
            const updated = new Map(prev);
            const existing = updated.get(userId);
            if (existing) {
              updated.set(userId, { ...existing, connectionState: state });
            }
            return updated;
          });

          if (state === 'failed' || state === 'disconnected') {
            setRemoteParticipants(prev => {
              const updated = new Map(prev);
              updated.delete(userId);
              return updated;
            });
          }
        });

        // Connect to existing users
        await StageWebRTCService.connectToExistingUsers();

        setIsConnected(true);
        setConnectionError(null);
        isInitialized.current = true;
        
        console.log('WebRTC initialized successfully');
      } catch (error) {
        console.error('Error initializing WebRTC:', error);
        setConnectionError(error instanceof Error ? error.message : 'WebRTC initialization failed');
        setIsConnected(false);
      }
    };

    initializeWebRTC();
  }, [localStream, stageId, userId]);

  // Update local stream when it changes
  useEffect(() => {
    if (localStream && isInitialized.current) {
      StageWebRTCService.updateLocalStream(localStream);
    }
  }, [localStream]);

  const disconnect = useCallback(async () => {
    try {
      await StageSignalingService.leaveStage();
      StageWebRTCService.cleanup();
      
      setIsConnected(false);
      setRemoteParticipants(new Map());
      setConnectionError(null);
      isInitialized.current = false;
      
      console.log('WebRTC disconnected');
    } catch (error) {
      console.error('Error disconnecting WebRTC:', error);
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isInitialized.current) {
        disconnect();
      }
    };
  }, [disconnect]);

  return {
    isConnected,
    remoteParticipants: Array.from(remoteParticipants.values()),
    connectionError,
    disconnect
  };
};
