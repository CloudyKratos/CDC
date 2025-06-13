
import { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';

export function useMessageLoader() {
  const [messages, setMessages] = useState<Message[]>([]);
  const { user } = useAuth();

  const loadMessages = useCallback(async (channelId: string) => {
    if (!user?.id || !channelId) {
      return;
    }

    try {
      // Load existing messages
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
        setMessages([]);
      } else if (messagesData) {
        // Get sender profiles
        const senderIds = [...new Set(messagesData.map(msg => msg.sender_id))];
        let profiles: any[] = [];
        
        if (senderIds.length > 0) {
          const { data: profilesData } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .in('id', senderIds);
          
          profiles = profilesData || [];
        }

        // Map messages with sender data
        const formattedMessages = messagesData.map(msg => {
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

        setMessages(formattedMessages);
        console.log('✅ Messages loaded:', formattedMessages.length);
      }
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      setMessages([]);
    }
  }, [user?.id]);

  return {
    messages,
    setMessages,
    loadMessages
  };
}
