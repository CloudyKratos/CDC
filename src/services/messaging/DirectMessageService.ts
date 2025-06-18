
import { supabase } from '@/integrations/supabase/client';

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  is_read: boolean;
  is_deleted: boolean;
  reply_to_id?: string;
  sender?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
}

export interface Conversation {
  id: string;
  participant_one_id: string;
  participant_two_id: string;
  last_message_id?: string;
  last_activity_at: string;
  created_at: string;
  last_message?: DirectMessage;
  other_participant?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  unread_count?: number;
}

class DirectMessageService {
  // Get all conversations for the current user
  async getConversations(): Promise<Conversation[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError) {
        console.error('Auth error:', authError);
        throw new Error('Authentication required');
      }

      if (!user) {
        console.log('No authenticated user');
        return [];
      }

      console.log('🔄 DirectMessageService: Fetching conversations for user:', user.id);

      const { data: conversations, error } = await supabase
        .from('conversations')
        .select(`
          id,
          participant_one_id,
          participant_two_id,
          last_message_id,
          last_activity_at,
          created_at,
          direct_messages!conversations_last_message_id_fkey (
            id,
            content,
            created_at,
            sender_id
          )
        `)
        .or(`participant_one_id.eq.${user.id},participant_two_id.eq.${user.id}`)
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('❌ DirectMessageService: Error fetching conversations:', error);
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      if (!conversations || conversations.length === 0) {
        console.log('📭 DirectMessageService: No conversations found');
        return [];
      }

      // Process conversations to get other participant details
      const processedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipantId = conv.participant_one_id === user.id 
            ? conv.participant_two_id 
            : conv.participant_one_id;

          // Get other participant profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', otherParticipantId)
            .single();

          // Get unread count
          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('id', { count: 'exact' })
            .eq('recipient_id', user.id)
            .eq('sender_id', otherParticipantId)
            .eq('is_read', false)
            .eq('is_deleted', false);

          return {
            id: conv.id,
            participant_one_id: conv.participant_one_id,
            participant_two_id: conv.participant_two_id,
            last_message_id: conv.last_message_id,
            last_activity_at: conv.last_activity_at,
            created_at: conv.created_at,
            last_message: Array.isArray(conv.direct_messages) ? conv.direct_messages[0] : conv.direct_messages,
            other_participant: profile || {
              id: otherParticipantId,
              username: 'Unknown User',
              full_name: 'Unknown User',
              avatar_url: null
            },
            unread_count: unreadCount || 0
          };
        })
      );

      console.log('✅ DirectMessageService: Conversations processed:', processedConversations.length);
      return processedConversations;
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getConversations:', error);
      throw error;
    }
  }

  // Get messages between current user and another user
  async getMessages(recipientId: string): Promise<DirectMessage[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      console.log('🔄 DirectMessageService: Fetching messages between:', user.id, 'and', recipientId);

      const { data: messages, error } = await supabase
        .from('direct_messages')
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          updated_at,
          is_read,
          is_deleted,
          reply_to_id,
          profiles!direct_messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .or(`and(sender_id.eq.${user.id},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${user.id})`)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ DirectMessageService: Error fetching messages:', error);
        throw new Error(`Failed to fetch messages: ${error.message}`);
      }

      if (!messages) {
        return [];
      }

      const processedMessages = messages.map(msg => ({
        id: msg.id,
        sender_id: msg.sender_id,
        recipient_id: msg.recipient_id,
        content: msg.content,
        created_at: msg.created_at,
        updated_at: msg.updated_at,
        is_read: msg.is_read,
        is_deleted: msg.is_deleted,
        reply_to_id: msg.reply_to_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

      console.log('✅ DirectMessageService: Messages fetched:', processedMessages.length);
      return processedMessages;
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getMessages:', error);
      throw error;
    }
  }

  // Send a message
  async sendMessage(recipientId: string, content: string, replyToId?: string): Promise<DirectMessage> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      console.log('📤 DirectMessageService: Sending message to:', recipientId);

      const { data: message, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          reply_to_id: replyToId
        })
        .select(`
          id,
          sender_id,
          recipient_id,
          content,
          created_at,
          updated_at,
          is_read,
          is_deleted,
          reply_to_id
        `)
        .single();

      if (error) {
        console.error('❌ DirectMessageService: Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      // Get sender profile
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      const processedMessage: DirectMessage = {
        ...message,
        sender: sender || {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: null
        }
      };

      console.log('✅ DirectMessageService: Message sent successfully');
      return processedMessage;
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in sendMessage:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(senderId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('recipient_id', user.id)
        .eq('sender_id', senderId)
        .eq('is_read', false);

      if (error) {
        console.error('❌ DirectMessageService: Error marking messages as read:', error);
        throw new Error(`Failed to mark messages as read: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Messages marked as read');
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in markAsRead:', error);
      throw error;
    }
  }

  // Delete a message (soft delete)
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ DirectMessageService: Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Message deleted successfully');
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in deleteMessage:', error);
      throw error;
    }
  }

  // Get all users (for starting new conversations)
  async getUsers(): Promise<Array<{ id: string; username?: string; full_name?: string; avatar_url?: string; }>> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Authentication required');
      }

      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id) // Exclude current user
        .order('full_name');

      if (error) {
        console.error('❌ DirectMessageService: Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Users fetched:', users?.length || 0);
      return users || [];
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getUsers:', error);
      throw error;
    }
  }
}

export default new DirectMessageService();
