
import { supabase } from '@/integrations/supabase/client';
import { ChatChannel, ChannelType } from '@/types/chat';

class ChannelService {
  // Get all available channels
  async getChannels(): Promise<ChatChannel[]> {
    console.log('🔄 ChannelService: Fetching channels...');
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ ChannelService: Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        console.log('⚠️ ChannelService: No authenticated user');
        return this.createDefaultChannels();
      }

      const { data: channels, error } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'public')
        .order('name');

      if (error) {
        console.error('❌ ChannelService: Error fetching channels:', error);
        // Return default channels instead of throwing error
        return this.createDefaultChannels();
      }

      console.log('✅ ChannelService: Channels fetched successfully:', channels);
      
      if (!channels || channels.length === 0) {
        console.log('📝 ChannelService: No channels found, creating default channels...');
        return this.createDefaultChannels();
      }

      return channels.map(channel => ({
        id: channel.id,
        name: channel.name,
        type: ChannelType.PUBLIC,
        members: [],
        description: channel.description
      }));
    } catch (error) {
      console.error('💥 ChannelService: Exception in getChannels:', error);
      return this.createDefaultChannels();
    }
  }

  // Create default channels as fallback
  private createDefaultChannels(): ChatChannel[] {
    console.log('🔧 ChannelService: Creating default channels fallback');
    return [
      {
        id: 'general',
        name: 'general',
        type: ChannelType.PUBLIC,
        members: [],
        description: 'General discussion'
      },
      {
        id: 'announcements',
        name: 'announcements',
        type: ChannelType.PUBLIC,
        members: [],
        description: 'Important announcements'
      },
      {
        id: 'support',
        name: 'support',
        type: ChannelType.PUBLIC,
        members: [],
        description: 'Help and support'
      }
    ];
  }

  // Get or create channel with better error handling
  async getOrCreateChannel(channelName: string, userId: string): Promise<{ id: string }> {
    console.log('🔄 ChannelService: Getting or creating channel:', channelName);

    try {
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        console.error('❌ ChannelService: Error checking channel:', channelError);
        throw new Error(`Failed to check channel: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 ChannelService: Channel not found, creating it...');
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
            created_by: userId
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ ChannelService: Error creating channel:', createError);
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      }

      return channel;
    } catch (error) {
      console.error('💥 ChannelService: Exception in getOrCreateChannel:', error);
      throw error;
    }
  }

  // Join a channel with improved error handling
  async joinChannel(channelName: string, userId: string): Promise<void> {
    console.log('🔄 ChannelService: Joining channel:', { channelName, userId });
    
    try {
      // Get channel ID
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        console.error('❌ ChannelService: Error finding channel for joining:', channelError);
        return;
      }

      if (!channel) {
        console.log('⚠️ ChannelService: Channel not found for joining');
        return;
      }

      // Insert membership (will be ignored if already exists due to UNIQUE constraint)
      const { error } = await supabase
        .from('channel_members')
        .insert({
          channel_id: channel.id,
          user_id: userId
        });

      // Ignore unique constraint violations (user already in channel)
      if (error && !error.message.includes('duplicate key') && !error.message.includes('unique')) {
        console.error('❌ ChannelService: Error joining channel:', error);
        // Don't throw error for joining channel issues - it's not critical
      }

      console.log('✅ ChannelService: Successfully joined channel');
    } catch (error) {
      console.error('💥 ChannelService: Exception in joinChannel:', error);
      // Don't throw error for joining channel issues - it's not critical
    }
  }
}

export default new ChannelService();
