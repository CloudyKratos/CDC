import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useStageConnection = (stageId: string) => {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const connectToStage = useCallback(async () => {
    if (!user?.id || !stageId) {
      setError('User or Stage ID missing');
      return;
    }

    try {
      const channel = supabase.channel(`stage:${stageId}`);

      channel.on('presence', { event: 'sync' }, () => {
        console.log('Presence sync event');
      })
      .on('presence', { event: 'join' }, (payload) => {
        console.log('User joined stage', payload);
      })
      .on('presence', { event: 'leave' }, (payload) => {
        console.log('User left stage', payload);
      })
      .subscribe(async (status) => {
        console.log(`Realtime subscription status: ${status}`);
        setIsConnected(status === 'SUBSCRIBED');

        if (status === 'SUBSCRIBED') {
          await channel.track({ user_id: user.id, metadata: { /* any metadata */ } });
        }
      });

      return () => {
        supabase.removeChannel(channel);
      };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to connect to stage');
    }
  }, [stageId, user?.id]);

  useEffect(() => {
    const cleanup = connectToStage();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [connectToStage]);

  return { isConnected, error };
};
