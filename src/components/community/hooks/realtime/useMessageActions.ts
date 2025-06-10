
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
    if (!user?.id || !channelId || !content.trim()) {
      if (!user?.id) toast.error("You must be logged in to send messages");
      return;
    }
    
    try {
      console.log('📤 Sending message:', content);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        throw error;
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to send message';
      toast.error('Failed to send message: ' + errorMessage);
      throw error;
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
