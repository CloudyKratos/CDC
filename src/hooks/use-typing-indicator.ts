import { useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseTypingIndicatorProps {
  channelId: string;
}

export function useTypingIndicator({ channelId }: UseTypingIndicatorProps) {
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  const initializeChannel = useCallback(() => {
    if (!channelId || !user?.id || channelRef.current) return;

    channelRef.current = supabase.channel(`typing_${channelId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    channelRef.current.subscribe();
  }, [channelId, user?.id]);

  const startTyping = useCallback(async () => {
    if (!channelId || !user?.id) return;

    // Initialize channel if not already done
    if (!channelRef.current) {
      initializeChannel();
    }

    // Get user profile for typing indicator
    const { data: profile } = await supabase
      .from('profiles')
      .select('username, full_name, avatar_url')
      .eq('id', user.id)
      .single();

    // Track typing
    channelRef.current?.track({
      user_id: user.id,
      typing: true,
      username: profile?.username,
      full_name: profile?.full_name,
      avatar_url: profile?.avatar_url,
      timestamp: Date.now()
    });

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Auto-stop typing after 3 seconds
    typingTimeoutRef.current = setTimeout(() => {
      if (!channelRef.current || !user?.id) return;

      channelRef.current.track({
        user_id: user.id,
        typing: false,
        timestamp: Date.now()
      });

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }, 3000);
  }, [channelId, user?.id, initializeChannel]);

  const stopTyping = useCallback(() => {
    if (!channelRef.current || !user?.id) return;

    channelRef.current.track({
      user_id: user.id,
      typing: false,
      timestamp: Date.now()
    });

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [user?.id]);

  const cleanup = useCallback(() => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, []);

  return {
    startTyping,
    stopTyping,
    cleanup
  };
}