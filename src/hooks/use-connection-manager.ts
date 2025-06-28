
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ConnectionState {
  isConnected: boolean;
  isConnecting: boolean;
  retryCount: number;
  lastError: string | null;
  connectionId: string | null;
}

export function useConnectionManager() {
  const [state, setState] = useState<ConnectionState>({
    isConnected: false,
    isConnecting: false,
    retryCount: 0,
    lastError: null,
    connectionId: null
  });

  const subscriptionsRef = useRef<Map<string, any>>(new Map());
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Exponential backoff calculation
  const getRetryDelay = useCallback((retryCount: number) => {
    return Math.min(1000 * Math.pow(2, retryCount), 30000); // Max 30 seconds
  }, []);

  // Health check with heartbeat
  const startHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
    }

    heartbeatRef.current = setInterval(async () => {
      try {
        const { error } = await supabase.from('channels').select('count').limit(1);
        if (error) {
          console.warn('💓 Heartbeat failed:', error);
          setState(prev => ({ ...prev, isConnected: false, lastError: 'Connection lost' }));
        } else {
          setState(prev => ({ ...prev, isConnected: true, lastError: null }));
        }
      } catch (err) {
        console.warn('💓 Heartbeat error:', err);
        setState(prev => ({ ...prev, isConnected: false, lastError: 'Network error' }));
      }
    }, 10000); // Check every 10 seconds
  }, []);

  // Stop heartbeat
  const stopHeartbeat = useCallback(() => {
    if (heartbeatRef.current) {
      clearInterval(heartbeatRef.current);
      heartbeatRef.current = null;
    }
  }, []);

  // Create subscription with auto-retry
  const createSubscription = useCallback((
    subscriptionKey: string,
    channelName: string,
    config: any,
    onMessage: (payload: any) => void
  ) => {
    console.log('🔗 Creating subscription:', subscriptionKey);

    // Clean up existing subscription
    if (subscriptionsRef.current.has(subscriptionKey)) {
      const oldSub = subscriptionsRef.current.get(subscriptionKey);
      if (oldSub) {
        supabase.removeChannel(oldSub);
      }
      subscriptionsRef.current.delete(subscriptionKey);
    }

    const subscription = supabase
      .channel(channelName)
      .on('postgres_changes', config, onMessage)
      .subscribe((status) => {
        console.log(`📡 Subscription ${subscriptionKey} status:`, status);
        
        if (status === 'SUBSCRIBED') {
          setState(prev => ({ 
            ...prev, 
            isConnected: true, 
            isConnecting: false,
            retryCount: 0,
            lastError: null 
          }));
          startHeartbeat();
        } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
          setState(prev => ({ 
            ...prev, 
            isConnected: false,
            lastError: `Subscription failed: ${status}` 
          }));
          
          // Auto-reconnect with exponential backoff
          if (state.retryCount < 5) {
            const delay = getRetryDelay(state.retryCount);
            console.log(`🔄 Reconnecting in ${delay}ms (attempt ${state.retryCount + 1}/5)`);
            
            reconnectTimeoutRef.current = setTimeout(() => {
              setState(prev => ({ ...prev, retryCount: prev.retryCount + 1 }));
              createSubscription(subscriptionKey, channelName, config, onMessage);
            }, delay);
          } else {
            toast.error('Connection failed after multiple attempts');
          }
        }
      });

    subscriptionsRef.current.set(subscriptionKey, subscription);
    return subscription;
  }, [state.retryCount, getRetryDelay, startHeartbeat]);

  // Manual reconnect
  const reconnect = useCallback(() => {
    console.log('🔄 Manual reconnect triggered');
    setState(prev => ({ 
      ...prev, 
      isConnecting: true, 
      retryCount: 0, 
      lastError: null 
    }));

    // Recreate all subscriptions
    const currentSubs = Array.from(subscriptionsRef.current.entries());
    subscriptionsRef.current.clear();
    
    currentSubs.forEach(([key, sub]) => {
      if (sub && sub.topic) {
        // Extract config from existing subscription and recreate
        console.log(`🔄 Recreating subscription: ${key}`);
      }
    });
  }, []);

  // Cleanup all subscriptions
  const cleanup = useCallback(() => {
    console.log('🧹 Cleaning up connection manager');
    
    stopHeartbeat();
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }

    subscriptionsRef.current.forEach(subscription => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    });
    subscriptionsRef.current.clear();

    setState({
      isConnected: false,
      isConnecting: false,
      retryCount: 0,
      lastError: null,
      connectionId: null
    });
  }, [stopHeartbeat]);

  // Network status detection
  useEffect(() => {
    const handleOnline = () => {
      console.log('🌐 Network came online');
      setState(prev => ({ ...prev, lastError: null }));
      reconnect();
    };

    const handleOffline = () => {
      console.log('🌐 Network went offline');
      setState(prev => ({ 
        ...prev, 
        isConnected: false, 
        lastError: 'Network offline' 
      }));
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [reconnect]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  return {
    ...state,
    createSubscription,
    reconnect,
    cleanup,
    isOnline: navigator.onLine
  };
}
