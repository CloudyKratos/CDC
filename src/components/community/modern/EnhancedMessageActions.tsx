
import React from 'react';
import { MoreHorizontal, Reply, Heart, Pin, Flag, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
  const quickReactions = ['👍', '❤️', '😂', '😮', '😢', '😡'];

  return (
    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
      {/* Quick Reply */}
      {onReply && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReply(messageId)}
          className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Reply className="h-3 w-3" />
        </Button>
      )}

      {/* Quick React */}
      {onReact && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onReact(messageId, '👍')}
          className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
        >
          <Heart className="h-3 w-3" />
        </Button>
      )}

      {/* More Actions */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-48">
          {onReact && (
            <>
              <div className="px-2 py-1">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">
                  Quick Reactions
                </div>
                <div className="flex gap-1">
                  {quickReactions.map((emoji) => (
                    <Button
                      key={emoji}
                      variant="ghost"
                      size="sm"
                      onClick={() => onReact(messageId, emoji)}
                      className="h-6 w-6 p-0 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    >
                      {emoji}
                    </Button>
                  ))}
                </div>
              </div>
              <DropdownMenuSeparator />
            </>
          )}
          
          {onPin && (
            <DropdownMenuItem onClick={() => onPin(messageId)}>
              <Pin className="h-3 w-3 mr-2" />
              Pin Message
            </DropdownMenuItem>
          )}
          
          {!isOwn && onReport && (
            <DropdownMenuItem onClick={() => onReport(messageId)}>
              <Flag className="h-3 w-3 mr-2" />
              Report Message
            </DropdownMenuItem>
          )}
          
          {isOwn && onDelete && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(messageId)}
                className="text-red-600 dark:text-red-400 focus:text-red-600 dark:focus:text-red-400"
              >
                <Trash2 className="h-3 w-3 mr-2" />
                Delete Message
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
