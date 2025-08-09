
import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Smile, Paperclip, Mic } from 'lucide-react';
import { cn } from '@/lib/utils';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  disabled?: boolean;
  placeholder?: string;
  maxLength?: number;
  className?: string;
}

export const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSendMessage,
  disabled = false,
  placeholder = "Type your message...",
  maxLength = 2000,
  className = ''
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = useCallback(async (e?: React.FormEvent) => {
    e?.preventDefault();
    
    if (!message.trim() || isSending || disabled) return;

    setIsSending(true);
    try {
      const success = await onSendMessage(message.trim());
      if (success) {
        setMessage('');
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending, disabled]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  const handleTextareaChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
    }

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max height of ~6 lines
    textarea.style.height = `${newHeight}px`;
  }, [maxLength]);

  const canSend = message.trim().length > 0 && !isSending && !disabled;

  return (
    <form onSubmit={handleSubmit} className={cn("p-3 sm:p-4 pb-safe", className)}>
      <div className="relative">
        {/* Main input container - Mobile optimized */}
        <div className={cn(
          "flex items-end gap-2 sm:gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl",
          "border border-gray-200 dark:border-gray-700 p-3 sm:p-3",
          "focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors",
          "shadow-sm focus-within:shadow-md" // Enhanced focus state
        )}>
          
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className={cn(
                "min-h-[40px] sm:min-h-[20px] max-h-[120px] resize-none border-0 bg-transparent",
                "p-0 text-sm leading-relaxed", // Better line height for mobile
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "touch-manipulation" // Better touch response
              )}
              rows={1}
            />
          </div>

          {/* Action buttons - Mobile optimized */}
          <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0">
            {/* Emoji button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-10 w-10 sm:h-8 sm:w-8 p-0 touch-target", // Larger on mobile
                "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200",
                "rounded-full transition-all duration-200"
              )}
              disabled={disabled}
            >
              <Smile className="h-5 w-5 sm:h-4 sm:w-4" />
            </Button>

            {/* Send button - Mobile optimized */}
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              className={cn(
                "h-10 w-10 sm:h-8 sm:w-8 p-0 rounded-full touch-target", // Larger on mobile
                "transition-all duration-200 shadow-sm active:scale-95", // Better mobile feedback
                canSend
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              )}
            >
              {isSending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5 sm:h-4 sm:w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Character count */}
        {message.length > maxLength * 0.8 && (
          <div className="flex justify-end mt-2">
            <span className={cn(
              "text-xs px-2 py-1 rounded-full", // Better visual treatment
              message.length >= maxLength
                ? "text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
                : "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50"
            )}>
              {message.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Quick actions hint - Hidden on mobile to save space */}
      {message.length === 0 && (
        <div className="hidden sm:flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift + Enter for new line</span>
        </div>
      )}
    </form>
  );
};
