import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface TypingUser {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
}

interface TypingIndicatorProps {
  channelId: string;
  className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({
  channelId,
  className = ''
}) => {
  const { user } = useAuth();
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);

  useEffect(() => {
    if (!channelId || !user?.id) return;

    const channel = supabase.channel(`typing_${channelId}`, {
      config: {
        presence: {
          key: user.id
        }
      }
    });

    // Subscribe to presence changes
    channel
      .on('presence', { event: 'sync' }, () => {
        const state = channel.presenceState();
        const typing = Object.values(state).flat().filter((presence: any) => {
          return presence.typing && presence.user_id !== user?.id;
        });

        setTypingUsers(typing.map((presence: any) => ({
          id: presence.user_id,
          username: presence.username,
          full_name: presence.full_name,
          avatar_url: presence.avatar_url
        })));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [channelId, user?.id]);

  if (typingUsers.length === 0) return null;

  return (
    <div className={`flex items-center gap-2 px-4 py-2 text-sm text-muted-foreground animate-pulse ${className}`}>
      <div className="flex -space-x-1">
        {typingUsers.slice(0, 3).map((typingUser) => (
          <Avatar key={typingUser.id} className="h-5 w-5 border border-background">
            <AvatarImage src={typingUser.avatar_url || ''} />
            <AvatarFallback className="text-xs bg-primary/10 text-primary">
              {(typingUser.full_name || typingUser.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
        ))}
      </div>
      <div className="flex items-center gap-1">
        <span>
          {typingUsers.length === 1
            ? `${typingUsers[0].full_name || typingUsers[0].username || 'Someone'} is typing`
            : typingUsers.length === 2
            ? `${typingUsers[0].full_name || typingUsers[0].username || 'Someone'} and ${typingUsers[1].full_name || typingUsers[1].username || 'someone'} are typing`
            : `${typingUsers.length} people are typing`}
        </span>
        <div className="flex gap-1">
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-1 h-1 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  );
};