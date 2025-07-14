
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
      
      console.log('🔄 Loading channels...');
      
      const { data: channels, error: channelsError } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'public')
        .order('name');

      if (channelsError) {
        console.error('❌ Error fetching channels:', channelsError);
        // Create default channels if none exist
        const defaultChannels: ChatChannel[] = [
          { id: 'general', name: 'general', type: ChannelType.PUBLIC, members: [], description: 'General discussion' },
          { id: 'announcements', name: 'announcements', type: ChannelType.PUBLIC, members: [], description: 'Important announcements' },
          { id: 'entrepreneurs', name: 'entrepreneurs', type: ChannelType.PUBLIC, members: [], description: 'Entrepreneurial discussions' },
          { id: 'tech-talk', name: 'tech-talk', type: ChannelType.PUBLIC, members: [], description: 'Technology discussions' }
        ];
        setChannels(defaultChannels);
        return;
      }

      console.log('✅ Channels loaded:', channels?.length || 0);
      
      if (!channels || channels.length === 0) {
        const defaultChannels: ChatChannel[] = [
          { id: 'general', name: 'general', type: ChannelType.PUBLIC, members: [], description: 'General discussion' },
          { id: 'announcements', name: 'announcements', type: ChannelType.PUBLIC, members: [], description: 'Important announcements' },
          { id: 'entrepreneurs', name: 'entrepreneurs', type: ChannelType.PUBLIC, members: [], description: 'Entrepreneurial discussions' },
          { id: 'tech-talk', name: 'tech-talk', type: ChannelType.PUBLIC, members: [], description: 'Technology discussions' }
        ];
        setChannels(defaultChannels);
        return;
      }

      const formattedChannels: ChatChannel[] = channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: ChannelType.PUBLIC,
        members: [],
        description: channel.description || `${channel.name} channel`
      }));

      setChannels(formattedChannels);
    } catch (error) {
      console.error('💥 Exception loading channels:', error);
      setError('Failed to load channels');
      
      // Fallback to default channels
      const defaultChannels: ChatChannel[] = [
        { id: 'general', name: 'general', type: ChannelType.PUBLIC, members: [], description: 'General discussion' }
      ];
      setChannels(defaultChannels);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  return {
    channels,
    isLoading,
    error,
    refreshChannels: loadChannels
  };
}
