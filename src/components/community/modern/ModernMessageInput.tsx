
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Paperclip, 
  Smile, 
  AtSign,
  Hash,
  Bold,
  Italic
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ModernMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = "Type a message...",
  className = ""
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (onKeyPress) {
      onKeyPress(e);
    }
  };

  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = `${newHeight}px`;
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
    adjustTextareaHeight();
  };

  const canSend = value.trim().length > 0 && !disabled;

  return (
    <div className={cn("p-4", className)}>
      <div className={cn(
        "relative bg-white dark:bg-gray-800 rounded-2xl border transition-all duration-200 shadow-sm",
        isFocused 
          ? "border-blue-500 dark:border-blue-400 shadow-md ring-2 ring-blue-500/20" 
          : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
      )}>
        {/* Toolbar */}
        <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-100 dark:border-gray-700">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <Bold className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <Italic className="h-3.5 w-3.5" />
          </Button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-700 mx-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <AtSign className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <Hash className="h-3.5 w-3.5" />
          </Button>
          <div className="flex-1" />
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <Smile className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            disabled={disabled}
          >
            <Paperclip className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Input Area */}
        <div className="flex items-end gap-3 p-3">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={disabled}
            placeholder={placeholder}
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 min-h-[20px] max-h-[100px]"
            rows={1}
            style={{ lineHeight: '20px' }}
          />
          
          <Button
            onClick={onSend}
            disabled={!canSend}
            className={cn(
              "h-8 w-8 p-0 rounded-lg transition-all duration-200",
              canSend
                ? "bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-md hover:shadow-lg"
                : "bg-gray-200 dark:bg-gray-700 cursor-not-allowed"
            )}
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>

        {/* Character Counter (optional) */}
        {value.length > 1800 && (
          <div className="px-3 pb-2">
            <div className={cn(
              "text-xs text-right",
              value.length > 2000 ? "text-red-500" : "text-gray-400"
            )}>
              {value.length}/2000
            </div>
          </div>
        )}
      </div>

      {/* Tips */}
      {!disabled && (
        <div className="flex items-center justify-between mt-2 px-1">
          <div className="flex items-center gap-4 text-xs text-gray-400 dark:text-gray-500">
            <span>Press Enter to send</span>
            <span>Shift + Enter for new line</span>
          </div>
          <div className="flex items-center gap-1">
            <div className={cn(
              "w-2 h-2 rounded-full",
              !disabled ? "bg-green-500 animate-pulse" : "bg-red-500"
            )} />
            <span className="text-xs text-gray-400 dark:text-gray-500">
              {!disabled ? "Connected" : "Disconnected"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
