
import { useState, useEffect } from 'react';
import { ChatChannel, ChannelType } from '@/types/chat';
import CommunityService from '@/services/CommunityService';

interface UseChannelDataResult {
  channels: ChatChannel[];
  activeChannel: string;
  isLoading: boolean;
  error: Error | null;
  setActiveChannel: (channelId: string) => void;
}

export function useChannelData(serverId: string, initialChannel: string = 'general'): UseChannelDataResult {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [activeChannel, setActiveChannel] = useState(initialChannel);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    const fetchChannels = async () => {
      setIsLoading(true);
      
      try {
        const channelsData = await CommunityService.getChannels();
        // Filter public channels only - fixed comparison by using string literal
        setChannels(channelsData.filter(channel => channel.type === ChannelType.PUBLIC));
        setError(null);
      } catch (err) {
        console.error('Error fetching channels:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch channels'));
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchChannels();
  }, [serverId]);
  
  return {
    channels,
    activeChannel,
    isLoading,
    error,
    setActiveChannel
  };
}
