
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOptimizedMessageActions() {
  const { user } = useAuth();

  const getChannelIdByName = async (channelName: string): Promise<string | null> => {
    try {
      console.log('🔍 Looking for channel by name:', channelName);
      
      const { data: channel, error } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .maybeSingle();

      if (error) {
        console.error('❌ Error finding channel:', error);
        return null;
      }

      return channel?.id || null;
    } catch (error) {
      console.error('💥 Failed to get channel ID:', error);
      return null;
    }
  };

  const sendMessage = useCallback(async (content: string, channelName: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      throw new Error('User not authenticated');
    }

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      throw new Error('Empty message');
    }

    if (!channelName) {
      toast.error("Channel not specified");
      throw new Error('Channel not specified');
    }

    try {
      console.log('📤 Sending message to channel:', channelName);
      
      // Get the channel ID by name
      const channelId = await getChannelIdByName(channelName);
      
      if (!channelId) {
        throw new Error(`Channel '${channelName}' not found`);
      }
      
      const { data, error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelId,
          sender_id: user.id,
          content: content.trim()
        })
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message');
        throw error;
      }

      console.log('✅ Message sent successfully:', data);
      toast.success('Message sent!', { duration: 1000 });
      
      return data;
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

  return {
    sendMessage,
    deleteMessage
  };
}
