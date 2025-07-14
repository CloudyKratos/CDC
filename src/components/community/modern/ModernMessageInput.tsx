
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  Mic
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

interface ModernMessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
  placeholder?: string;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({
  value,
  onChange,
  onSend,
  onKeyPress,
  disabled = false,
  placeholder = 'Type a message...'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
    }
  }, [value]);

  const handleEmojiSelect = (emoji: string) => {
    onChange(value + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const handleFileUpload = () => {
    toast.info('File sharing coming soon!');
  };

  const handleImageUpload = () => {
    toast.info('Image sharing coming soon!');
  };

  const handleVoiceNote = () => {
    toast.info('Voice messages coming soon!');
  };

  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', 
    '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨'
  ];

  return (
    <div className="p-3">
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
        <div className="flex items-end gap-2 p-3">
          {/* Left actions */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            onClick={handleFileUpload}
            disabled={disabled}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          {/* Message input */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder={placeholder}
              disabled={disabled}
              className="min-h-[36px] max-h-[120px] resize-none border-0 bg-transparent focus:ring-0 focus:border-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100 p-0"
              rows={1}
            />
          </div>
          
          {/* Right actions */}
          <div className="flex items-center gap-1">
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  disabled={disabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 p-3" align="end">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-lg hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-1 transition-colors"
                      onClick={() => handleEmojiSelect(emoji)}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
            
            {/* Send button */}
            <Button
              type="button"
              onClick={onSend}
              disabled={!value.trim() || disabled}
              size="sm"
              className={`h-8 w-8 p-0 ml-1 ${
                value.trim() && !disabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
