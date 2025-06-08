
import React from 'react';
import { Button } from "@/components/ui/button";
import { Smile, AtSign } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { EmojiPicker } from '@/components/EmojiPicker';
import { toast } from 'sonner';

interface InputActionsProps {
  showEmojiPicker: boolean;
  setShowEmojiPicker: (show: boolean) => void;
  onEmojiSelect: (emoji: string) => void;
}

const InputActions: React.FC<InputActionsProps> = ({
  showEmojiPicker,
  setShowEmojiPicker,
  onEmojiSelect
}) => {
  const emojis = ['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆', '✨', '🤝', '💎', '⚡', '🎨'];

  return (
    <div className="absolute bottom-3 right-3 flex items-center space-x-1">
      <Tooltip>
        <TooltipTrigger asChild>
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <Smile size={18} className="text-gray-500 dark:text-gray-400" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end" alignOffset={-40}>
              <EmojiPicker
                emojis={emojis}
                onSelectEmoji={onEmojiSelect}
                onClose={() => setShowEmojiPicker(false)}
              />
            </PopoverContent>
          </Popover>
        </TooltipTrigger>
        <TooltipContent>
          <p>Add emoji</p>
        </TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
            onClick={() => toast.info("Mention feature coming soon!")}
          >
            <AtSign size={18} className="text-gray-500 dark:text-gray-400" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Mention someone</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

export default InputActions;
