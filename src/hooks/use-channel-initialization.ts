
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChannelInitialization() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  
  const isInitializingRef = useRef(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const initializeChannel = useCallback(async (channelName: string) => {
    if (!user?.id || !channelName || isInitializingRef.current) {
      return;
    }

    isInitializingRef.current = true;
    
    try {
      console.log('🔄 Initializing channel:', channelName);
      
      setError(null);
      
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Failed to find channel: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 Creating channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} community channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
        toast.success(`Created #${channelName} channel`, { duration: 2000 });
      }

      setChannelId(channel.id);
      setError(null);
      setReconnectAttempts(0);
      console.log('✅ Channel initialized:', channel.id);
      
    } catch (err) {
      console.error('❌ Failed to initialize channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize channel';
      setError(errorMessage);
      
      if (reconnectAttempts < 3) {
        const delay = Math.min(Math.pow(2, reconnectAttempts) * 1000, 10000);
        console.log(`🔄 Retrying in ${delay}ms (attempt ${reconnectAttempts + 1}/3)`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          setReconnectAttempts(prev => prev + 1);
          isInitializingRef.current = false;
          initializeChannel(channelName);
        }, delay);
      }
    } finally {
      if (reconnectAttempts === 0) {
        isInitializingRef.current = false;
      }
    }
  }, [user?.id, reconnectAttempts]);

  const cleanup = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  return {
    channelId,
    error,
    reconnectAttempts,
    initializeChannel,
    cleanup
  };
}
