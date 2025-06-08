
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import type { CommunityMessage } from './types';
import ChannelService from './ChannelService';

class MessageService {
  // Get messages for a specific channel
  async getMessages(channelName: string): Promise<Message[]> {
    console.log('🔄 MessageService: Fetching messages for channel:', channelName);
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('❌ MessageService: Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        console.log('⚠️ MessageService: No authenticated user');
        return [];
      }

      // First get the channel ID by name
      const { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .single();

      if (channelError) {
        console.error('❌ MessageService: Error finding channel:', channelError);
        
        if (channelError.code === 'PGRST116') {
          console.log('📝 MessageService: Channel not found, will create when first message is sent');
          return [];
        }
        
        throw new Error(`Channel not found: ${channelError.message}`);
      }

      console.log('✅ MessageService: Found channel:', channel);

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
        console.error('❌ MessageService: Error fetching messages:', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      console.log('✅ MessageService: Messages fetched:', messages?.length || 0);

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
      console.error('💥 MessageService: Exception in getMessages:', error);
      throw error;
    }
  }

  // Send a message to a channel
  async sendMessage(content: string, channelName: string = 'general'): Promise<Message> {
    console.log('🔄 MessageService: Sending message:', { content, channelName });
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.error('❌ MessageService: No authenticated user found');
        throw new Error('User must be authenticated to send messages');
      }

      console.log('✅ MessageService: Authenticated user:', user.id);

      // Get or create channel
      const channel = await ChannelService.getOrCreateChannel(channelName, user.id);
      console.log('✅ MessageService: Using channel:', channel);

      // Auto-join the user to the channel if not already a member
      await ChannelService.joinChannel(channelName, user.id);

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
        console.error('❌ MessageService: Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ MessageService: Message sent:', message);

      // Get sender details
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      console.log('✅ MessageService: Sender details:', sender);

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
      console.error('💥 MessageService: Exception in sendMessage:', error);
      throw error;
    }
  }

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) {
        console.error('❌ MessageService: Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }
    } catch (error) {
      console.error('💥 MessageService: Exception in deleteMessage:', error);
      throw error;
    }
  }
}

export default new MessageService();
