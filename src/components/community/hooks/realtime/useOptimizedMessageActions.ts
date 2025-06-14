
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export function useOptimizedMessageActions() {
  const { user } = useAuth();

  const getOrCreateChannel = async (channelName: string): Promise<string> => {
    try {
      console.log('🔍 Looking for channel:', channelName);
      
      // First try to get existing channel
      let { data: channel, error: channelError } = await supabase
        .from('channels')
        .select('id')
        .eq('name', channelName)
        .eq('type', 'public')
        .single();

      if (channelError && channelError.code === 'PGRST116') {
        // Channel doesn't exist, create it
        console.log('📝 Creating new channel:', channelName);
        const { data: newChannel, error: createError } = await supabase
          .from('channels')
          .insert({
            name: channelName,
            type: 'public',
            description: `${channelName.charAt(0).toUpperCase() + channelName.slice(1)} channel`,
            created_by: user?.id
          })
          .select('id')
          .single();

        if (createError) {
          console.error('❌ Error creating channel:', createError);
          throw new Error(`Failed to create channel: ${createError.message}`);
        }
        
        channel = newChannel;
        console.log('✅ Channel created:', channel);
      } else if (channelError) {
        console.error('❌ Error fetching channel:', channelError);
        throw new Error(`Failed to access channel: ${channelError.message}`);
      }

      // Ensure user is a member of the channel
      await supabase
        .from('channel_members')
        .upsert({
          channel_id: channel.id,
          user_id: user!.id
        }, {
          onConflict: 'channel_id,user_id'
        });

      return channel.id;
    } catch (error) {
      console.error('💥 Failed to get/create channel:', error);
      throw error;
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
      
      // Get or create the channel and ensure membership
      const channelId = await getOrCreateChannel(channelName);
      
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
        sender: data.profiles || {
          id: user.id,
          username: user.email?.split('@')[0] || 'You',
          full_name: user.email?.split('@')[0] || 'You',
          avatar_url: null
        }
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
