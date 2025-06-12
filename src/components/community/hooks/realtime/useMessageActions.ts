
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UseMessageActions {
  sendMessage: (content: string, channelId: string | null) => Promise<void>;
  deleteMessage: (messageId: string, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => Promise<void>;
}

export function useMessageActions(): UseMessageActions {
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string, channelId: string | null) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      throw new Error("User not authenticated");
    }

    if (!channelId) {
      toast.error("Channel not available");
      throw new Error("Channel ID not available");
    }

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      throw new Error("Message content is empty");
    }
    
    try {
      console.log('📤 Sending message:', { content: content.substring(0, 50) + '...', channelId, userId: user.id });
      
      // Check if the community_messages table exists and we have permissions
      const { error: insertError } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (insertError) {
        console.error('❌ Error sending message:', insertError);
        
        // Handle specific error cases
        if (insertError.code === '42P01') {
          toast.error('Community messages feature is not yet set up');
          throw new Error('Messages table does not exist');
        } else if (insertError.code === '23503') {
          toast.error('Invalid channel or user');
          throw new Error('Foreign key constraint violation');
        } else {
          toast.error('Failed to send message: ' + insertError.message);
          throw insertError;
        }
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Failed to send message');
      }
    }
  }, [user?.id]);
  
  const deleteMessage = useCallback(async (messageId: string, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!user?.id) return;
    
    try {
      console.log('🗑️ Deleting message:', messageId);
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Error deleting message:', error);
        toast.error('Failed to delete message: ' + error.message);
        throw error;
      }

      console.log('✅ Message deleted successfully');
      // Remove from local state immediately for better UX
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete message';
      toast.error('Failed to delete message: ' + errorMessage);
    }
  }, [user?.id]);

  return {
    sendMessage,
    deleteMessage
  };
}
