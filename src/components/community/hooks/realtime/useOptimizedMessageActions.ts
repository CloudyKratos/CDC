
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOptimizedMessageActions() {
  const { user } = useAuth();

  const sendMessage = useCallback(async (content: string, channelId: string | null) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      throw new Error('User not authenticated');
    }

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      throw new Error('Empty message');
    }

    if (!channelId) {
      toast.error("Channel not ready. Please wait and try again.");
      throw new Error('Channel not ready');
    }

    // Optimistic update preparation
    const tempId = `temp-${Date.now()}`;
    const tempMessage = {
      id: tempId,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      channel_id: channelId,
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: user.email?.split('@')[0] || 'You',
        avatar_url: null
      }
    };

    try {
      console.log('📤 Sending message with optimistic update');
      
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
          sender_id,
          profiles!community_messages_sender_id_fkey (
            id,
            username,
            full_name,
            avatar_url
          )
        `)
        .single();

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message: ' + error.message);
        throw error;
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!', { duration: 1000 });
      
      return {
        ...data,
        sender: data.profiles || tempMessage.sender
      };
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      throw error;
    }
  }, [user?.id]);

  const deleteMessage = useCallback(async (messageId: string, setMessages: React.Dispatch<React.SetStateAction<any[]>>) => {
    if (!user?.id) return;

    try {
      console.log('🗑️ Deleting message:', messageId);
      
      // Optimistic update - remove message immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      
      const { error } = await supabase
        .from('community_messages')
        .update({ is_deleted: true })
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) {
        console.error('❌ Error deleting message:', error);
        // Rollback optimistic update
        setMessages(prev => [...prev]);
        toast.error('Failed to delete message: ' + error.message);
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
