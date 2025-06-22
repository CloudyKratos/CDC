
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import type { Message } from "@/types/chat";

interface MessageHeaderProps {
  message: Message;
  isOwnMessage?: boolean;
  showAvatar?: boolean;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({ 
  message, 
  isOwnMessage = false,
  showAvatar = true 
}) => {
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();
  const formattedTime = format(timestamp, 'h:mm a');
  
  const getDisplayName = () => {
    return message.sender?.full_name || message.sender?.username || 'Community Member';
  };

  const getAvatarSrc = () => {
    return message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getDisplayName()}`;
  };

  if (isOwnMessage) {
    return (
      <div className="flex items-center justify-end gap-2 mb-1">
        <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          {formattedTime}
        </span>
        <span className="font-semibold text-gray-900 dark:text-white text-sm">
          You
        </span>
      </div>
    );
  }

  return (
    <div className="flex gap-3 mb-2">
      {showAvatar && (
        <div className="relative">
          <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-700 shadow-sm">
            <AvatarImage 
              src={getAvatarSrc()} 
              alt={getDisplayName()} 
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-sm">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer text-sm">
            {getDisplayName()}
          </span>
          <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
            Warrior
          </Badge>
          <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            {formattedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
