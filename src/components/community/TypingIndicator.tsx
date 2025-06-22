
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TypingUser {
  id: string;
  user_id: string;
  profiles?: {
    username?: string;
    full_name?: string;
  };
}

interface TypingIndicatorProps {
  channelId: string | null;
}

const TypingIndicator: React.FC<TypingIndicatorProps> = ({ channelId }) => {
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const { user } = useAuth();

  useEffect(() => {
    if (!channelId || !user) return;

    // Load current typing users
    const loadTypingUsers = async () => {
      try {
        const { data, error } = await supabase
          .from('typing_indicators')
          .select(`
            id,
            user_id,
            profiles!typing_indicators_user_id_fkey (
              username,
              full_name
            )
          `)
          .eq('channel_id', channelId)
          .neq('user_id', user.id)
          .gt('expires_at', new Date().toISOString());

        if (error) throw error;
        setTypingUsers(data || []);
      } catch (error) {
        console.error('Failed to load typing users:', error);
      }
    };

    loadTypingUsers();

    // Subscribe to typing indicator changes
    const subscription = supabase
      .channel(`typing_${channelId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'typing_indicators',
          filter: `channel_id=eq.${channelId}`
        },
        () => {
          loadTypingUsers();
        }
      )
      .subscribe();

    // Clean up expired indicators every 5 seconds
    const cleanupInterval = setInterval(() => {
      loadTypingUsers();
    }, 5000);

    return () => {
      supabase.removeChannel(subscription);
      clearInterval(cleanupInterval);
    };
  }, [channelId, user]);

  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    const usernames = typingUsers.map(user => 
      user.profiles?.full_name || user.profiles?.username || 'Someone'
    );

    if (usernames.length === 1) {
      return `${usernames[0]} is typing...`;
    } else if (usernames.length === 2) {
      return `${usernames[0]} and ${usernames[1]} are typing...`;
    } else if (usernames.length === 3) {
      return `${usernames[0]}, ${usernames[1]}, and ${usernames[2]} are typing...`;
    } else {
      return `${usernames[0]}, ${usernames[1]}, and ${usernames.length - 2} others are typing...`;
    }
  };

  return (
    <div className="flex items-center space-x-2 text-sm text-muted-foreground animate-pulse">
      <div className="flex space-x-1">
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
      <span>{getTypingText()}</span>
    </div>
  );
};

export default TypingIndicator;
