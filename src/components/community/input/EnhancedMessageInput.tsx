
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Smile, Paperclip, Image, File } from 'lucide-react';
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
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lastTypingTime = useRef<number>(0);
  
  // Use activeChannel or channelName or default to "general"
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

  // Typing indicator logic
  useEffect(() => {
    if (message.trim()) {
      setIsTyping(true);
      lastTypingTime.current = Date.now();
      
      const timer = setTimeout(() => {
        if (Date.now() - lastTypingTime.current >= 1000) {
          setIsTyping(false);
        }
      }, 1000);
      
      return () => clearTimeout(timer);
    } else {
      setIsTyping(false);
    }
  }, [message]);
  
  const handleSendMessage = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || isSending || disabled) return;
    
    const messageToSend = message.trim();
    setMessage(""); // Clear input immediately for better UX
    
    try {
      const success = await onSendMessage(messageToSend);
      if (success) {
        // Reset textarea height
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
        }
      } else {
        // Restore message if sending failed
        setMessage(messageToSend);
      }
    } catch (error) {
      // Restore message on error
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

  const getChannelDisplayName = () => {
    return displayChannelName.replace(/-/g, ' ');
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        toast.info(`File sharing coming soon! Selected: ${fileNames}`);
      }
    };
    input.click();
  };

  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', 
    '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨',
    '🚀', '⭐', '💡', '🎯', '🏆', '🌟', '💎', '🔮'
  ];

  const defaultPlaceholder = placeholder || `Message #${getChannelDisplayName()}...`;
  const isDisabled = disabled || !isConnected;
  
  return (
    <div className="relative">
      {/* Typing indicator */}
      {isTyping && (
        <div className="absolute -top-8 left-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center space-x-1">
            <div className="flex space-x-1">
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-100"></div>
              <div className="w-1 h-1 bg-blue-500 rounded-full animate-bounce delay-200"></div>
            </div>
            <span>typing...</span>
          </div>
        </div>
      )}
      
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Main input container */}
          <div className={cn(
            "flex items-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl border transition-all duration-200 p-3 shadow-sm",
            isDisabled ? "border-red-200 dark:border-red-800" : "border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20"
          )}>
            {/* File upload button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
              onClick={handleFileUpload}
              disabled={isDisabled}
            >
              <Paperclip size={18} />
            </Button>
            
            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder={isDisabled ? "Chat temporarily unavailable..." : defaultPlaceholder}
                className={cn(
                  "w-full bg-transparent border-0 outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm leading-relaxed min-h-[24px] max-h-[120px] overflow-y-auto",
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
                  className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
                  disabled={isDisabled}
                >
                  <Smile size={18} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80 p-3" align="end">
                <div className="grid grid-cols-8 gap-2">
                  {emojis.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-2 transition-colors duration-150 hover:scale-110"
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
              disabled={!message.trim() || isLoading || isSending || isDisabled}
              className={cn(
                "h-8 w-8 p-0 shrink-0 transition-all duration-200 rounded-lg",
                message.trim() && !isLoading && !isSending && !isDisabled
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg hover:scale-105'
                  : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
              )}
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Send size={16} />
              )}
            </Button>
          </div>
          
          {/* Status and character count */}
          <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
            <span>
              {isDisabled ? "Reconnecting..." : "Press Enter to send, Shift+Enter for new line"}
            </span>
            <span className={message.length > 1800 ? 'text-orange-500' : ''}>
              {message.length}/2000
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
