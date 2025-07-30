
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Image, Plus } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

interface EnhancedMessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isLoading?: boolean;
  isConnected?: boolean;
  isSending?: boolean;
  channelName?: string;
  placeholder?: string;
  disabled?: boolean;
  activeChannel?: string;
}

const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({ 
  onSendMessage,
  isLoading = false,
  isConnected = true,
  isSending = false,
  channelName,
  placeholder,
  disabled = false,
  activeChannel
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const displayChannelName = activeChannel || channelName || "general";
  
  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 120);
      textarea.style.height = newHeight + 'px';
    }
  }, [message]);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || isSending || disabled) return;
    
    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately
    
    try {
      const success = await onSendMessage(messageToSend);
      if (success) {
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        setMessage(messageToSend);
      }
    } catch (error) {
      setMessage(messageToSend);
      console.error("Error sending message:", error);
    } finally {
      textareaRef.current?.focus();
    }
  }, [message, isLoading, isSending, disabled, onSendMessage]);
  
  const handleKeyPress = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  }, [handleSendMessage]);
  
  const handleEmojiSelect = useCallback((emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  }, []);

  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', 
    '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨',
    '🚀', '⭐', '💡', '🎯', '🏆', '🌟', '💎', '🔮'
  ];

  const defaultPlaceholder = placeholder || `Type a message in #${displayChannelName}...`;
  const isDisabled = disabled || !isConnected;
  const canSend = message.trim().length > 0 && !isSending && !isDisabled;
  
  return (
    <div className="border-t border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="p-4">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Main input container */}
          <div className={cn(
            "flex items-end gap-3 bg-muted/30 rounded-xl border border-border/50 p-3 transition-all duration-200 shadow-sm",
            "focus-within:border-primary/50 focus-within:bg-muted/50 focus-within:shadow-md"
          )}>
            
            {/* Attachment button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted"
              disabled={isDisabled}
            >
              <Plus size={16} />
            </Button>
            
            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isDisabled ? "Reconnecting..." : defaultPlaceholder}
                className={cn(
                  "w-full bg-transparent border-0 outline-none resize-none text-foreground placeholder:text-muted-foreground text-sm leading-relaxed min-h-[24px] max-h-[120px] overflow-y-auto",
                  isDisabled && "cursor-not-allowed opacity-50"
                )}
                disabled={isDisabled || isLoading || isSending}
                maxLength={2000}
                rows={1}
              />
            </div>
            
            {/* Emoji picker */}
            <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
              <PopoverTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 text-muted-foreground hover:text-foreground shrink-0 rounded-lg hover:bg-muted"
                  disabled={isDisabled}
                >
                  <Smile size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="grid grid-cols-8 gap-1">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-lg hover:bg-muted rounded-md p-2 transition-all duration-150 hover:scale-110"
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
              type="submit"
              size="sm"
              disabled={!canSend}
              className={cn(
                "h-8 w-8 p-0 shrink-0 transition-all duration-200 rounded-lg",
                canSend
                  ? "bg-primary hover:bg-primary/90 text-primary-foreground shadow-sm hover:shadow-md hover:scale-105"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary-foreground border-t-transparent"></div>
              ) : (
                <Send size={14} />
              )}
            </Button>
          </div>
          
          {/* Helper text */}
          <div className="flex justify-between items-center text-xs text-muted-foreground px-1">
            <span>
              {isDisabled ? "Reconnecting..." : "Press Enter to send, Shift+Enter for new line"}
            </span>
            {message.length > 1600 && (
              <span className={message.length > 1900 ? 'text-destructive' : 'text-warning'}>
                {message.length}/2000
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
