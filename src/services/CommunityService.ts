
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
    console.log('Fetching channels...');
    const { data: channels, error } = await supabase
      .from('channels')
      .select('*')
      .eq('type', 'public')
      .order('name');

    if (error) {
      console.error('Error fetching channels:', error);
      throw error;
    }

    console.log('Channels fetched:', channels);
    return channels.map(channel => ({
      id: channel.id,
      name: channel.name,
      type: ChannelType.PUBLIC,
      members: [],
      description: channel.description
    }));
  }

  // Get messages for a specific channel
  async getMessages(channelName: string): Promise<Message[]> {
    console.log('Fetching messages for channel:', channelName);
    
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

    console.log('Found channel:', channel);

    // Get messages
    const { data: messages, error } = await supabase
      .from('community_messages')
      .select(`
        id,
        content,
        created_at,
        sender_id
      `)
      .eq('channel_id', channel.id)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    console.log('Messages fetched:', messages);

    // Get sender details separately
    const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
    const { data: senders } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .in('id', senderIds);

    console.log('Senders fetched:', senders);

    // Create a map of senders for quick lookup
    const sendersMap = new Map();
    if (senders) {
      senders.forEach(sender => {
        sendersMap.set(sender.id, sender);
      });
    }

    return messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      created_at: msg.created_at,
      sender_id: msg.sender_id,
      sender: sendersMap.get(msg.sender_id) || {
        id: msg.sender_id,
        username: 'Unknown User',
        full_name: 'Unknown User',
        avatar_url: null
      }
    }));
  }

  // Send a message to a channel
  async sendMessage(content: string, channelName: string = 'general'): Promise<Message> {
    console.log('Sending message:', { content, channelName });
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.error('No authenticated user found');
      throw new Error('User must be authenticated to send messages');
    }

    console.log('Authenticated user:', user.id);

    // Get or create channel
    let { data: channel, error: channelError } = await supabase
      .from('channels')
      .select('id')
      .eq('name', channelName)
      .single();

    if (channelError || !channel) {
      console.log('Channel not found, creating it...');
      // Create the channel if it doesn't exist
      const { data: newChannel, error: createError } = await supabase
        .from('channels')
        .insert({
          name: channelName,
          type: 'public',
          description: `${channelName} channel`
        })
        .select('id')
        .single();

      if (createError) {
        console.error('Error creating channel:', createError);
        throw createError;
      }
      
      channel = newChannel;
    }

    console.log('Using channel:', channel);

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
      console.error('Error sending message:', error);
      throw error;
    }

    console.log('Message sent:', message);

    // Get sender details
    const { data: sender } = await supabase
      .from('profiles')
      .select('id, username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    console.log('Sender details:', sender);

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
  }

  // Join a channel
  async joinChannel(channelName: string, userId: string): Promise<void> {
    console.log('Joining channel:', { channelName, userId });
    
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

    console.log('Successfully joined channel');
  }

  // Subscribe to new messages in a channel
  subscribeToMessages(channelName: string, callback: (message: Message) => void): () => void {
    console.log('Setting up subscription for channel:', channelName);
    
    // First get the channel ID
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
        
        console.log('Channel found for subscription:', channel);
        
        const subscription = supabase
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
              console.log('New message received:', payload);
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

        console.log('Subscription created:', subscription);
      });

    return () => {
      console.log('Cleaning up subscription');
      // This will be handled by the effect cleanup
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
