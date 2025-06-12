
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
      
      // First, get messages without JOIN to avoid relation errors
      const { data: messages, error } = await supabase
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

      // Get unique sender IDs
      const senderIds = [...new Set(messages.map(msg => msg.sender_id))];
      
      // Fetch sender profiles separately if we have sender IDs
      let profiles: any[] = [];
      if (senderIds.length > 0) {
        const { data: profilesData } = await supabase
          .from('profiles')
          .select('id, username, full_name, avatar_url')
          .in('id', senderIds);
        
        profiles = profilesData || [];
      }

      // Map messages with sender data
      return messages.map(msg => {
        const senderProfile = profiles.find(p => p.id === msg.sender_id);
        
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
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      return [];
    }
  }, []);

  return {
    loadMessages
  };
}
