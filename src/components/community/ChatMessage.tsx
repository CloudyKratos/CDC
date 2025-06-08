
import React, { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { format } from 'date-fns';
import { MoreHorizontal, Heart, Reply, ThumbsUp, Smile, Copy, Flag, Edit3, Pin, Share } from 'lucide-react';
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
  const [showReactions, setShowReactions] = useState(false);
  const [reactions, setReactions] = useState<Record<string, number>>({
    '👍': Math.floor(Math.random() * 5),
    '❤️': Math.floor(Math.random() * 3),
    '😂': Math.floor(Math.random() * 2),
    '🔥': Math.floor(Math.random() * 3)
  });
  
  // Format message timestamp
  const timestamp = message.created_at ? new Date(message.created_at) : new Date();
  const formattedTime = format(timestamp, 'h:mm a');
  const formattedDate = format(timestamp, 'MMM d');
  
  // Enhanced reactions list
  const availableReactions = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯',
    '✨', '🚀', '⭐', '💪', '🙌', '🤝', '💡', '📈', '🎯', '🏆'
  ];
  
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

  const handleShareMessage = () => {
    if (navigator.share) {
      navigator.share({
        title: 'Community Message',
        text: message.content,
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(`${message.content}\n\n- Shared from Warrior Community`);
      toast.success('Message link copied to clipboard');
    }
  };
  
  const getDisplayName = () => {
    return message.sender?.full_name || message.sender?.username || 'Community Member';
  };

  const getAvatarSrc = () => {
    return message.sender?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getDisplayName()}`;
  };
  
  return (
    <div 
      className={`relative px-6 py-4 hover:bg-gray-50/80 dark:hover:bg-gray-800/50 group transition-all duration-200 ${isLast ? 'mb-4' : ''} rounded-lg mx-2`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex gap-4">
        <div className="relative">
          <Avatar className="h-12 w-12 ring-2 ring-gray-100 dark:ring-gray-700 shadow-sm">
            <AvatarImage 
              src={getAvatarSrc()} 
              alt={getDisplayName()} 
            />
            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold text-lg">
              {getDisplayName().charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {/* Online indicator */}
          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white dark:border-gray-800"></div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <span className="font-semibold text-gray-900 dark:text-white hover:underline cursor-pointer text-lg">
              {getDisplayName()}
            </span>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400 border-blue-200 dark:border-blue-800">
              Warrior
            </Badge>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              {formattedTime}
            </span>
            <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
              {formattedDate}
            </span>
          </div>
          
          <div className="text-gray-800 dark:text-gray-200 leading-relaxed">
            <p className="whitespace-pre-line break-words text-base">{message.content}</p>
          </div>
          
          {/* Enhanced Reactions display */}
          {Object.entries(reactions).filter(([_, count]) => count > 0).length > 0 && (
            <div className="flex flex-wrap gap-2 mt-4">
              {Object.entries(reactions)
                .filter(([_, count]) => count > 0)
                .map(([emoji, count]) => (
                  <Button
                    key={emoji} 
                    variant="outline" 
                    size="sm"
                    className="h-8 px-3 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 shadow-sm transition-all duration-200 hover:scale-105"
                    onClick={() => handleReaction(emoji)}
                  >
                    <span className="mr-2 text-sm">{emoji}</span>
                    <span className="text-xs font-semibold">{count}</span>
                  </Button>
                ))
              }
              <Button
                variant="ghost"
                size="sm"
                className="h-8 px-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400"
                onClick={() => setShowReactions(!showReactions)}
              >
                <Smile size={14} />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      {/* Enhanced Action buttons */}
      {showActions && (
        <div className="absolute -top-3 right-6 bg-white dark:bg-gray-800 shadow-xl rounded-xl flex items-center border border-gray-200 dark:border-gray-700 z-10 overflow-hidden">
          <Popover open={showReactions} onOpenChange={setShowReactions}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-10 px-3 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-none"
              >
                <Smile size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="center">
              <div className="grid grid-cols-8 gap-2">
                {availableReactions.map(emoji => (
                  <Button
                    key={emoji}
                    variant="ghost"
                    size="sm"
                    className="h-10 w-10 p-0 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 hover:scale-110"
                    onClick={() => {
                      handleReaction(emoji);
                      setShowReactions(false);
                    }}
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
            className="h-10 px-3 text-gray-500 hover:text-green-600 dark:hover:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/20 rounded-none"
            onClick={() => onReply?.(message.id)}
          >
            <Reply size={16} />
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-10 px-3 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 rounded-none">
                <MoreHorizontal size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem onSelect={() => onReply?.(message.id)} className="cursor-pointer">
                <Reply className="mr-3 h-4 w-4" />
                Reply to Message
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleCopyMessage} className="cursor-pointer">
                <Copy className="mr-3 h-4 w-4" />
                Copy Message
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={handleShareMessage} className="cursor-pointer">
                <Share className="mr-3 h-4 w-4" />
                Share Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="cursor-pointer text-blue-600">
                <Pin className="mr-3 h-4 w-4" />
                Pin Message
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer text-amber-600">
                <Flag className="mr-3 h-4 w-4" />
                Report Message
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-orange-600 cursor-pointer">
                <Edit3 className="mr-3 h-4 w-4" />
                Edit Message
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
