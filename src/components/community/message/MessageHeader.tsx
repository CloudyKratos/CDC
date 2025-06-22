
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Message } from '@/types/chat';
import { Crown, Shield, Star } from 'lucide-react';

interface MessageHeaderProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar?: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  message,
  isOwnMessage,
  showAvatar = true
}) => {
  const sender = message.sender;
  const displayName = sender?.full_name || sender?.username || 'Unknown User';
  const avatarUrl = sender?.avatar_url;

  // Mock user roles - in production, this would come from the database
  const getUserRole = () => {
    // This is just for demo - replace with actual role logic
    if (sender?.username === 'admin') return 'admin';
    if (sender?.username === 'mod') return 'moderator';
    return 'member';
  };

  const role = getUserRole();

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Crown className="h-3 w-3 text-yellow-500" />;
      case 'moderator':
        return <Shield className="h-3 w-3 text-blue-500" />;
      default:
        return null;
    }
  };

  const getRoleColor = () => {
    switch (role) {
      case 'admin':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'moderator':
        return 'text-blue-600 dark:text-blue-400';
      default:
        return 'text-foreground';
    }
  };

  return (
    <div className={`flex items-start space-x-3 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {showAvatar && (
        <Avatar className="h-10 w-10 ring-2 ring-background">
          <AvatarImage src={avatarUrl || ''} alt={displayName} />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {displayName[0]?.toUpperCase() || 'U'}
          </AvatarFallback>
        </Avatar>
      )}
      
      <div className={`flex-1 min-w-0 ${isOwnMessage ? 'text-right' : ''}`}>
        <div className={`flex items-center space-x-2 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
          <span className={`font-semibold text-sm hover:underline cursor-pointer ${getRoleColor()}`}>
            {displayName}
          </span>
          
          {getRoleIcon() && (
            <div className="flex items-center">
              {getRoleIcon()}
            </div>
          )}
          
          {role !== 'member' && (
            <Badge variant="secondary" className="text-xs px-1.5 py-0.5 capitalize">
              {role}
            </Badge>
          )}
          
          <span className="text-xs text-muted-foreground">
            {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
