
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
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .eq('type', 'public')
      .order('name');

    if (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }

    return channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: ChannelType.PUBLIC,
      members: [], // Will be populated separately if needed
      description: channel.description
    }));
  }

  // Get messages for a specific channel
  async getMessages(channelName: string): Promise<Message[]> {
    // First get the channel ID by name
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', channelName)
      .single();

    if (channelError || !channel) {
      console.error('Error finding channel:', channelError);
      return [];
    }

    const { data: messages, error } = await supabase
      .from('community_messages')
      .select(`
        *,
        sender:profiles(id, username, full_name, avatar_url)
      `)
      .eq('channel_id', channel.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      sender: msg.sender
    }));
  }

  // Send a message to a channel
  async sendMessage(content: string, channelName: string = 'general'): Promise<Message> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User must be authenticated to send messages');
    }

    // Get channel ID
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', channelName)
      .single();

    if (channelError || !channel) {
      throw new Error('Channel not found');
    }

    // Auto-join the user to the channel if not already a member
    await this.joinChannel(channelName, user.id);

    const { data: message, error } = await supabase
      .from('community_messages')
      .insert({
        channel_id: channel.id,
        sender_id: user.id,
        content: content.trim()
      })
      .select(`
        *,
        sender:profiles(id, username, full_name, avatar_url)
      `)
      .single();

    if (error) {
      console.error('Error sending message:', error);
      throw error;
    }

    return {
      id: message.id,
      content: message.content,
      created_at: message.created_at,
      sender_id: message.sender_id,
      sender: message.sender
    };
  }

  // Join a channel
  async joinChannel(channelName: string, userId: string): Promise<void> {
    // Get channel ID
    const { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', channelName)
      .single();

    if (channelError || !channel) {
      throw new Error('Channel not found');
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
      console.error('Error joining channel:', error);
      throw error;
    }
  }

  // Subscribe to new messages in a channel
  subscribeToMessages(channelName: string, callback: (message: Message) => void): () => void {
    let channelId: string;

    // Get channel ID first
    supabase
      .from('channels')
      .select('id')
      .eq('name', channelName)
      .single()
      .then(({ data: channel, error }) => {
        if (error || !channel) {
          console.error('Error finding channel for subscription:', error);
          return;
        }
        
        channelId = channel.id;
      });

    const subscription = supabase
      .channel('community_messages_changes')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelId}`
        },
        async (payload) => {
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
            sender: sender
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    const { error } = await supabase
      .from('community_messages')
      .update({ is_deleted: true })
      .eq('id', messageId);

    if (error) {
      console.error('Error deleting message:', error);
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
