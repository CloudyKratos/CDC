
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
  const initializationRef = useRef<Set<string>>(new Set());

  // Get or create channel with robust error handling
  const getOrCreateChannel = useCallback(async (channelName: string): Promise<string | null> => {
    if (!user?.id) {
      setError('User not authenticated');
      return null;
    }

    // Prevent duplicate initialization
    const initKey = `${channelName}-${user.id}`;
    if (initializationRef.current.has(initKey)) {
      console.log('⏳ Channel initialization already in progress:', channelName);
      return null;
    }

    initializationRef.current.add(initKey);
    setIsLoading(true);
    setError(null);

    try {
      console.log('🔄 Getting or creating channel:', channelName);
      
      // First, try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id, name, type, created_at')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        throw new Error(`Failed to check channel: ${channelError.message}`);
      }

      if (!channel) {
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
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
        toast.success(`Created channel #${channelName}`);
      }

      // Auto-join user to channel
      await ensureUserInChannel(channel.id, user.id);

      // Update channels list
      setChannels(prev => {
        const exists = prev.some(c => c.id === channel!.id);
        if (exists) return prev;
        return [...prev, channel!];
      });

      console.log('✅ Channel ready:', channel.id);
      return channel.id;
      
    } catch (err) {
      console.error('❌ Failed to get/create channel:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      toast.error(`Failed to access channel: ${errorMessage}`);
      return null;
    } finally {
      setIsLoading(false);
      initializationRef.current.delete(initKey);
    }
  }, [user?.id]);

  // Ensure user is member of channel
  const ensureUserInChannel = useCallback(async (channelId: string, userId: string) => {
    try {
      console.log('👥 Ensuring user is in channel');
      
      const { error } = await supabase
        .from('channel_members')
        .upsert({
          channel_id: channelId,
          user_id: userId,
          role: 'member'
        }, { 
          onConflict: 'user_id,channel_id' 
        });

      if (error && !error.message.includes('duplicate')) {
        console.warn('⚠️ Could not join channel:', error);
      }
    } catch (error) {
      console.warn('⚠️ Error joining channel:', error);
    }
  }, []);

  // Load available channels
  const loadChannels = useCallback(async () => {
    if (!user?.id) return;

    try {
      console.log('📋 Loading available channels');
      
      const { data: channelsData, error } = await supabase
        .from('channels')
        .select(`
          id,
          name,
          type,
          created_at,
          channel_members(count)
        `)
        .eq('type', 'public')
        .order('name');

      if (error) {
        throw error;
      }

      const formattedChannels = channelsData?.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: channel.type,
        created_at: channel.created_at,
        member_count: Array.isArray(channel.channel_members) 
          ? channel.channel_members.length 
          : 0
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
    const channelId = await getOrCreateChannel(channelName);
    if (channelId) {
      setActiveChannelId(channelId);
      console.log('🎯 Active channel set to:', channelName, channelId);
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
