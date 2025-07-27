
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
    <form onSubmit={handleSubmit} className={cn("p-4", className)}>
      <div className="relative">
        {/* Main input container */}
        <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 p-3 focus-within:border-blue-500 dark:focus-within:border-blue-400 transition-colors">
          
          {/* Textarea */}
          <div className="flex-1 min-w-0">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={handleTextareaChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || isSending}
              className="min-h-[20px] max-h-[120px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-gray-500 dark:placeholder:text-gray-400 focus-visible:ring-0 focus-visible:ring-offset-0"
              rows={1}
            />
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Emoji button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              disabled={disabled}
            >
              <Smile className="h-4 w-4" />
            </Button>

            {/* Send button */}
            <Button
              type="submit"
              size="sm"
              disabled={!canSend}
              className={cn(
                "h-8 w-8 p-0 rounded-full transition-all duration-200",
                canSend
                  ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                  : "bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400"
              )}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Character count */}
        {message.length > maxLength * 0.8 && (
          <div className="flex justify-end mt-1">
            <span className={cn(
              "text-xs",
              message.length >= maxLength
                ? "text-red-500 dark:text-red-400"
                : "text-gray-500 dark:text-gray-400"
            )}>
              {message.length}/{maxLength}
            </span>
          </div>
        )}
      </div>

      {/* Quick actions hint */}
      {message.length === 0 && (
        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
          <span>Press Enter to send, Shift + Enter for new line</span>
        </div>
      )}
    </form>
  );
};
