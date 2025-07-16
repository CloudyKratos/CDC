
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

export function useMessageActions() {
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string, channelId: string) => {
    if (!user?.id || !channelId || !content.trim()) {
      throw new Error('Missing required data for sending message');
    }

    try {
      console.log('📤 Sending message to channel:', channelId);

      const { error } = await supabase
        .from('community_messages')
        .insert({
          content: content.trim(),
          channel_id: channelId,
          sender_id: user.id
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        throw new Error(`Failed to send message: ${error.message}`);
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Exception sending message:', error);
      throw error;
    }
  }, [user?.id]);

  const deleteMessage = useCallback(async (messageId: string) => {
    if (!user?.id || !messageId) {
      throw new Error('Missing required data for deleting message');
    }

    try {
      console.log('🗑️ Deleting message:', messageId);

      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Error deleting message:', error);
        throw new Error(`Failed to delete message: ${error.message}`);
      }

      console.log('✅ Message deleted successfully');
    } catch (error) {
      console.error('💥 Exception deleting message:', error);
      throw error;
    }
  }, [user?.id]);

  return {
    sendMessage,
    deleteMessage
  };
}
