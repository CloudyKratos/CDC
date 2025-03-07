
import React from "react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  emojis: string[];
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  emojis, 
  onSelectEmoji, 
  onClose,
  className
}) => {
  return (
    <div className={cn(
      "absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 grid grid-cols-6 gap-1 glass-morphism animate-scale-in z-10",
      className
    )}>
      {emojis.map(emoji => (
        <button 
          key={emoji}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
          onClick={() => {
            onSelectEmoji(emoji);
            onClose();
          }}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
