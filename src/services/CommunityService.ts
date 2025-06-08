
import { supabase } from '@/integrations/supabase/client';
import { Message, ChatChannel, ChannelType } from '@/types/chat';

export interface CommunityMessage {
  id: string;
  channel_id: string;
  sender_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_deleted: boolean;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Channel {
  id: string;
  name: string;
  description?: string;
  type: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

class CommunityService {
  // Get all available channels
  async getChannels(): Promise<ChatChannel[]> {
    console.log('🔄 CommunityService: Fetching channels...');
    
    try {
      const { data: channels, error } = await supabase
        .from('channels')
        .select('*')
        .eq('type', 'public')
        .order('name');

      if (error) {
        console.error('❌ CommunityService: Error fetching channels:', error);
        throw new Error(`Failed to fetch channels: ${error.message}`);
      }

      console.log('✅ CommunityService: Channels fetched successfully:', channels);
      
      if (!channels || channels.length === 0) {
        console.log('📝 CommunityService: No channels found, creating default channels...');
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
      console.error('💥 CommunityService: Exception in getChannels:', error);
      return this.createDefaultChannels();
    }
  }

  // Create default channels as fallback
  private createDefaultChannels(): ChatChannel[] {
    console.log('🔧 CommunityService: Creating default channels fallback');
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

  // Get messages for a specific channel
  async getMessages(channelName: string): Promise<Message[]> {
    console.log('🔄 CommunityService: Fetching messages for channel:', channelName);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ CommunityService: Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        console.log('⚠️ CommunityService: No authenticated user');
        return [];
      }

      // First get the channel ID by name
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (channelError) {
        console.error('❌ CommunityService: Error finding channel:', channelError);
        
        if (channelError.code === 'PGRST116') {
          console.log('📝 CommunityService: Channel not found, will create when first message is sent');
          return [];
        }
        
        throw new Error(`Channel not found: ${channelError.message}`);
      }

      console.log('✅ CommunityService: Found channel:', channel);

      // Get messages with sender details
      const { data: messages, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles!community_messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .eq('channel_id', channel.id)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ CommunityService: Error fetching messages:', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      console.log('✅ CommunityService: Messages fetched:', messages?.length || 0);

      if (!messages || messages.length === 0) {
        return [];
      }

      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));
    } catch (error) {
      console.error('💥 CommunityService: Exception in getMessages:', error);
      throw error;
    }
  }

  // Send a message to a channel
  async sendMessage(content: string, channelName: string = 'general'): Promise<Message> {
    console.log('🔄 CommunityService: Sending message:', { content, channelName });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ CommunityService: No authenticated user found');
        throw new Error('User must be authenticated to send messages');
      }

      console.log('✅ CommunityService: Authenticated user:', user.id);

      // Get or create channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (channelError || !channel) {
        console.log('📝 CommunityService: Channel not found, creating it...');
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName} channel`,
            created_by: user.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ CommunityService: Error creating channel:', createError);
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
      }

      console.log('✅ CommunityService: Using channel:', channel);

      // Auto-join the user to the channel if not already a member
      await this.joinChannel(channelName, user.id);

      const { data: message, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channel.id,
          sender_id: user.id,
          content: content.trim()
        })
        .select('id, content, created_at, sender_id')
        .single();

      if (error) {
        console.error('❌ CommunityService: Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ CommunityService: Message sent:', message);

      // Get sender details
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      console.log('✅ CommunityService: Sender details:', sender);

      return {
        id: message.id,
        content: message.content,
        created_at: message.created_at,
        sender_id: message.sender_id,
        sender: sender || {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: null
        }
      };
    } catch (error) {
      console.error('💥 CommunityService: Exception in sendMessage:', error);
      throw error;
    }
  }

  // Join a channel
  async joinChannel(channelName: string, userId: string): Promise<void> {
    console.log('🔄 CommunityService: Joining channel:', { channelName, userId });
    
    try {
      // Get channel ID
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (channelError || !channel) {
        console.log('⚠️ CommunityService: Channel not found for joining');
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
      if (error && !error.message.includes('duplicate key')) {
        console.error('❌ CommunityService: Error joining channel:', error);
        // Don't throw error for joining channel issues
      }

      console.log('✅ CommunityService: Successfully joined channel');
    } catch (error) {
      console.error('💥 CommunityService: Exception in joinChannel:', error);
      // Don't throw error for joining channel issues
    }
  }

  // Subscribe to new messages in a channel
  subscribeToMessages(channelName: string, callback: (message: Message) => void): () => void {
    console.log('🔄 CommunityService: Setting up subscription for channel:', channelName);
    
    let subscription: any = null;
    
    const setupSubscription = async () => {
      try {
        const { data: channel, error } = await supabase
          .from('channels')
          .select('id')
          .eq('name', channelName)
          .single();

        if (error || !channel) {
          console.error('❌ CommunityService: Error finding channel for subscription:', error);
          return;
        }
        
        console.log('✅ CommunityService: Channel found for subscription:', channel);
        
        subscription = supabase
          .channel(`community_messages_${channel.id}`)
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'community_messages',
              filter: `channel_id=eq.${channel.id}`
            },
            async (payload) => {
              console.log('📨 CommunityService: New message received:', payload);
              const newMessage = payload.new as CommunityMessage;
              
              // Fetch sender details
              const { data: sender } = await supabase
                .from('profiles')
                .select('id, username, full_name, avatar_url')
                .eq('id', newMessage.sender_id)
                .single();

              callback({
                id: newMessage.id,
                content: newMessage.content,
                created_at: newMessage.created_at,
                sender_id: newMessage.sender_id,
                sender: sender || {
                  id: newMessage.sender_id,
                  username: 'Unknown User',
                  full_name: 'Unknown User',
                  avatar_url: null
                }
              });
            }
          )
          .subscribe();

        console.log('✅ CommunityService: Subscription created:', subscription);
      } catch (error) {
        console.error('💥 CommunityService: Exception setting up subscription:', error);
      }
    };

    // Execute the async setup
    setupSubscription();

    return () => {
      console.log('🧹 CommunityService: Cleaning up subscription');
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) {
        console.error('❌ CommunityService: Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }
    } catch (error) {
      console.error('💥 CommunityService: Exception in deleteMessage:', error);
      throw error;
    }
  }

  // Get online users in a channel
  async getChannelOnlineUsers(channelName: string): Promise<any[]> {
    // This would need to be implemented with presence tracking
    // For now, return empty array
    return [];
  }
}

export default new CommunityService();
