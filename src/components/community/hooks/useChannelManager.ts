
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useChannelManager() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();

  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id || !channelName) return null;

    try {
      console.log('🔍 Getting/creating channel:', channelName);

      // First, try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Channel lookup failed: ${channelError.message}`);
      }

      // If channel doesn't exist, create it
      if (!channel) {
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

      console.log('✅ Channel ready:', channel.id);
      return channel.id;

    } catch (err) {
      console.error('💥 Failed to get/create channel:', err);
      throw err;
    }
  }, [user?.id]);

  return {
    channelId,
    setChannelId,
    getOrCreateChannel
  };
}
