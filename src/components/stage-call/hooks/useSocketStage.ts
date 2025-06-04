
import { useState, useRef, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import StageService from '@/services/StageService';

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

  const createPeerConnection = useCallback((remoteUserId: string) => {
    const pc = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    });

    pc.onicecandidate = (event) => {
      if (event.candidate && socketRef.current) {
        socketRef.current.emit('ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate
        });
      }
    };

    pc.ontrack = (event) => {
      console.log('Received remote track from:', remoteUserId);
      // Handle incoming track
    };

    return pc;
  }, []);

  const connect = useCallback(async () => {
    try {
      setConnectionError(null);
      
      // First validate stage access through our service
      const validation = await StageService.validateStageAccess(stageId);
      if (!validation.canAccess) {
        throw new Error(validation.reason || 'Cannot access stage');
      }

      // Join stage through our service
      const joinResult = await StageService.joinStage(stageId, 'audience');
      if (!joinResult.success) {
        throw new Error(joinResult.error || 'Failed to join stage');
      }

      setIsConnected(true);
      console.log('Connected to stage successfully');
      
      // Load participants
      const participantData = await StageService.getStageParticipants(stageId);
      setParticipants(participantData);
      
    } catch (error) {
      console.error('Connection failed:', error);
      setConnectionError(error instanceof Error ? error.message : 'Connection failed');
      setIsConnected(false);
      throw error;
    }
  }, [stageId]);

  const disconnect = useCallback(async () => {
    try {
      console.log('Disconnecting from stage');
      
      // Clean up peer connections
      peerConnectionsRef.current.forEach(({ pc }) => {
        pc.close();
      });
      peerConnectionsRef.current.clear();

      // Leave stage through our service
      await StageService.leaveStage(stageId);
      
      setIsConnected(false);
      setParticipants([]);
      
    } catch (error) {
      console.error('Disconnect error:', error);
      // Force reset state even if disconnect fails
      setIsConnected(false);
    }
  }, [stageId]);

  const forceReconnect = useCallback(async () => {
    console.log('Force reconnecting...');
    
    // Disconnect first
    await disconnect();
    
    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Reconnect
    await connect();
  }, [disconnect, connect]);

  // Auto-reconnect on connection loss
  useEffect(() => {
    if (!isConnected && !connectionError) {
      reconnectTimeoutRef.current = setTimeout(() => {
        console.log('Attempting auto-reconnect...');
        connect().catch(console.error);
      }, 5000);
    }

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, [isConnected, connectionError, connect]);

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
