
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageConnectionManager from '@/services/StageConnectionManager';
import { toast } from 'sonner';

interface UseStageConnectionReturn {
  isConnecting: boolean;
  connectionError: string | null;
  isConnected: boolean;
  connect: (stageId: string) => Promise<void>;
  disconnect: (stageId: string) => Promise<void>;
  forceReconnect: (stageId: string) => Promise<void>;
  clearError: () => void;
}

export const useStageConnection = (): UseStageConnectionReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();
  const connectionManager = useRef(StageConnectionManager.getInstance());
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up timeouts on unmount
  useEffect(() => {
    return () => {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
      }
    };
  }, []);

  const connect = useCallback(async (stageId: string) => {
    if (!user) {
      setConnectionError('Please log in to join the stage');
      toast.error('Please log in to join the stage');
      return;
    }

    if (isConnecting) {
      console.log('Connection already in progress, ignoring duplicate request');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setIsConnected(false);

    // Set a connection timeout
    connectionTimeoutRef.current = setTimeout(() => {
      setIsConnecting(false);
      setConnectionError('Connection timeout - please try again');
      toast.error('Connection timeout - please try again');
    }, 30000); // 30 second timeout

    try {
      console.log('Attempting to connect to stage:', stageId);
      
      const result = await connectionManager.current.attemptConnection(stageId, user.id);
      
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      if (result.success) {
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Connected to stage successfully!');
      } else {
        setIsConnected(false);
        setConnectionError(result.error || 'Failed to connect to stage');
        toast.error(result.error || 'Failed to connect to stage');
      }
    } catch (error) {
      if (connectionTimeoutRef.current) {
        clearTimeout(connectionTimeoutRef.current);
        connectionTimeoutRef.current = null;
      }
      
      console.error('Connection error:', error);
      setIsConnected(false);
      setConnectionError('Unexpected connection error');
      toast.error('Unexpected connection error');
    } finally {
      setIsConnecting(false);
    }
  }, [user, isConnecting]);

  const disconnect = useCallback(async (stageId: string) => {
    try {
      console.log('Disconnecting from stage:', stageId);
      await connectionManager.current.forceDisconnect(stageId, user?.id);
      setIsConnected(false);
      setConnectionError(null);
      toast.success('Disconnected from stage');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Error disconnecting from stage');
      // Force state reset even if disconnect fails
      setIsConnected(false);
    }
  }, [user]);

  const forceReconnect = useCallback(async (stageId: string) => {
    if (!user) {
      setConnectionError('Please log in to reconnect');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log('Force reconnecting to stage:', stageId);
      
      // Force disconnect with extended wait time
      await connectionManager.current.forceDisconnect(stageId, user.id);
      
      // Wait longer before reconnecting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Attempt connection
      const result = await connectionManager.current.attemptConnection(stageId, user.id);
      
      if (result.success) {
        setIsConnected(true);
        setConnectionError(null);
        toast.success('Reconnected successfully!');
      } else {
        setIsConnected(false);
        setConnectionError(result.error || 'Failed to reconnect');
        toast.error(result.error || 'Failed to reconnect');
      }
    } catch (error) {
      console.error('Force reconnection error:', error);
      setIsConnected(false);
      setConnectionError('Failed to reconnect to stage');
      toast.error('Failed to reconnect to stage');
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const clearError = useCallback(() => {
    setConnectionError(null);
  }, []);

  return {
    isConnecting,
    connectionError,
    isConnected,
    connect,
    disconnect,
    forceReconnect,
    clearError
  };
};
