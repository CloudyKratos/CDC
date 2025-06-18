
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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
            sender_id,
            is_read
          )
        `)
        .order('last_activity_at', { ascending: false });

      if (error) {
        console.error('❌ DirectMessageService: Error fetching conversations:', error);
        throw new Error(`Failed to fetch conversations: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Conversations fetched:', conversations?.length || 0);

      if (!conversations) return [];

      // Enhance conversations with participant info and unread counts
      const enhancedConversations = await Promise.all(
        conversations.map(async (conv) => {
          const otherParticipantId = conv.participant_one_id === user.id 
            ? conv.participant_two_id 
            : conv.participant_one_id;

          // Get other participant's profile
          const { data: profile } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', otherParticipantId)
            .single();

          // Get unread message count
          const { count: unreadCount } = await supabase
            .from('direct_messages')
            .select('id', { count: 'exact' })
            .eq('recipient_id', user.id)
            .eq('sender_id', otherParticipantId)
            .eq('is_read', false);

          return {
            ...conv,
            other_participant: profile || {
              id: otherParticipantId,
              username: 'Unknown User',
              full_name: 'Unknown User',
              avatar_url: null
            },
            last_message: Array.isArray(conv.direct_messages) ? conv.direct_messages[0] : conv.direct_messages,
            unread_count: unreadCount || 0
          };
        })
      );

      return enhancedConversations;
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getConversations:', error);
      throw error;
    }
  }

  // Get messages for a specific conversation
  async getMessages(recipientId: string): Promise<DirectMessage[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

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

      console.log('✅ DirectMessageService: Messages fetched:', messages?.length || 0);

      if (!messages) return [];

      return messages.map(msg => ({
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
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getMessages:', error);
      throw error;
    }
  }

  // Send a direct message
  async sendMessage(recipientId: string, content: string, replyToId?: string): Promise<DirectMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      if (!content.trim()) {
        toast.error('Cannot send empty message');
        throw new Error('Content cannot be empty');
      }

      console.log('🔄 DirectMessageService: Sending message to:', recipientId);

      const { data: message, error } = await supabase
        .from('direct_messages')
        .insert({
          sender_id: user.id,
          recipient_id: recipientId,
          content: content.trim(),
          reply_to_id: replyToId || null
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
        toast.error('Failed to send message');
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Message sent successfully');

      // Get sender profile
      const { data: sender } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .eq('id', user.id)
        .single();

      return {
        ...message,
        sender: sender || {
          id: user.id,
          username: user.email?.split('@')[0] || 'User',
          full_name: user.email?.split('@')[0] || 'User',
          avatar_url: null
        }
      };
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in sendMessage:', error);
      throw error;
    }
  }

  // Mark messages as read
  async markAsRead(senderId: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      console.log('🔄 DirectMessageService: Marking messages as read from:', senderId);

      const { error } = await supabase
        .from('direct_messages')
        .update({ is_read: true })
        .eq('sender_id', senderId)
        .eq('recipient_id', user.id)
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

  // Delete a message
  async deleteMessage(messageId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('direct_messages')
        .update({ is_deleted: true })
        .eq('id', messageId);

      if (error) {
        console.error('❌ DirectMessageService: Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ DirectMessageService: Message deleted successfully');
      toast.success('Message deleted', { duration: 1000 });
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in deleteMessage:', error);
      throw error;
    }
  }

  // Get all users for starting new conversations
  async getUsers(): Promise<Array<{ id: string; username?: string; full_name?: string; avatar_url?: string; }>> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: users, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .neq('id', user.id)
        .order('full_name');

      if (error) {
        console.error('❌ DirectMessageService: Error fetching users:', error);
        throw new Error(`Failed to fetch users: ${error.message}`);
      }

      return users || [];
    } catch (error) {
      console.error('💥 DirectMessageService: Exception in getUsers:', error);
      throw error;
    }
  }
}

export default new DirectMessageService();
