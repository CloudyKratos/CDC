
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { ChatChannel, ChannelType } from '@/types/chat';
import { toast } from 'sonner';

interface UseCommunityData {
  channels: ChatChannel[];
  isLoading: boolean;
  error: string | null;
  refreshChannels: () => Promise<void>;
}

export function useCommunityData(): UseCommunityData {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  const loadChannels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading channels from database...');
      
      const { data: channels, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'public')
        .order('name');

      if (channelsError) {
        console.error('❌ Error fetching channels:', channelsError);
        throw new Error(`Failed to fetch channels: ${channelsError.message}`);
      }

      console.log('✅ Channels loaded from database:', channels?.length || 0, channels);
      
      if (!channels || channels.length === 0) {
        console.log('⚠️ No channels found in database, using fallback channels');
        const fallbackChannels: ChatChannel[] = [
          { 
            id: 'general', 
            name: 'general', 
            type: ChannelType.PUBLIC, 
            members: [], 
            description: 'General discussion and community chat' 
          }
        ];
        setChannels(fallbackChannels);
        return;
      }

      const formattedChannels: ChatChannel[] = channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: ChannelType.PUBLIC,
        members: [],
        description: channel.description || `${channel.name.charAt(0).toUpperCase() + channel.name.slice(1)} channel`
      }));

      setChannels(formattedChannels);
      console.log('✅ Formatted channels:', formattedChannels);
      
    } catch (error) {
      console.error('💥 Exception loading channels:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load channels';
      setError(errorMessage);
      
      // Fallback to default channels on error
      const fallbackChannels: ChatChannel[] = [
        { 
          id: 'general', 
          name: 'general', 
          type: ChannelType.PUBLIC, 
          members: [], 
          description: 'General discussion and community chat' 
        },
        { 
          id: 'morning-journey', 
          name: 'morning journey', 
          type: ChannelType.PUBLIC, 
          members: [], 
          description: 'Start your day with motivation and morning routines' 
        },
        { 
          id: 'announcement', 
          name: 'announcement', 
          type: ChannelType.PUBLIC, 
          members: [], 
          description: 'Important announcements and updates' 
        }
      ];
      setChannels(fallbackChannels);
      
      // Show toast notification for the error
      toast.error('Failed to load channels from database, using default channels');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadChannels();
    }
  }, [loadChannels, user?.id]);

  return {
    channels,
    isLoading,
    error,
    refreshChannels: loadChannels
  };
}
