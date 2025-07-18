
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { 
  MoreHorizontal,
  Reply,
  Heart,
  Smile,
  Pin,
  Flag,
  Trash2,
  Copy
} from 'lucide-react';

interface EnhancedMessageActionsProps {
  messageId: string;
  isOwn: boolean;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onDelete?: (messageId: string) => void;
}

export const EnhancedMessageActions: React.FC<EnhancedMessageActionsProps> = ({
  messageId,
  isOwn,
  onReply,
  onReact,
  onPin,
  onReport,
  onDelete
}) => {
  const [showQuickReactions, setShowQuickReactions] = useState(false);

  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  const handleReaction = (emoji: string) => {
    if (onReact) {
      onReact(messageId, emoji);
    }
    setShowQuickReactions(false);
  };

  return (
    <div className="opacity-0 group-hover/message:opacity-100 transition-opacity duration-200">
      {/* Quick Actions */}
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
        {/* Quick Reactions */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            onMouseEnter={() => setShowQuickReactions(true)}
            onMouseLeave={() => setShowQuickReactions(false)}
            onClick={() => handleReaction('👍')}
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
          
          {/* Quick Reaction Picker */}
          {showQuickReactions && (
            <div 
              className="absolute bottom-full left-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-50"
              onMouseEnter={() => setShowQuickReactions(true)}
              onMouseLeave={() => setShowQuickReactions(false)}
            >
              {quickReactions.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-lg"
                >
                  {emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Reply */}
        <Button
          variant="ghost"
          size="sm"
          className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          onClick={() => onReply?.(messageId)}
        >
          <Reply className="h-3.5 w-3.5" />
        </Button>

        {/* More Actions */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreHorizontal className="h-3.5 w-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <DropdownMenuItem
              onClick={() => navigator.clipboard.writeText(messageId)}
              className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Copy className="h-4 w-4" />
              Copy Message
            </DropdownMenuItem>
            
            {onPin && (
              <DropdownMenuItem
                onClick={() => onPin(messageId)}
                className="flex items-center gap-2 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Pin className="h-4 w-4" />
                Pin Message
              </DropdownMenuItem>
            )}
            
            <DropdownMenuSeparator />
            
            {!isOwn && onReport && (
              <DropdownMenuItem
                onClick={() => onReport(messageId)}
                className="flex items-center gap-2 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/20"
              >
                <Flag className="h-4 w-4" />
                Report Message
              </DropdownMenuItem>
            )}
            
            {isOwn && onDelete && (
              <DropdownMenuItem
                onClick={() => onDelete(messageId)}
                className="flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Trash2 className="h-4 w-4" />
                Delete Message
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};
