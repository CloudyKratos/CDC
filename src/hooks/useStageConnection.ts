
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageConnectionManager from '@/services/StageConnectionManager';
import StageService from '@/services/StageService';
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

  const connect = useCallback(async (stageId: string) => {
    if (!user) {
      setConnectionError('Please log in to join the stage');
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log('Attempting to connect to stage:', stageId);
      
      const result = await connectionManager.current.attemptConnection(stageId, user.id);
      
      if (result.success) {
        setIsConnected(true);
        toast.success('Connected to stage successfully!');
      } else {
        setConnectionError(result.error || 'Failed to connect to stage');
        toast.error(result.error || 'Failed to connect to stage');
      }
    } catch (error) {
      console.error('Connection error:', error);
      setConnectionError('Unexpected connection error');
      toast.error('Unexpected connection error');
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const disconnect = useCallback(async (stageId: string) => {
    try {
      await connectionManager.current.forceDisconnect(stageId, user?.id);
      setIsConnected(false);
      setConnectionError(null);
      toast.success('Disconnected from stage');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Error disconnecting from stage');
    }
  }, [user]);

  const forceReconnect = useCallback(async (stageId: string) => {
    if (!user) return;

    setIsConnecting(true);
    setConnectionError(null);

    try {
      console.log('Force reconnecting to stage:', stageId);
      
      // Force disconnect first
      await connectionManager.current.forceDisconnect(stageId, user.id);
      
      // Wait a moment
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Attempt connection
      const result = await connectionManager.current.attemptConnection(stageId, user.id);
      
      if (result.success) {
        setIsConnected(true);
        toast.success('Reconnected successfully!');
      } else {
        setConnectionError(result.error || 'Failed to reconnect');
        toast.error(result.error || 'Failed to reconnect');
      }
    } catch (error) {
      console.error('Reconnection error:', error);
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
