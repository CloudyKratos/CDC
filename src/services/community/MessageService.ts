
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import ChannelService from './ChannelService';

class MessageService {
  // Get messages for a specific channel with better error handling
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
        .eq('type', 'public')
        .maybeSingle();

      if (channelError && channelError.code !== 'PGRST116') {
        console.error('❌ MessageService: Error finding channel:', channelError);
        throw new Error(`Failed to find channel: ${channelError.message}`);
      }

      if (!channel) {
        console.log('📝 MessageService: Channel not found, will create when first message is sent');
        return [];
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
        // Don't throw error for message fetching - return empty array instead
        console.log('📝 MessageService: Returning empty messages due to error');
        return [];
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
      // Return empty array instead of throwing to prevent UI crashes
      return [];
    }
  }

  // Send a message to a channel with improved error handling
  async sendMessage(content: string, channelName: string = 'general'): Promise<Message> {
    console.log('🔄 MessageService: Sending message:', { content, channelName });
    
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
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

  // Delete a message with better error handling
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id); // Only allow deleting own messages

      if (error) {
        console.error('❌ MessageService: Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ MessageService: Message deleted successfully');
    } catch (error) {
      console.error('💥 MessageService: Exception in deleteMessage:', error);
      throw error;
    }
  }
}

export default new MessageService();
