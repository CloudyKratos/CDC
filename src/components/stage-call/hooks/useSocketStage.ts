
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StageService from '@/services/StageService';
import StageCleanupService from '@/services/StageCleanupService';

interface PeerConnection {
  pc: RTCPeerConnection;
  userId: string;
}

export const useSocketStage = (stageId: string, userId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [participants, setParticipants] = useState<any[]>([]);
  
  const socketRef = useRef<any>(null);
  const peerConnectionsRef = useRef<Map<string, PeerConnection>>(new Map());
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const cleanupService = StageCleanupService.getInstance();

  const connect = useCallback(async () => {
    try {
      setConnectionError(null);
      console.log('Starting stage connection process...');
      
      // First validate stage access through our service
      const validation = await StageService.validateStageAccess(stageId);
      if (!validation.canAccess) {
        throw new Error(validation.reason || 'Cannot access stage');
      }

      // Clean up any ghost participants first
      await cleanupService.cleanupGhostParticipants(stageId);
      
      // Use the safe join method with aggressive cleanup
      const joinResult = await cleanupService.safeJoinStage(stageId, userId, 'audience');
      if (!joinResult.success) {
        throw new Error(joinResult.error || 'Failed to join stage');
      }

      setIsConnected(true);
      console.log('Connected to stage successfully');
      
      // Load participants from database
      const participantData = await StageService.getStageParticipants(stageId);
      setParticipants(participantData);
      
      // Set up real-time subscription for participant changes
      const participantsChannel = supabase
        .channel(`stage-participants-${stageId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'stage_participants',
            filter: `stage_id=eq.${stageId}`
          },
          async (payload) => {
            console.log('Participant change:', payload);
            // Reload participants when changes occur
            const updatedParticipants = await StageService.getStageParticipants(stageId);
            setParticipants(updatedParticipants);
          }
        )
        .subscribe();

      // Store channel reference for cleanup
      socketRef.current = participantsChannel;
      
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
      throw error;
    }
  }, [stageId, userId, cleanupService]);

  const disconnect = useCallback(async () => {
    try {
      console.log('Disconnecting from stage');
      
      // Clean up real-time subscription
      if (socketRef.current) {
        await socketRef.current.unsubscribe();
        socketRef.current = null;
      }

      // Clean up peer connections
      peerConnectionsRef.current.forEach(({ pc }) => {
        pc.close();
      });
      peerConnectionsRef.current.clear();

      // Leave stage through our service
      await StageService.leaveStage(stageId);
      
      // Additional cleanup
      await cleanupService.forceCleanupUserParticipation(stageId, userId);
      
      setIsConnected(false);
      setParticipants([]);
      
    } catch (error) {
      console.error('Disconnect error:', error);
      // Force reset state even if disconnect fails
      setIsConnected(false);
    }
  }, [stageId, userId, cleanupService]);

  const forceReconnect = useCallback(async () => {
    console.log('Force reconnecting...');
    
    // Aggressive cleanup first
    await cleanupService.forceCleanupUserParticipation(stageId, userId);
    
    // Disconnect first
    await disconnect();
    
    // Wait a longer moment for cleanup
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Reconnect
    await connect();
  }, [disconnect, connect, cleanupService, stageId, userId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      disconnect();
    };
  }, [disconnect]);

  return {
    socket: socketRef.current,
    peerConnections: peerConnectionsRef.current,
    participants,
    isConnected,
    connectionError,
    connect,
    disconnect,
    forceReconnect
  };
};
