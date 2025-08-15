
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
    <form onSubmit={handleSubmit} className={cn("p-4 pb-safe", className)}>
      <div className="relative">
        {/* Enhanced Main input container - Mobile optimized */}
        <div className={cn(
          "flex items-end gap-3 bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-800/90 rounded-2xl",
          "border border-gray-200/70 dark:border-gray-700/70 p-4",
          "focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-all duration-300",
          "shadow-lg focus-within:shadow-xl focus-within:shadow-blue-500/20 backdrop-blur-sm" // Enhanced focus state
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
                "min-h-[44px] max-h-[120px] resize-none border-0 bg-transparent",
                "p-0 text-base leading-relaxed", // Better mobile sizing
                "placeholder:text-gray-500 dark:placeholder:text-gray-400",
                "focus-visible:ring-0 focus-visible:ring-offset-0",
                "touch-manipulation font-medium" // Better touch response and readability
              )}
              rows={1}
            />
          </div>

          {/* Enhanced Action buttons - Mobile optimized */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Enhanced Emoji button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={cn(
                "h-11 w-11 p-0 touch-target-optimal", // Optimal mobile size
                "text-gray-500 hover:text-yellow-500 dark:text-gray-400 dark:hover:text-yellow-400",
                "rounded-xl transition-all duration-300 hover:bg-yellow-50 dark:hover:bg-yellow-900/20 active:scale-95"
              )}
              disabled={disabled}
            >
              <Smile className="h-5 w-5" />
            </Button>

            {/* Enhanced Send button - Mobile optimized */}
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              className={cn(
                "h-11 w-11 p-0 rounded-xl touch-target-optimal", // Optimal mobile size
                "transition-all duration-300 shadow-lg active:scale-95", // Better mobile feedback
                canSend
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-500/30 hover:shadow-blue-500/50"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              )}
            >
              {isSending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
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
