
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useChannelInitialization() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    try {
      setError(null);
      console.log('🔄 Initializing channel:', channelName);

      // Get or create channel
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
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      }

      // Auto-join the user to the channel
      const { error: memberError } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: user.id
        })
        .select()
        .single();

      // Ignore unique constraint violations (user already in channel)
      if (memberError && !memberError.message.includes('duplicate key') && !memberError.message.includes('unique')) {
        console.warn('⚠️ Could not add user to channel:', memberError);
      }

      setChannelId(channel.id);
      console.log('✅ Channel initialized:', channel.id);
      return channel.id;

    } catch (err) {
      console.error('💥 Failed to initialize channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to initialize channel';
      setError(errorMessage);
      return null;
    }
  }, [user?.id]);

  const cleanup = useCallback(() => {
    setChannelId(null);
    setError(null);
  }, []);

  return {
    channelId,
    error,
    initializeChannel,
    cleanup
  };
}
