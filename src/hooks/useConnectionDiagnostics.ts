import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/auth/AuthContext';

export function useConnectionDiagnostics() {
  const { user } = useAuth();
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');
  const [lastError, setLastError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setConnectionStatus('disconnected');
      return;
    }

    setConnectionStatus('connecting');

    const channel = supabase.channel('connection_diagnostics');

    channel.on('presence', { event: 'sync' }, () => {
      setConnectionStatus('connected');
      setLastError(null);
    });

    channel.on('broadcast', { event: 'error' }, (payload) => {
      setLastError(payload.message || 'Unknown error');
      setConnectionStatus('disconnected');
      toast.error(`Connection error: ${payload.message || 'Unknown error'}`);
    });

    channel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        setConnectionStatus('connected');
        setLastError(null);
      } else if (status === 'TIMED_OUT' || status === 'CLOSED' || status === 'CHANNEL_ERROR') {
        setConnectionStatus('disconnected');
        toast.error('Connection lost. Attempting to reconnect...');
      } else if (status === 'PENDING') {
        setConnectionStatus('connecting');
      }
    });

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  return {
    connectionStatus,
    lastError
  };
}
