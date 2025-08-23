import { useCallback, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface UseImprovedTypingIndicatorProps {
  channelId: string;
  onTypingUsersChange?: (users: TypingUser[]) => void;
}

interface TypingUser {
  user_id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

export function useImprovedTypingIndicator({ 
  channelId, 
  onTypingUsersChange 
}: UseImprovedTypingIndicatorProps) {
  const { user } = useAuth();
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const channelRef = useRef<any>(null);

  // Initialize typing indicator channel
  const initializeTypingChannel = useCallback(() => {
    if (!channelId || !user?.id || channelRef.current) return;

    console.log('🔄 Initializing typing indicator for channel:', channelId);

    channelRef.current = supabase.channel(`typing_${channelId}`, {
      config: {
        presence: { key: user.id }
      }
    })
    .on('presence', { event: 'sync' }, () => {
      const presenceState = channelRef.current?.presenceState();
      const typingUsers: TypingUser[] = [];

      if (presenceState) {
        Object.values(presenceState).forEach((presences: any) => {
          presences.forEach((presence: any) => {
            if (presence.typing && presence.user_id !== user.id) {
              typingUsers.push({
                user_id: presence.user_id,
                username: presence.username,
                full_name: presence.full_name,
                avatar_url: presence.avatar_url
              });
            }
          });
        });
      }

      onTypingUsersChange?.(typingUsers);
    })
    .on('presence', { event: 'join' }, ({ newPresences }) => {
      console.log('👋 User joined typing channel:', newPresences);
    })
    .on('presence', { event: 'leave' }, ({ leftPresences }) => {
      console.log('👋 User left typing channel:', leftPresences);
    })
    .subscribe();

  }, [channelId, user?.id, onTypingUsersChange]);

  // Start typing indicator
  const startTyping = useCallback(async () => {
    if (!channelId || !user?.id) return;

    // Initialize if not already done
    if (!channelRef.current) {
      initializeTypingChannel();
      // Small delay to ensure channel is ready
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    try {
      // Insert/update typing status in database
      const { error } = await supabase
        .from('typing_status')
        .upsert({
          channel_id: channelId,
          user_id: user.id,
          is_typing: true,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.warn('⚠️ Could not update typing status:', error);
      }

      // Get user profile for presence tracking
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, full_name, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      // Track typing via presence
      await channelRef.current?.track({
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
      typingTimeoutRef.current = setTimeout(async () => {
        await stopTyping();
      }, 3000);

    } catch (error) {
      console.error('❌ Error starting typing indicator:', error);
    }
  }, [channelId, user?.id, initializeTypingChannel]);

  // Stop typing indicator
  const stopTyping = useCallback(async () => {
    if (!channelRef.current || !user?.id) return;

    try {
      // Remove from database
      await supabase
        .from('typing_status')
        .delete()
        .eq('channel_id', channelId)
        .eq('user_id', user.id);

      // Update presence
      await channelRef.current.track({
        user_id: user.id,
        typing: false,
        timestamp: Date.now()
      });

    } catch (error) {
      console.warn('⚠️ Error stopping typing indicator:', error);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
  }, [channelId, user?.id]);

  // Cleanup function
  const cleanup = useCallback(async () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    if (channelRef.current) {
      await stopTyping();
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  }, [stopTyping]);

  // Auto-cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Auto-cleanup old typing statuses
  useEffect(() => {
    if (!channelId) return;

    const interval = setInterval(async () => {
      try {
        const oneMinuteAgo = new Date(Date.now() - 60000).toISOString();
        await supabase
          .from('typing_status')
          .delete()
          .lt('updated_at', oneMinuteAgo);
      } catch (error) {
        console.warn('⚠️ Error cleaning up old typing statuses:', error);
      }
    }, 30000); // Clean every 30 seconds

    return () => clearInterval(interval);
  }, [channelId]);

  return {
    startTyping,
    stopTyping,
    cleanup
  };
}