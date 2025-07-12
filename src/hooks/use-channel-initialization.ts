import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useChannelInitialization = (channelName: string) => {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeChannel = useCallback(async () => {
    if (!user?.id) {
      setError('User not authenticated');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Check if the channel exists
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError) {
        throw new Error(`Channel lookup failed: ${channelError.message}`);
      }

      if (!channel) {
        // Create the channel if it doesn't exist
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

      setChannelId(channel.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize channel');
    } finally {
      setIsLoading(false);
    }
  }, [channelName, user?.id]);

  useEffect(() => {
    initializeChannel();
  }, [initializeChannel]);

  return { channelId, isLoading, error };
};

