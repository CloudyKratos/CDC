
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMessageActions(channelId: string | null) {
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    if (!channelId) {
      toast.error("Channel not ready. Please wait and try again.");
      return;
    }

    try {
      console.log('📤 Sending message:', content.substring(0, 50) + '...');
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message: ' + error.message);
        throw error;
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      throw error;
    }
  }, [user?.id, channelId]);

  const deleteMessage = useCallback(async (messageId: string) => {
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
      toast.success('Message deleted');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      throw error;
    }
  }, [user?.id]);

  return {
    sendMessage,
    deleteMessage
  };
}
