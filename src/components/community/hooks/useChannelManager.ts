
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useChannelManager() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();

  const getOrCreateChannel = useCallback(async (name: string) => {
    if (!user?.id) return null;

    try {
      console.log('🔍 Getting/creating channel:', name);
      
      // First try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', name)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError) {
        console.error('❌ Error checking for channel:', channelError);
        throw channelError;
      }

      if (!channel) {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', name);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: name,
            type: 'public',
            description: `${name.charAt(0).toUpperCase() + name.slice(1)} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating channel:', createError);
          throw createError;
        }
        
        channel = newChannel;
      }

      console.log('✅ Channel ready:', channel.id);
      return channel.id;
    } catch (err) {
      console.error('💥 Error in getOrCreateChannel:', err);
      throw err;
    }
  }, [user?.id]);

  return {
    channelId,
    setChannelId,
    getOrCreateChannel
  };
}
