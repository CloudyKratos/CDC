
import { supabase } from "@/integrations/supabase/client";
import { DirectMessage, Conversation } from "@/types/supabase-extended";

class DirectMessageService {
  async getConversations(): Promise<Conversation[]> {
    try {
      console.log('Direct messages feature requires database setup - returning mock data');
      
      // Mock conversation data since tables don't exist yet
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(recipientId: string): Promise<DirectMessage[]> {
    try {
      console.log('Getting messages for recipient:', recipientId);
      
      // Mock messages since table doesn't exist yet
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(recipientId: string, content: string): Promise<DirectMessage> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Sending message to:', recipientId, 'content:', content);
      
      // Simulate message creation since table doesn't exist
      const mockMessage: DirectMessage = {
        id: `msg_${Date.now()}`,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        is_read: false,
        is_deleted: false,
        reply_to_id: null,
        sender: {
          id: user.id,
          username: 'current_user',
          full_name: 'Current User',
          avatar_url: null
        }
      };

      console.log('Message sent (simulated):', mockMessage);
      return mockMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }

  async markAsRead(recipientId: string): Promise<boolean> {
    try {
      console.log('Marking messages as read from:', recipientId);
      
      // Simulate mark as read since table doesn't exist
      console.log('Mark as read simulated for recipient:', recipientId);
      return true;
    } catch (error) {
      console.error('Error marking messages as read:', error);
      return false;
    }
  }

  async createConversation(participantId: string): Promise<string | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Creating conversation with:', participantId);
      
      // Simulate conversation creation since table doesn't exist
      const conversationId = `conv_${Date.now()}`;
      console.log('Conversation created (simulated):', conversationId);
      return conversationId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      return null;
    }
  }

  async deleteMessage(messageId: string): Promise<boolean> {
    try {
      console.log('Deleting message:', messageId);
      
      // Simulate deletion since table doesn't exist
      console.log('Message deletion simulated for:', messageId);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }

  async getUsers(): Promise<Array<{ id: string; username?: string; full_name?: string; avatar_url?: string; }>> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .limit(50);

      if (error) {
        console.error('Error fetching users:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }
}

export default new DirectMessageService();
