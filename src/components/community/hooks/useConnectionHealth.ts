
import { useState, useEffect, useRef, useCallback } from 'react';

export interface ConnectionHealth {
  status: 'connected' | 'connecting' | 'disconnected' | 'error';
  quality: 'excellent' | 'good' | 'poor' | 'critical';
  reconnectAttempts: number;
  lastConnected: Date | null;
  latency: number;
}

export function useConnectionHealth() {
  const [health, setHealth] = useState<ConnectionHealth>({
    status: 'disconnected',
    quality: 'critical',
    reconnectAttempts: 0,
    lastConnected: null,
    latency: 0
  });

  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxReconnectAttempts = 5;
  const baseDelay = 1000;

  const updateHealth = useCallback((updates: Partial<ConnectionHealth>) => {
    setHealth(prev => ({ ...prev, ...updates }));
  }, []);

  const calculateBackoffDelay = useCallback((attempt: number) => {
    return Math.min(baseDelay * Math.pow(2, attempt), 30000);
  }, []);

  const handleConnectionStatus = useCallback((status: string, attempts = 0) => {
    const now = new Date();
    
    switch (status) {
      case 'SUBSCRIBED':
        updateHealth({
          status: 'connected',
          quality: attempts === 0 ? 'excellent' : attempts < 3 ? 'good' : 'poor',
          reconnectAttempts: 0,
          lastConnected: now,
          latency: 0
        });
        break;
        
      case 'CHANNEL_ERROR':
      case 'CLOSED':
        updateHealth({
          status: 'disconnected',
          quality: 'critical',
          reconnectAttempts: attempts
        });
        break;
        
      case 'CONNECTING':
        updateHealth({
          status: 'connecting',
          quality: attempts > 3 ? 'critical' : 'poor',
          reconnectAttempts: attempts
        });
        break;
        
      default:
        updateHealth({
          status: 'error',
          quality: 'critical'
        });
    }
  }, [updateHealth]);

  const scheduleReconnect = useCallback((onReconnect: () => void) => {
    if (health.reconnectAttempts >= maxReconnectAttempts) {
      console.error('🔴 Max reconnection attempts reached');
      return false;
    }

    const delay = calculateBackoffDelay(health.reconnectAttempts);
    console.log(`🔄 Scheduling reconnect in ${delay}ms (attempt ${health.reconnectAttempts + 1})`);
    
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    reconnectTimeoutRef.current = setTimeout(() => {
      setHealth(prev => ({ 
        ...prev, 
        reconnectAttempts: prev.reconnectAttempts + 1,
        status: 'connecting'
      }));
      onReconnect();
    }, delay);

    return true;
  }, [health.reconnectAttempts, calculateBackoffDelay]);

  const resetReconnectAttempts = useCallback(() => {
    setHealth(prev => ({ ...prev, reconnectAttempts: 0 }));
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
    };
  }, []);

  return {
    health,
    handleConnectionStatus,
    scheduleReconnect,
    resetReconnectAttempts
  };
}
