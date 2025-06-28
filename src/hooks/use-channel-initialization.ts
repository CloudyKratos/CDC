
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useChannelInitialization() {
  const [isInitializing, setIsInitializing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();
  
  const cleanupRef = useRef<(() => void) | null>(null);

  const initializeChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    setIsInitializing(true);
    setError(null);

    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // First try to get existing channel
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
        // Create new channel
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} discussion`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      }

      // Auto-join user to channel
      const { error: joinError } = await supabase
        .from('channel_members')
        .upsert({
          channel_id: channel.id,
          user_id: user.id,
          role: 'member'
        }, { onConflict: 'user_id,channel_id' });

      if (joinError && !joinError.message.includes('duplicate')) {
        console.warn('⚠️ Could not join channel:', joinError);
      }

      console.log('✅ Channel initialized successfully:', channel.id);
      setRetryCount(0);
      setChannelId(channel.id);
      return channel.id;
      
    } catch (err) {
      console.error('❌ Failed to initialize channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      
      // Auto-retry with exponential backoff
      if (retryCount < 3) {
        const delay = Math.pow(2, retryCount) * 1000;
        console.log(`🔄 Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
        setRetryCount(prev => prev + 1);
        
        setTimeout(() => {
          initializeChannel(channelName);
        }, delay);
      } else {
        toast.error('Failed to connect to chat after multiple attempts');
      }
      
      return null;
    } finally {
      setIsInitializing(false);
    }
  }, [user?.id, retryCount]);

  const resetRetryCount = useCallback(() => {
    setRetryCount(0);
    setError(null);
  }, []);

  const cleanup = useCallback(() => {
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }
    setChannelId(null);
    setError(null);
    setRetryCount(0);
  }, []);

  return {
    initializeChannel,
    isInitializing,
    error,
    retryCount,
    resetRetryCount,
    channelId,
    cleanup
  };
}
