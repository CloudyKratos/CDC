
import { useState, useEffect } from 'react';
import { ChatChannel } from '@/types/chat';
import CommunityService from '@/services/community/CommunityService';
import { toast } from 'sonner';

interface UseChannelData {
  channels: ChatChannel[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useChannelData(serverId: string, activeChannel: string): UseChannelData {
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadChannels = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('Loading channels for server:', serverId);
      const channelsData = await CommunityService.getChannels();
      console.log('Channels loaded:', channelsData);
      
      setChannels(channelsData);
    } catch (error) {
      console.error('Error loading channels:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load channels';
      setError(errorMessage);
      
      // Don't show toast error for channel loading - it's handled gracefully
      console.log('Channel loading failed, using fallback channels');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadChannels();
  }, [serverId, activeChannel]);

  return {
    channels,
    isLoading,
    error,
    refetch: loadChannels
  };
}
