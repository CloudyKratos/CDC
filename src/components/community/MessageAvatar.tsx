
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface MessageAvatarProps {
  sender: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string | null;
  };
  size?: 'sm' | 'md' | 'lg';
  showStatus?: boolean;
  isOnline?: boolean;
  className?: string;
}

export const MessageAvatar: React.FC<MessageAvatarProps> = ({
  sender,
  size = 'md',
  showStatus = false,
  isOnline = false,
  className = ''
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6',
    md: 'w-8 h-8',
    lg: 'w-10 h-10'
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  const displayName = sender.full_name || sender.username || 'Unknown';
  const initials = getInitials(displayName);

  return (
    <div className={cn("relative", className)}>
      <Avatar className={cn(sizeClasses[size], "border-2 border-white dark:border-gray-700 shadow-sm")}>
        {sender.avatar_url ? (
          <AvatarImage 
            src={sender.avatar_url} 
            alt={displayName}
            className="object-cover"
          />
        ) : null}
        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-xs">
          {initials}
        </AvatarFallback>
      </Avatar>
      
      {showStatus && (
        <div className={cn(
          "absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-700",
          isOnline ? "bg-green-500" : "bg-gray-400"
        )} />
      )}
    </div>
  );
};
