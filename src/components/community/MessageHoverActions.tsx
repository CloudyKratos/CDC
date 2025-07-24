
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Reply, Smile, MoreHorizontal } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface MessageHoverActionsProps {
  messageId: string;
  onReply: (messageId: string) => void;
  onReact: (messageId: string, emoji: string) => void;
  visible: boolean;
  className?: string;
}

const QUICK_REACTIONS = ['👍', '❤️', '😂', '😮', '😢', '😡'];

export const MessageHoverActions: React.FC<MessageHoverActionsProps> = ({
  messageId,
  onReply,
  onReact,
  visible,
  className = ''
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  if (!visible) return null;

  return (
    <div className={`absolute -top-3 right-4 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 flex items-center z-10 ${className}`}>
      {/* Reply Button */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
        onClick={() => onReply(messageId)}
      >
        <Reply className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>

      {/* Emoji Reaction */}
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Smile className="h-4 w-4 text-gray-600 dark:text-gray-400" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="center">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map(emoji => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  onReact(messageId, emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>

      {/* More Options */}
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0 hover:bg-gray-100 dark:hover:bg-gray-700"
      >
        <MoreHorizontal className="h-4 w-4 text-gray-600 dark:text-gray-400" />
      </Button>
    </div>
  );
};
