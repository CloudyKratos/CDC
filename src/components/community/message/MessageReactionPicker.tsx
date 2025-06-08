
import React from 'react';
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Smile } from "lucide-react";

interface MessageReactionPickerProps {
  showReactions: boolean;
  setShowReactions: (show: boolean) => void;
  onReactionSelect: (reaction: string) => void;
}

const MessageReactionPicker: React.FC<MessageReactionPickerProps> = ({
  showReactions,
  setShowReactions,
  onReactionSelect
}) => {
  const availableReactions = [
    '👍', '❤️', '😂', '😮', '😢', '😡', '🎉', '🔥', '👏', '💯',
    '✨', '🚀', '⭐', '💪', '🙌', '🤝', '💡', '📈', '🎯', '🏆'
  ];

  return (
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
                onReactionSelect(emoji);
                setShowReactions(false);
              }}
            >
              <span className="text-lg">{emoji}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default MessageReactionPicker;
