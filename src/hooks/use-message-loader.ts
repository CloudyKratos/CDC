
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export function useMessageLoader() {
  const { user } = useAuth();

  const loadMessages = useCallback(async (channelId: string): Promise<Message[]> => {
    if (!channelId || !user?.id) return [];

    try {
      console.log('📥 Loading messages for channel:', channelId);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
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
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true })
        .limit(50);

      if (messagesError) {
        throw new Error(`Failed to load messages: ${messagesError.message}`);
      }

      const formattedMessages = messagesData?.map((msg: any) => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Community Member',
          avatar_url: null
        }
      })) || [];

      console.log('✅ Loaded', formattedMessages.length, 'messages');
      return formattedMessages;
      
    } catch (err) {
      console.error('❌ Failed to load messages:', err);
      throw err;
    }
  }, [user?.id]);

  return { loadMessages };
}
