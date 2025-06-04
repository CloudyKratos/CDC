
import { useState, useRef, useEffect, useCallback } from 'react';
import StageSignalingService from '@/services/StageSignalingService';
import EnhancedStageWebRTCService from '@/services/EnhancedStageWebRTCService';

interface RemoteParticipant {
  userId: string;
  stream: MediaStream;
  connectionState: RTCPeerConnectionState;
}

export const useEnhancedStageWebRTC = (stageId: string, userId: string, localStream: MediaStream | null) => {
  const [isConnected, setIsConnected] = useState(false);
  const [remoteParticipants, setRemoteParticipants] = useState<Map<string, RemoteParticipant>>(new Map());
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const isInitialized = useRef(false);

  const handleRemoteStream = useCallback((userId: string, stream: MediaStream) => {
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
  }, []);

  const handleConnectionStateChange = useCallback((userId: string, state: RTCPeerConnectionState) => {
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
  }, []);

  const handleUserDisconnected = useCallback((userId: string) => {
    console.log('User disconnected:', userId);
    setRemoteParticipants(prev => {
      const updated = new Map(prev);
      updated.delete(userId);
      return updated;
    });
  }, []);

  // Initialize WebRTC when local stream is available
  useEffect(() => {
    const initializeWebRTC = async () => {
      if (!localStream || !stageId || !userId || isInitialized.current || isInitializing) return;

      try {
        setIsInitializing(true);
        console.log('Initializing Enhanced WebRTC for stage:', stageId);
        
        // Join signaling channel
        const signalConnected = await StageSignalingService.joinStage(stageId, userId);
        if (!signalConnected) {
          throw new Error('Failed to join signaling channel');
        }

        // Initialize WebRTC service with event handlers
        await EnhancedStageWebRTCService.initialize(localStream, {
          onRemoteStream: handleRemoteStream,
          onConnectionStateChange: handleConnectionStateChange,
          onUserDisconnected: handleUserDisconnected
        });

        // Connect to existing users
        await EnhancedStageWebRTCService.connectToExistingUsers();

        setIsConnected(true);
        setConnectionError(null);
        isInitialized.current = true;
        
        console.log('Enhanced WebRTC initialized successfully');
      } catch (error) {
        console.error('Error initializing Enhanced WebRTC:', error);
        setConnectionError(error instanceof Error ? error.message : 'WebRTC initialization failed');
        setIsConnected(false);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeWebRTC();
  }, [localStream, stageId, userId, handleRemoteStream, handleConnectionStateChange, handleUserDisconnected, isInitializing]);

  // Update local stream when it changes
  useEffect(() => {
    if (localStream && isInitialized.current) {
      EnhancedStageWebRTCService.updateLocalStream(localStream);
    }
  }, [localStream]);

  const disconnect = useCallback(async () => {
    try {
      await StageSignalingService.leaveStage();
      EnhancedStageWebRTCService.cleanup();
      
      setIsConnected(false);
      setRemoteParticipants(new Map());
      setConnectionError(null);
      isInitialized.current = false;
      
      console.log('Enhanced WebRTC disconnected');
    } catch (error) {
      console.error('Error disconnecting Enhanced WebRTC:', error);
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
    isInitializing,
    disconnect
  };
};
