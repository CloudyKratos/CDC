
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { MoreHorizontal, Heart, Reply, ThumbsUp, Smile } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import type { Message } from "@/types/chat";

interface ChatMessageProps {
  message: Message;
  onReply?: (messageId: string) => void;
  onReaction?: (messageId: string, reaction: string) => void;
  onDelete?: (messageId: string) => void;
  isLast?: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({
  message,
  onReply,
  onReaction,
  onDelete,
  isLast = false
}) => {
  const [showActions, setShowActions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    '👍': 0,
    '❤️': 0,
    '😂': 0
  });
  
  // Format message timestamp
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();
  const formattedTime = format(timestamp, 'h:mm a');
  
  // Default reactions list
  const availableReactions = ['👍', '❤️', '😂', '😲', '😢', '🙏'];
  
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(message.id, reaction);
      // Update local state for immediate feedback
      setReactions(prev => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) + 1
      }));
    }
  };
  
  return (
    <div 
      className={`relative px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-800 group transition-colors ${isLast ? 'mb-4' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex">
        <Avatar className="h-10 w-10 mr-3 mt-0.5">
          <AvatarImage 
            src={message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${message.sender?.username || 'User'}`} 
            alt={message.sender?.full_name || message.sender?.username || 'Unknown'} 
          />
          <AvatarFallback>
            {(message.sender?.username?.[0] || 'U').toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <span className="font-semibold text-sm mr-2">
              {message.sender?.full_name || message.sender?.username || 'Unknown User'}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
          </div>
          
          <div className="mt-1">
            <p className="text-sm whitespace-pre-line break-words">{message.content}</p>
          </div>
          
          {/* Reactions display */}
          {Object.entries(reactions).filter(([_, count]) => count > 0).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-2">
              {Object.entries(reactions)
                .filter(([_, count]) => count > 0)
                .map(([emoji, count]) => (
                  <Badge 
                    key={emoji} 
                    variant="outline" 
                    className="bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                    onClick={() => handleReaction(emoji)}
                  >
                    {emoji} {count}
                  </Badge>
                ))
              }
            </div>
          )}
        </div>
      </div>
      
      {showActions && (
        <div className="absolute -top-3 right-4 bg-white dark:bg-gray-900 shadow-md rounded-md flex items-center border dark:border-gray-700">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-7 px-2 text-gray-500 hover:text-gray-900"
              >
                <Smile size={14} className="mr-1" />
                <span className="text-xs">React</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-2" align="center">
              <div className="flex gap-1">
                {availableReactions.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => handleReaction(emoji)}
                  >
                    <span className="text-lg">{emoji}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          <Button
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-gray-500 hover:text-gray-900"
            onClick={() => onReply?.(message.id)}
          >
            <Reply size={14} className="mr-1" />
            <span className="text-xs">Reply</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7 px-1.5">
                <MoreHorizontal size={14} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onSelect={() => onReply?.(message.id)}>
                Reply
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-500" onSelect={() => onDelete?.(message.id)}>
                Delete Message
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )}
    </div>
  );
};

export default ChatMessage;
