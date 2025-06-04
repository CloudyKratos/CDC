
import { useState, useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import StageConnectionService from '@/services/StageConnectionService';
import { toast } from 'sonner';

interface UseStageConnectionReturn {
  isConnecting: boolean;
  connectionError: string | null;
  isConnected: boolean;
  connect: (stageId: string) => Promise<void>;
  disconnect: () => Promise<void>;
  forceReconnect: (stageId: string) => Promise<void>;
  clearError: () => void;
  connectionState: 'disconnected' | 'connecting' | 'connected' | 'error';
}

export const useStageConnection = (): UseStageConnectionReturn => {
  const [isConnecting, setIsConnecting] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionState, setConnectionState] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  const { user } = useAuth();
  const connectionService = useRef(StageConnectionService.getInstance());
  const retryCount = useRef(0);
  const maxRetries = 3;

  // Monitor connection state changes
  useEffect(() => {
    const checkInterval = setInterval(() => {
      const state = connectionService.current.getConnectionState();
      setIsConnected(state.isConnected);
      setIsConnecting(state.isConnecting);
      
      if (state.isConnected) {
        setConnectionState('connected');
      } else if (state.isConnecting) {
        setConnectionState('connecting');
      } else if (connectionError) {
        setConnectionState('error');
      } else {
        setConnectionState('disconnected');
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [connectionError]);

  const connect = useCallback(async (stageId: string) => {
    if (!user) {
      const error = 'Please log in to join the stage';
      setConnectionError(error);
      toast.error(error);
      return;
    }

    setIsConnecting(true);
    setConnectionError(null);
    setConnectionState('connecting');

    try {
      console.log('Attempting to connect to stage:', stageId);
      
      const result = await connectionService.current.connectToStage(stageId, user.id);
      
      if (result.success) {
        setIsConnected(true);
        setConnectionError(null);
        setConnectionState('connected');
        retryCount.current = 0;
        toast.success('Connected to stage successfully!');
      } else {
        throw new Error(result.error || 'Failed to connect');
      }
    } catch (error) {
      console.error('Connection error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Connection failed';
      setConnectionError(errorMessage);
      setConnectionState('error');
      setIsConnected(false);
      
      // Auto-retry logic
      if (retryCount.current < maxRetries && errorMessage.includes('already participating')) {
        retryCount.current++;
        toast.error(`Connection failed. Retrying... (${retryCount.current}/${maxRetries})`);
        setTimeout(() => connect(stageId), 2000 * retryCount.current);
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsConnecting(false);
    }
  }, [user]);

  const disconnect = useCallback(async () => {
    try {
      console.log('Disconnecting from stage');
      await connectionService.current.disconnectFromStage();
      
      setIsConnected(false);
      setConnectionError(null);
      setConnectionState('disconnected');
      retryCount.current = 0;
      
      toast.success('Disconnected from stage');
    } catch (error) {
      console.error('Disconnect error:', error);
      toast.error('Error disconnecting from stage');
      
      // Force state reset even if disconnect fails
      setIsConnected(false);
      setConnectionState('disconnected');
    }
  }, []);

  const forceReconnect = useCallback(async (stageId: string) => {
    if (!user) {
      setConnectionError('Please log in to reconnect');
      return;
    }

    try {
      console.log('Force reconnecting to stage:', stageId);
      
      // Disconnect first
      await disconnect();
      
      // Wait a bit before reconnecting
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Reset retry count for force reconnect
      retryCount.current = 0;
      
      // Attempt new connection
      await connect(stageId);
      
    } catch (error) {
      console.error('Force reconnection error:', error);
      setConnectionError('Failed to reconnect to stage');
      setConnectionState('error');
      toast.error('Failed to reconnect to stage');
    }
  }, [user, connect, disconnect]);

  const clearError = useCallback(() => {
    setConnectionError(null);
    if (connectionState === 'error') {
      setConnectionState('disconnected');
    }
  }, [connectionState]);

  return {
    isConnecting,
    connectionError,
    isConnected,
    connect,
    disconnect,
    forceReconnect,
    clearError,
    connectionState
  };
};
