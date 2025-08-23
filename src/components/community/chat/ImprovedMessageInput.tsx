import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2, Smile, Paperclip, AtSign } from 'lucide-react';
import { useImprovedTypingIndicator } from '@/hooks/use-improved-typing-indicator';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ImprovedMessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isLoading: boolean;
  recipientName: string;
  placeholder?: string;
  channelId?: string;
  maxLength?: number;
  onTypingStart?: () => void;
  onTypingStop?: () => void;
}

export const ImprovedMessageInput: React.FC<ImprovedMessageInputProps> = ({
  onSendMessage,
  isLoading,
  recipientName,
  placeholder,
  channelId,
  maxLength = 2000,
  onTypingStart,
  onTypingStop
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { startTyping, stopTyping, cleanup } = useImprovedTypingIndicator({
    channelId: channelId || ''
  });

  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 120); // Max 5 lines
    textarea.style.height = `${newHeight}px`;
    
    setIsExpanded(newHeight > 44); // Single line height is ~44px
  }, []);

  // Handle message sending
  const handleSendMessage = useCallback(async () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage || isSending || isLoading) {
      return;
    }

    if (trimmedMessage.length > maxLength) {
      toast.error(`Message too long. Maximum ${maxLength} characters allowed.`);
      return;
    }

    setIsSending(true);
    setMessage('');
    stopTyping();
    onTypingStop?.();

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      setIsExpanded(false);
    }

    try {
      const success = await onSendMessage(trimmedMessage);
      if (!success) {
        // Restore message if sending failed
        setMessage(trimmedMessage);
        toast.error('Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(trimmedMessage);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending, isLoading, maxLength, stopTyping, onTypingStop]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    
    // Prevent input if over character limit
    if (newValue.length > maxLength) {
      return;
    }
    
    setMessage(newValue);
    adjustTextareaHeight();
    
    // Handle typing indicators
    if (newValue.length > 0 && channelId) {
      startTyping();
      onTypingStart?.();
    } else if (newValue.length === 0) {
      stopTyping();
      onTypingStop?.();
    }
  };

  // Handle keyboard shortcuts
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Send with Enter (but allow Shift+Enter for new lines)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
    
    // Escape to clear message
    if (e.key === 'Escape') {
      setMessage('');
      stopTyping();
      onTypingStop?.();
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        setIsExpanded(false);
      }
    }
  };

  // Auto-adjust height when message changes
  useEffect(() => {
    adjustTextareaHeight();
  }, [message, adjustTextareaHeight]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Character count color based on usage
  const getCharCountColor = () => {
    const percentage = (message.length / maxLength) * 100;
    if (percentage < 75) return 'text-muted-foreground';
    if (percentage < 90) return 'text-yellow-600';
    return 'text-red-600';
  };

  const isDisabled = !message.trim() || isLoading || isSending;

  return (
    <div className="border-t-2 border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="p-3 sm:p-4 safe-area-pb">
        {/* Input Container - Mobile Optimized */}
        <div className="relative">
          <motion.div 
            className="flex items-end gap-2 sm:gap-3"
            animate={{ 
              paddingBottom: isExpanded ? '6px' : '0px' 
            }}
            transition={{ duration: 0.2 }}
          >
            {/* Attachment Button - Smaller on mobile */}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full p-0 shrink-0 self-end touch-manipulation active:scale-95"
              disabled={isLoading || isSending}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            
            {/* Text Input - Mobile Optimized */}
            <div className="flex-1 relative">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={placeholder || `Message ${recipientName}...`}
                disabled={isLoading || isSending}
                rows={1}
                className="resize-none min-h-[48px] max-h-[120px] rounded-2xl border-2 focus:border-primary transition-all duration-200 pr-16 sm:pr-20 text-base leading-relaxed placeholder:text-muted-foreground/70 touch-target-optimal"
                style={{ 
                  scrollbarWidth: 'thin',
                  WebkitTapHighlightColor: 'transparent'
                }}
              />
              
              {/* Character Counter - Mobile Optimized */}
              <AnimatePresence>
                {message.length > maxLength * 0.8 && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute bottom-2 right-2 text-xs px-2 py-1 bg-background/90 backdrop-blur rounded-full border shadow-sm"
                  >
                    <span className={getCharCountColor()}>
                      {message.length}/{maxLength}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            {/* Emoji Button - Hidden on very small screens */}
            <Button
              variant="ghost"
              size="sm"
              className="h-11 w-11 rounded-full p-0 shrink-0 self-end touch-manipulation active:scale-95 hidden xs:flex"
              disabled={isLoading || isSending}
            >
              <Smile className="h-4 w-4" />
            </Button>
            
            {/* Send Button - Mobile Optimized */}
            <Button 
              onClick={handleSendMessage}
              disabled={isDisabled}
              size="sm"
              className={cn(
                "h-12 w-12 rounded-full p-0 shrink-0 self-end touch-manipulation transition-all duration-200",
                !isDisabled 
                  ? "bg-primary hover:bg-primary/90 active:scale-95 shadow-lg shadow-primary/25" 
                  : "opacity-50"
              )}
            >
              {isSending || isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </motion.div>

          {/* Quick Actions - Mobile Optimized */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center justify-between mt-2 px-1"
              >
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <span className="hidden sm:inline">Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to send</span>
                  <span className="hidden sm:inline">•</span>
                  <span className="sm:hidden">Tap send or press Enter</span>
                  <span className="hidden sm:inline"><kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Shift + Enter</kbd> for new line</span>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setMessage('');
                    stopTyping();
                    onTypingStop?.();
                  }}
                  className="text-xs h-7 px-3 touch-manipulation"
                >
                  Clear
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};