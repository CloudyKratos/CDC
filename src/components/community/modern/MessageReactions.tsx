import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Heart, ThumbsUp, Laugh, Angry, Frown } from 'lucide-react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface MessageReactionsProps {
  messageId: string;
  reactions: Reaction[];
  onAddReaction: (messageId: string, emoji: string) => void;
  onRemoveReaction: (messageId: string, emoji: string) => void;
  className?: string;
}

const QUICK_REACTIONS = [
  { emoji: '👍', icon: ThumbsUp },
  { emoji: '❤️', icon: Heart },
  { emoji: '😂', icon: Laugh },
  { emoji: '😢', icon: Frown },
  { emoji: '😠', icon: Angry },
];

export const MessageReactions: React.FC<MessageReactionsProps> = ({
  messageId,
  reactions,
  onAddReaction,
  onRemoveReaction,
  className = ''
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleReactionClick = (emoji: string, hasReacted: boolean) => {
    if (hasReacted) {
      onRemoveReaction(messageId, emoji);
    } else {
      onAddReaction(messageId, emoji);
    }
  };

  if (reactions.length === 0) return null;

  return (
    <div className={`flex items-center gap-1 mt-1 ${className}`}>
      {reactions.map((reaction) => (
        <Button
          key={reaction.emoji}
          variant={reaction.hasReacted ? "secondary" : "ghost"}
          size="sm"
          className={`h-6 px-2 text-xs rounded-full ${
            reaction.hasReacted 
              ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300' 
              : 'hover:bg-gray-100 dark:hover:bg-gray-700'
          }`}
          onClick={() => handleReactionClick(reaction.emoji, reaction.hasReacted)}
        >
          <span className="mr-1">{reaction.emoji}</span>
          <span>{reaction.count}</span>
        </Button>
      ))}
      
      <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <Plus className="h-3 w-3" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-2" align="start">
          <div className="flex gap-1">
            {QUICK_REACTIONS.map(({ emoji }) => (
              <Button
                key={emoji}
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                onClick={() => {
                  onAddReaction(messageId, emoji);
                  setShowEmojiPicker(false);
                }}
              >
                {emoji}
              </Button>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
};
