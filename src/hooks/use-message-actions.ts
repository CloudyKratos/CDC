
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useMessageActions() {
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string, channelId: string | null) => {
    if (!user?.id || !channelId || !content.trim()) {
      toast.error("Cannot send message");
      return;
    }

    try {
      console.log('📤 Sending message to channel:', channelId);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message');
        throw error;
      }

      console.log('✅ Message sent successfully');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      throw error;
    }
  }, [user?.id]);

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
        toast.error('Failed to delete message');
        throw error;
      }

      console.log('✅ Message deleted successfully');
      toast.success('Message deleted', { duration: 1000 });
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      throw error;
    }
  }, [user?.id]);

  const replyToMessage = useCallback((messageId: string) => {
    console.log('Replying to message:', messageId);
    toast.info('Reply feature coming soon!');
  }, []);

  const addReaction = useCallback(async (messageId: string, reaction: string) => {
    console.log('Adding reaction:', reaction, 'to message:', messageId);
    toast.info('Reactions feature coming soon!');
  }, []);

  return {
    sendMessage,
    deleteMessage,
    replyToMessage,
    addReaction
  };
}
