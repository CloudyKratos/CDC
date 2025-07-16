
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export function useMessageLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const loadMessages = useCallback(async (channelId: string): Promise<Message[]> => {
    if (!channelId) {
      console.log('⚠️ No channel ID provided');
      return [];
    }

    try {
      setIsLoading(true);
      console.log('🔄 Loading messages for channel ID:', channelId);

      const { data: messages, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles:sender_id (
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
        return [];
      }

      console.log('✅ Messages loaded:', messages?.length || 0);

      return (messages || []).map(msg => ({
        id: msg.id,
        content: msg.content,
        created_at: msg.created_at,
        sender_id: msg.sender_id,
        sender: msg.profiles ? {
          id: msg.profiles.id,
          username: msg.profiles.username || 'Unknown User',
          full_name: msg.profiles.full_name || 'Unknown User',
          avatar_url: msg.profiles.avatar_url
        } : {
          id: msg.sender_id,
          username: 'Unknown User',
          full_name: 'Unknown User',
          avatar_url: null
        }
      }));

    } catch (error) {
      console.error('💥 Exception loading messages:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    loadMessages,
    isLoading
  };
}
