
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export function useMessageLoader() {
  const { user } = useAuth();

  const loadMessages = useCallback(async (channelId: string): Promise<Message[]> => {
    if (!user?.id || !channelId) return [];

    try {
      console.log('📖 Loading messages for channel:', channelId);
      
      const { data: messagesData, error: messagesError } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('channel_id', channelId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (messagesError) {
        console.error('❌ Error loading messages:', messagesError);
        return [];
      }

      if (!messagesData?.length) {
        console.log('📭 No messages found');
        return [];
      }

      // Get sender profiles
      const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('id, username, full_name, avatar_url')
        .in('id', senderIds);

      // Format messages with sender data
      const formattedMessages = messagesData.map(msg => {
        const senderProfile = profiles?.find(p => p.id === msg.sender_id);
        
        return {
          id: msg.id,
          content: msg.content,
          created_at: msg.created_at,
          sender_id: msg.sender_id,
          sender: senderProfile ? {
            id: senderProfile.id,
            username: senderProfile.username || 'Unknown User',
            full_name: senderProfile.full_name || 'Unknown User',
            avatar_url: senderProfile.avatar_url
          } : {
            id: msg.sender_id,
            username: 'Unknown User',
            full_name: 'Unknown User',
            avatar_url: null
          }
        };
      });

      console.log('✅ Messages loaded:', formattedMessages.length);
      return formattedMessages;
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      return [];
    }
  }, [user?.id]);

  return { loadMessages };
}
