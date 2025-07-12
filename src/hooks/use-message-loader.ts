import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/auth/AuthContext';

export const useMessageLoader = (channelId: string) => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const loadMessages = useCallback(async () => {
    if (!channelId) return;

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('community_messages')
        .select('*')
        .eq('channel_id', channelId)
        .order('created_at', { ascending: false });

      if (error) {
        setError(error);
      } else {
        setMessages(data || []);
      }
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [channelId]);

  return {
    messages,
    isLoading,
    error,
    loadMessages,
  };
};

