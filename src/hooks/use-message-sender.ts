
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Message } from '@/types/chat';
import { toast } from 'sonner';

export function useMessageSender() {
  const { user } = useAuth();

  const sendMessage = useCallback(async (
    channelId: string,
    content: string,
    setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  ): Promise<boolean> => {
    if (!channelId || !user?.id) {
      toast.error('Cannot send message - not connected');
      return false;
    }

    if (!content.trim()) {
      toast.error('Message cannot be empty');
      return false;
    }

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content: content.trim(),
      created_at: new Date().toISOString(),
      sender_id: user.id,
      sender: {
        id: user.id,
        username: user.email?.split('@')[0] || 'You',
        full_name: user.email?.split('@')[0] || 'You',
        avatar_url: null
      }
    };

    setMessages(prev => [...prev, optimisticMessage]);

    const maxRetries = 3;
    let attempt = 0;

    while (attempt < maxRetries) {
      try {
        console.log(`📤 Sending message (attempt ${attempt + 1}):`, content.substring(0, 50));
        
        const { data, error } = await supabase
          .from('community_messages')
          .insert({
            channel_id: channelId,
            sender_id: user.id,
            content: content.trim(),
            is_deleted: false
          })
          .select(`
            id,
            content,
            created_at,
            sender_id
          `)
          .single();

        if (error) {
          throw new Error(error.message);
        }

        setMessages(prev => {
          const filtered = prev.filter(msg => msg.id !== optimisticMessage.id);
          
          const exists = filtered.some(msg => msg.id === data.id);
          if (exists) return filtered;
          
          const realMessage: Message = {
            id: data.id,
            content: data.content,
            created_at: data.created_at,
            sender_id: data.sender_id,
            sender: optimisticMessage.sender
          };
          
          return [...filtered, realMessage];
        });

        console.log('✅ Message sent successfully');
        return true;

      } catch (err) {
        console.error(`❌ Send attempt ${attempt + 1} failed:`, err);
        attempt++;
        
        if (attempt < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        } else {
          setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id));
          toast.error('Failed to send message after multiple attempts');
          return false;
        }
      }
    }

    return false;
  }, [user]);

  return { sendMessage };
}
