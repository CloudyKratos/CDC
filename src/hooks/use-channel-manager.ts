
import { useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Channel {
  id: string;
  name: string;
  type: string;
  created_at: string;
  member_count?: number;
}

export function useChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Simplified channel creation/retrieval
  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      console.error('❌ User not authenticated');
      setError('User not authenticated');
      return null;
    }

    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Getting or creating channel:', channelName);
      
      // First, try to get existing channel
      const { data: existingChannel, error: fetchError } = await supabase
        .from('channels')
        .select('id, name, type, created_at')
        .eq('name', channelName)
        .eq('type', 'public')
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching channel:', fetchError);
        throw new Error(`Failed to fetch channel: ${fetchError.message}`);
      }

      if (existingChannel) {
        console.log('✅ Found existing channel:', existingChannel.id);
        return existingChannel.id;
      }

      // Create new channel if it doesn't exist
      console.log('📝 Creating new channel:', channelName);
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} discussion`,
          created_by: user.id
        })
        .select('id, name, type, created_at')
        .single();

      if (createError) {
        console.error('❌ Error creating channel:', createError);
        throw new Error(`Failed to create channel: ${createError.message}`);
      }
      
      console.log('✅ Created new channel:', newChannel.id);
      
      // Add to channels list
      setChannels(prev => [...prev, newChannel]);
      
      return newChannel.id;
      
    } catch (err) {
      console.error('❌ Failed to get/create channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Load available channels
  const loadChannels = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('📋 Loading available channels');
      
      const { data: channelsData, error } = await supabase
        .from('channels')
        .select('id, name, type, created_at')
        .eq('type', 'public')
        .order('name');

      if (error) {
        console.error('❌ Error loading channels:', error);
        setError('Failed to load channels');
        return;
      }

      const formattedChannels = channelsData?.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        created_at: channel.created_at,
        member_count: 0
      })) || [];

      setChannels(formattedChannels);
      console.log('✅ Loaded', formattedChannels.length, 'channels');
      
    } catch (error) {
      console.error('❌ Failed to load channels:', error);
      setError('Failed to load channels');
    }
  }, [user?.id]);

  // Set active channel
  const setActiveChannel = useCallback(async (channelName: string) => {
    console.log('🎯 Setting active channel:', channelName);
    const channelId = await getOrCreateChannel(channelName);
    if (channelId) {
      setActiveChannelId(channelId);
      console.log('✅ Active channel set:', channelId);
    }
    return channelId;
  }, [getOrCreateChannel]);

  // Get channel info by ID
  const getChannelInfo = useCallback((channelId: string) => {
    return channels.find(c => c.id === channelId);
  }, [channels]);

  return {
    channels,
    activeChannelId,
    isLoading,
    error,
    getOrCreateChannel,
    loadChannels,
    setActiveChannel,
    getChannelInfo
  };
}
