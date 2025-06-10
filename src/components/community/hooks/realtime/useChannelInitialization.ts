
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseChannelInitialization {
  channelId: string | null;
  initializeChannel: () => Promise<string | null>;
}

export function useChannelInitialization(channelName: string): UseChannelInitialization {
  const [channelId, setChannelId] = useState<string | null>(null);
  const { user } = useAuth();

  const initializeChannel = useCallback(async () => {
    if (!user?.id) {
      console.log('⚠️ No authenticated user, skipping channel initialization');
      return null;
    }

    try {
      console.log('🔄 Initializing channel:', channelName);
      
      // First try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
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
          throw createError;
        }
        
        channel = newChannel;
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        throw channelError;
      }

      console.log('✅ Channel ready:', channel);
      setChannelId(channel.id);
      
      // Auto-join the user to the channel (ignore errors if already joined)
      try {
        await supabase
          .from('channel_members')
          .insert({
            channel_id: channel.id,
            user_id: user.id
          });
      } catch (joinError) {
        // Ignore duplicate key errors
        console.log('🔄 User already in channel or join error (ignored):', joinError);
      }

      return channel.id;
    } catch (error) {
      console.error('💥 Failed to initialize channel:', error);
      throw error;
    }
  }, [channelName, user?.id]);

  return {
    channelId,
    initializeChannel
  };
}
