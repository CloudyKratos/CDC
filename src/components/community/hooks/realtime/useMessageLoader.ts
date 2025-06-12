
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
      
      // First, let's try to get messages with a simpler query
      const { data: messages, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id,
          profiles (
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
        // If the table doesn't exist or there are permission issues, return empty array
        if (error.code === 'PGRST116' || error.code === '42P01') {
          console.log('📝 Messages table not found or no permissions, returning empty array');
          return [];
        }
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
      console.error('💥 Failed to load messages:', error);
      return [];
    }
  }, []);

  return {
    loadMessages
  };
}
