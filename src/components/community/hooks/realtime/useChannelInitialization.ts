
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useChannelInitialization() {
  const [channelId, setChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  const initializeChannel = useCallback(async (channelName: string) => {
    if (!user?.id) {
      setIsLoading(false);
      return null;
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
        // Create channel if it doesn't exist
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
          console.error('❌ Error creating channel:', createError);
          setIsLoading(false);
          return null;
        }
        
        channel = newChannel;
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        setIsLoading(false);
        return null;
      }

      setChannelId(channel.id);
      console.log('✅ Channel ready:', channel.id);
      setIsLoading(false);
      return channel.id;
      
    } catch (error) {
      console.error('💥 Failed to initialize channel:', error);
      setIsLoading(false);
      return null;
    }
  }, [user?.id]);

  return {
    channelId,
    isLoading,
    initializeChannel
  };
}
