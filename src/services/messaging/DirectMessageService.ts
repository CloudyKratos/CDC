
import { supabase } from "@/integrations/supabase/client";

export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  is_read: boolean;
}

export interface Conversation {
  id: string;
  participants: string[];
  last_message?: DirectMessage;
  created_at: string;
  updated_at: string;
}

class DirectMessageService {
  async getConversations(userId: string): Promise<Conversation[]> {
    try {
      console.log('Getting conversations for user:', userId);
      
      // Since we don't have conversations table, return empty array for now
      console.log('Conversations feature not fully implemented - requires database setup');
      return [];
    } catch (error) {
      console.error('Error fetching conversations:', error);
      return [];
    }
  }

  async getMessages(conversationId: string): Promise<DirectMessage[]> {
    try {
      console.log('Getting messages for conversation:', conversationId);
      
      // Since we don't have direct_messages table, return empty array for now
      console.log('Direct messages feature not fully implemented - requires database setup');
      return [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      return [];
    }
  }

  async sendMessage(recipientId: string, content: string): Promise<DirectMessage | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Sending message to:', recipientId, 'content:', content);
      
      // Since we don't have direct_messages table, simulate message creation
      const mockMessage: DirectMessage = {
        id: `msg_${Date.now()}`,
        sender_id: user.id,
        recipient_id: recipientId,
        content,
        created_at: new Date().toISOString(),
        is_read: false
      };

      console.log('Message sent (simulated):', mockMessage);
      return mockMessage;
    } catch (error) {
      console.error('Error sending message:', error);
      return null;
    }
  }

  async markAsRead(messageId: string): Promise<boolean> {
    try {
      console.log('Marking message as read:', messageId);
      
      // Since we don't have direct_messages table, simulate mark as read
      console.log('Mark as read simulated for message:', messageId);
      return true;
    } catch (error) {
      console.error('Error marking message as read:', error);
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
      
      // Since we don't have conversations table, simulate conversation creation
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
      
      // Since we don't have direct_messages table, simulate deletion
      console.log('Message deletion simulated for:', messageId);
      return true;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }
}

export default new DirectMessageService();
