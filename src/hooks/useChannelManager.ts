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

// Global cache to prevent duplicate channel creation
const channelCache = new Map<string, Promise<string | null>>();
const createdChannels = new Set<string>();

export function useChannelManager() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [activeChannelId, setActiveChannelId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { user } = useAuth();

  // Clear cache when user changes
  const clearCache = useCallback(() => {
    channelCache.clear();
    createdChannels.clear();
  }, []);

  // Get or create channel with proper deduplication
  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      console.error('❌ User not authenticated');
      setError('User not authenticated');
      return null;
    }

    const normalizedName = channelName.toLowerCase().trim();
    
    // Check if we're already creating this channel
    if (channelCache.has(normalizedName)) {
      console.log('🔄 Using cached channel creation promise for:', normalizedName);
      return channelCache.get(normalizedName)!;
    }

    // Create the promise and cache it immediately
    const channelPromise = createChannelSafely(normalizedName);
    channelCache.set(normalizedName, channelPromise);

    return channelPromise;
  }, [user?.id]);

  const createChannelSafely = async (channelName: string): Promise<string | null> => {
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔍 Checking for existing channel:', channelName);
      
      // First, try to get existing channel with exact name match
      const { data: existingChannel, error: fetchError } = await supabase
        .from('channels')
        .select('id, name, type, created_at')
        .eq('name', channelName)
        .eq('type', 'public')
        .limit(1)
        .single();

      if (!fetchError && existingChannel) {
        console.log('✅ Found existing channel:', existingChannel.id);
        createdChannels.add(channelName);
        return existingChannel.id;
      }

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error('❌ Error fetching channel:', fetchError);
        throw new Error(`Failed to fetch channel: ${fetchError.message}`);
      }

      // Only create if we haven't created this channel name before
      if (createdChannels.has(channelName)) {
        console.log('⚠️ Channel creation already attempted for:', channelName);
        // Try to find it again
        const { data: retryChannel } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName)
          .eq('type', 'public')
          .limit(1)
          .single();
        
        return retryChannel?.id || null;
      }

      // Create new channel
      console.log('📝 Creating new channel:', channelName);
      createdChannels.add(channelName);
      
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          description: getChannelDescription(channelName),
          created_by: user.id
        })
        .select('id, name, type, created_at')
        .single();

      if (createError) {
        createdChannels.delete(channelName);
        console.error('❌ Error creating channel:', createError);
        
        // If it's a unique constraint violation, try to find the existing channel
        if (createError.code === '23505') {
          console.log('🔄 Channel already exists, fetching it...');
          const { data: existingAfterError } = await supabase
            .from('channels')
            .select('id')
            .eq('name', channelName)
            .eq('type', 'public')
            .limit(1)
            .single();
          
          if (existingAfterError) {
            return existingAfterError.id;
          }
        }
        
        throw new Error(`Failed to create channel: ${createError.message}`);
      }
      
      console.log('✅ Created new channel:', newChannel.id);
      
      // Add to channels list if not already present
      setChannels(prev => {
        const exists = prev.some(ch => ch.id === newChannel.id);
        if (exists) return prev;
        return [...prev, newChannel];
      });
      
      return newChannel.id;
      
    } catch (err) {
      createdChannels.delete(channelName);
      console.error('❌ Failed to get/create channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Get channel description based on name
  const getChannelDescription = (name: string): string => {
    switch (name.toLowerCase()) {
      case 'general':
        return 'General discussion and community chat';
      case 'morning journey':
      case 'morning-journey':
        return 'Start your day with motivation and morning routines';
      case 'announcement':
      case 'announcements':
        return 'Important announcements and updates';
      default:
        return `${name.charAt(0).toUpperCase() + name.slice(1)} discussion`;
    }
  };

  // Load available channels (deduplicated)
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

      // Deduplicate channels by name (keep the first one)
      const uniqueChannels = new Map<string, any>();
      channelsData?.forEach(channel => {
        if (!uniqueChannels.has(channel.name)) {
          uniqueChannels.set(channel.name, channel);
        }
      });

      const formattedChannels = Array.from(uniqueChannels.values()).map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        created_at: channel.created_at,
        member_count: 0
      }));

      setChannels(formattedChannels);
      console.log('✅ Loaded', formattedChannels.length, 'unique channels');
      
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
    getChannelInfo,
    clearCache
  };
}
