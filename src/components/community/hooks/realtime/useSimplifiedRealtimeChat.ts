
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

interface UseSimplifiedRealtimeChat {
  messages: Message[];
  isLoading: boolean;
  isConnected: boolean;
  sendMessage: (content: string) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
}

export function useSimplifiedRealtimeChat(channelName: string): UseSimplifiedRealtimeChat {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  
  const { user } = useAuth();

  // Load messages for channel (using channel name directly)
  const loadMessages = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    try {
      console.log('🔄 Loading messages for channel:', channelName);
      
      // Query messages directly using channel name as channel_id
      const { data: messagesData, error } = await supabase
        .from('community_messages')
        .select(`
          id,
          content,
          created_at,
          sender_id
        `)
        .eq('channel_id', channelName)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('❌ Error loading messages:', error);
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

      setIsLoading(false);
      
    } catch (error) {
      console.error('💥 Failed to load messages:', error);
      setMessages([]);
      setIsLoading(false);
    }
  }, [channelName, user?.id]);

  // Setup realtime subscription
  useEffect(() => {
    if (!user?.id) return;

    console.log('🔄 Setting up realtime subscription for channel:', channelName);
    
    const subscription = supabase
      .channel(`simplified_chat_${channelName}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelName}`
        },
        async (payload) => {
          console.log('📨 New message received:', payload);
          const newMessage = payload.new as any;
          
          // Get sender profile
          const { data: sender } = await supabase
            .from('profiles')
            .select('id, username, full_name, avatar_url')
            .eq('id', newMessage.sender_id)
            .single();

          const message: Message = {
            id: newMessage.id,
            content: newMessage.content,
            created_at: newMessage.created_at,
            sender_id: newMessage.sender_id,
            sender: sender || {
              id: newMessage.sender_id,
              username: 'Unknown User',
              full_name: 'Unknown User',
              avatar_url: null
            }
          };

          setMessages(prev => {
            // Avoid duplicates
            if (prev.some(m => m.id === message.id)) return prev;
            return [...prev, message].sort((a, b) => 
              new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
            );
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'community_messages',
          filter: `channel_id=eq.${channelName}`
        },
        (payload) => {
          console.log('📝 Message updated:', payload);
          const updatedMessage = payload.new as any;
          if (updatedMessage.is_deleted) {
            setMessages(prev => prev.filter(m => m.id !== updatedMessage.id));
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
        setIsConnected(status === 'SUBSCRIBED');
      });

    return () => {
      console.log('🧹 Cleaning up realtime subscription');
      subscription.unsubscribe();
      setIsConnected(false);
    };
  }, [channelName, user?.id]);

  // Load messages on mount
  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Send message function
  const sendMessage = useCallback(async (content: string) => {
    if (!user?.id) {
      toast.error("You must be logged in to send messages");
      return;
    }

    if (!content.trim()) {
      toast.error("Message cannot be empty");
      return;
    }

    try {
      console.log('📤 Sending message to channel:', channelName);
      
      const { error } = await supabase
        .from('community_messages')
        .insert({
          channel_id: channelName, // Use channel name directly as ID
          sender_id: user.id,
          content: content.trim()
        });

      if (error) {
        console.error('❌ Error sending message:', error);
        toast.error('Failed to send message: ' + error.message);
        throw error;
      }

      console.log('✅ Message sent successfully');
      toast.success('Message sent!');
    } catch (error) {
      console.error('💥 Failed to send message:', error);
      throw error;
    }
  }, [user?.id, channelName]);

  // Delete message function
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
        toast.error('Failed to delete message: ' + error.message);
        throw error;
      }

      console.log('✅ Message deleted successfully');
      // Remove from local state immediately
      setMessages(prev => prev.filter(msg => msg.id !== messageId));
      toast.success('Message deleted');
    } catch (error) {
      console.error('💥 Failed to delete message:', error);
      throw error;
    }
  }, [user?.id]);

  return {
    messages,
    isLoading,
    isConnected,
    sendMessage,
    deleteMessage
  };
}
