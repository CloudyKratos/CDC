
import React from "react";
import { cn } from "@/lib/utils";

interface EmojiPickerProps {
  emojis: string[];
  onSelectEmoji: (emoji: string) => void;
  onClose: () => void;
  onEmojiSelect?: (emoji: string) => void; // Added this prop to maintain backward compatibility
  className?: string;
}

export const EmojiPicker: React.FC<EmojiPickerProps> = ({ 
  emojis, 
  onSelectEmoji, 
  onEmojiSelect,
  onClose,
  className
}) => {
  // Use the appropriate handler based on which one is provided
  const handleEmojiClick = (emoji: string) => {
    if (onEmojiSelect) {
      onEmojiSelect(emoji);
    } else {
      onSelectEmoji(emoji);
    }
    onClose();
  };

  return (
    <div className={cn(
      "absolute bottom-full right-0 mb-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-100 dark:border-gray-700 p-2 grid grid-cols-6 gap-1 glass-morphism animate-scale-in z-10",
      className
    )}>
      {emojis.map(emoji => (
        <button 
          key={emoji}
          className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded text-lg transition-colors"
          onClick={() => handleEmojiClick(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
};

export default EmojiPicker;
