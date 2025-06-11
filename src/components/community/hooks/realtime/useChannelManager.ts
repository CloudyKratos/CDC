
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseChannelManager {
  channelId: string | null;
  initializeChannel: () => Promise<string | null>;
}

export function useChannelManager(channelName: string): UseChannelManager {
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeChannel = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No authenticated user, using channel name as fallback');
      setChannelId(channelName);
      return channelName;
    }

    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .single();

      if (channelError && channelError.code === 'PGRST116') {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating channel:', createError);
          setChannelId(channelName);
          return channelName;
        }
        
        channel = newChannel;
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        setChannelId(channelName);
        return channelName;
      }

      console.log('✅ Channel ready:', channel);
      setChannelId(channel.id);
      return channel.id;
    } catch (error) {
      console.error('💥 Failed to initialize channel:', error);
      setChannelId(channelName);
      return channelName;
    }
  }, [channelName, user?.id]);

  return {
    channelId,
    initializeChannel
  };
}
