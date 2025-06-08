
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { MoreHorizontal, Heart, Reply, ThumbsUp, Smile, Copy, Flag } from 'lucide-react';
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
import { toast } from 'sonner';
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
    '👍': Math.floor(Math.random() * 3),
    '❤️': Math.floor(Math.random() * 2),
    '😂': Math.floor(Math.random() * 2)
  });
  
  // Format message timestamp
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();
  const formattedTime = format(timestamp, 'h:mm a');
  
  // Default reactions list
  const availableReactions = ['👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯'];
  
  const handleReaction = (reaction: string) => {
    if (onReaction) {
      onReaction(message.id, reaction);
      // Update local state for immediate feedback
      setReactions(prev => ({
        ...prev,
        [reaction]: (prev[reaction] || 0) + 1
      }));
      toast.success(`Added ${reaction} reaction`);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };
  
  const getDisplayName = () => {
    return message.sender?.full_name || message.sender?.username || 'Unknown User';
  };

  const getAvatarSrc = () => {
    return message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getDisplayName()}`;
  };
  
  return (
    <div 
      className={`relative px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 group transition-all duration-200 ${isLast ? 'mb-4' : ''}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-3">
        <Avatar className="h-10 w-10 ring-2 ring-gray-100 dark:ring-gray-700">
          <AvatarImage 
            src={getAvatarSrc()} 
            alt={getDisplayName()} 
          />
          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
            {getDisplayName().charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer">
              {getDisplayName()}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {formattedTime}
            </span>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <p className="whitespace-pre-line break-words">{message.content}</p>
          </div>
          
          {/* Reactions display */}
          {Object.entries(reactions).filter(([_, count]) => count > 0).length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {Object.entries(reactions)
                .filter(([_, count]) => count > 0)
                .map(([emoji, count]) => (
                  <Button
                    key={emoji} 
                    variant="outline" 
                    size="sm"
                    className="h-7 px-2 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300"
                    onClick={() => handleReaction(emoji)}
                  >
                    <span className="mr-1">{emoji}</span>
                    <span className="text-xs font-medium">{count}</span>
                  </Button>
                ))
              }
            </div>
          )}
        </div>
      </div>
      
      {/* Action buttons */}
      {showActions && (
        <div className="absolute -top-2 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg flex items-center border border-gray-200 dark:border-gray-700 z-10">
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
              >
                <Smile size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="center">
              <div className="grid grid-cols-5 gap-1">
                {availableReactions.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
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
            className="h-8 px-2 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20"
            onClick={() => onReply?.(message.id)}
          >
            <Reply size={16} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onSelect={() => onReply?.(message.id)} className="cursor-pointer">
                <Reply className="mr-2 h-4 w-4" />
                Reply
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyMessage} className="cursor-pointer">
                <Copy className="mr-2 h-4 w-4" />
                Copy Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-amber-600">
                <Flag className="mr-2 h-4 w-4" />
                Report
              </DropdownMenuItem>
              <DropdownMenuItem className="text-red-600 cursor-pointer" onSelect={() => onDelete?.(message.id)}>
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
