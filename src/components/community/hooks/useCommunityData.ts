import { useState, useEffect, useCallback, useRef } from 'react';
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

// Default channels that should always exist in specific order
const DEFAULT_CHANNELS = [
  { 
    name: 'announcement', 
    description: 'Important announcements and updates' 
  },
  { 
    name: 'general', 
    description: 'General discussion and community chat' 
  },
  { 
    name: 'morning journey', 
    description: 'Start your day with motivation and morning routines' 
  },
  { 
    name: 'random', 
    description: 'Random conversations and off-topic discussions' 
  }
];

export function useCommunityData(): UseCommunityData {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasInitialized = useRef(false);
  
  const { user } = useAuth();

  const loadChannels = useCallback(async () => {
    // Prevent multiple simultaneous calls
    if (hasInitialized.current && isLoading) {
      console.log('⚠️ Load channels already in progress, skipping');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      
      console.log('🔄 Loading channels from database...');
      
      const { data: channelsData, error: channelsError } = await supabase
        .from('channels')
        .select('id, name, type, description, created_at')
        .eq('type', 'public')
        .order('name');

      if (channelsError) {
        console.error('❌ Error fetching channels:', channelsError);
        throw new Error(`Failed to fetch channels: ${channelsError.message}`);
      }

      console.log('✅ Raw channels loaded:', channelsData?.length || 0);

      if (!channelsData || channelsData.length === 0) {
        console.log('⚠️ No channels found, using fallback');
        const fallbackChannels = createFallbackChannels();
        setChannels(fallbackChannels);
        hasInitialized.current = true;
        return;
      }

      // Deduplicate channels by name (keep the newest one)
      const uniqueChannelsMap = new Map<string, any>();
      channelsData.forEach(channel => {
        const existing = uniqueChannelsMap.get(channel.name);
        if (!existing || new Date(channel.created_at) > new Date(existing.created_at)) {
          uniqueChannelsMap.set(channel.name, channel);
        }
      });

      const uniqueChannels = Array.from(uniqueChannelsMap.values());
      console.log('✅ Unique channels after deduplication:', uniqueChannels.length);

      const formattedChannels: ChatChannel[] = uniqueChannels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: ChannelType.PUBLIC,
        members: [],
        description: channel.description || getDefaultDescription(channel.name)
      }));

      // Ensure we have the default channels
      const channelNames = new Set(formattedChannels.map(ch => ch.name));
      DEFAULT_CHANNELS.forEach(defaultChannel => {
        if (!channelNames.has(defaultChannel.name)) {
          // Add missing default channel as fallback
          formattedChannels.push({
            id: `fallback-${defaultChannel.name}`,
            name: defaultChannel.name,
            type: ChannelType.PUBLIC,
            members: [],
            description: defaultChannel.description
          });
        }
      });

      setChannels(formattedChannels);
      hasInitialized.current = true;
      console.log('✅ Final formatted channels:', formattedChannels.length);
      
    } catch (error) {
      console.error('💥 Exception loading channels:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load channels';
      setError(errorMessage);
      
      // Use fallback channels on error
      const fallbackChannels = createFallbackChannels();
      setChannels(fallbackChannels);
      hasInitialized.current = true;
      
      toast.error('Using default channels due to loading error');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const createFallbackChannels = (): ChatChannel[] => {
    return DEFAULT_CHANNELS.map(channel => ({
      id: `fallback-${channel.name}`,
      name: channel.name,
      type: ChannelType.PUBLIC,
      members: [],
      description: channel.description
    }));
  };

  const getDefaultDescription = (name: string): string => {
    const defaultChannel = DEFAULT_CHANNELS.find(ch => ch.name === name);
    return defaultChannel?.description || `${name.charAt(0).toUpperCase() + name.slice(1)} channel`;
  };

  useEffect(() => {
    if (user?.id && !hasInitialized.current) {
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
