
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Smile, 
  Paperclip, 
  Image, 
  Mic,
  Plus,
  Sparkles
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
    '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨',
    '🚀', '⭐', '💡', '🎯', '🏆', '🌟', '💎', '🔮'
  ];

  return (
    <div className="p-4">
      <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 shadow-lg transition-all duration-200 focus-within:shadow-xl focus-within:border-blue-300 dark:focus-within:border-blue-600">
        <div className="flex items-end gap-3 p-4">
          {/* Additional actions */}
          <div className="flex gap-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900/30 text-gray-500 hover:text-blue-600"
              onClick={handleFileUpload}
              disabled={disabled}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-green-100 dark:hover:bg-green-900/30 text-gray-500 hover:text-green-600"
              onClick={handleImageUpload}
              disabled={disabled}
            >
              <Image className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Message input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={onKeyPress}
              placeholder={disabled ? "Connecting..." : placeholder}
              disabled={disabled}
              className="min-h-[40px] max-h-[120px] resize-none border-0 bg-transparent focus:ring-0 focus:border-0 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-gray-100"
              rows={1}
            />
          </div>
          
          {/* Right side actions */}
          <div className="flex items-center gap-2">
            {/* Voice note */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 w-9 p-0 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/30 text-gray-500 hover:text-purple-600"
              onClick={handleVoiceNote}
              disabled={disabled}
            >
              <Mic className="h-4 w-4" />
            </Button>
            
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full hover:bg-yellow-100 dark:hover:bg-yellow-900/30 text-gray-500 hover:text-yellow-600"
                  disabled={disabled}
                >
                  <Smile className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-4 bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-gray-200/50 dark:border-gray-700/50 shadow-xl" align="end">
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl hover:bg-gray-100 dark:hover:bg-slate-700 rounded-lg p-2 transition-all duration-150 hover:scale-110"
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
              className={`h-9 w-9 p-0 rounded-full transition-all duration-200 ${
                value.trim() && !disabled
                  ? 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              }`}
            >
              {value.trim() && !disabled ? (
                <Send className="h-4 w-4" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="px-4 pb-2 flex justify-between items-center text-xs text-gray-500 dark:text-gray-400">
          <span>
            {disabled ? "Reconnecting..." : "Press Enter to send, Shift+Enter for new line"}
          </span>
          <span className={value.length > 1800 ? 'text-orange-500' : ''}>
            {value.length}/2000
          </span>
        </div>
      </div>
    </div>
  );
};
