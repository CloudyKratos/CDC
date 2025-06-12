
import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

interface UseMessageLoader {
  loadMessages: (channelId: string) => Promise<Message[]>;
}

export function useMessageLoader(): UseMessageLoader {
  const loadMessages = useCallback(async (channelId: string): Promise<Message[]> => {
    if (!channelId) {
      console.log('⚠️ No channel ID provided for loading messages');
      return [];
    }

    try {
      console.log('🔄 Loading messages for channel:', channelId);
      
      const { data: messages, error } = await supabase
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
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
        throw error;
      }

      console.log('✅ Messages loaded:', messages?.length || 0);

      if (!messages || messages.length === 0) {
        return [];
      }

      return messages.map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: Array.isArray(msg.profiles) ? msg.profiles[0] : msg.profiles || {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      return [];
    }
  }, []);

  return {
    loadMessages
  };
}
