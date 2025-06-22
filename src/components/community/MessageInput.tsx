
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Smile, Paperclip } from 'lucide-react';
import { cn } from "@/lib/utils";

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  channelName?: string;
  activeChannel?: string;
  placeholder?: string;
  disabled?: boolean;
  isConnected?: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  isLoading = false,
  channelName,
  activeChannel,
  placeholder,
  disabled = false,
  isConnected = true
}) => {
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const channel = channelName || activeChannel || "general";
  const isInputDisabled = disabled || isLoading || isSending || !isConnected;
  
  const defaultPlaceholder = placeholder || `Message #${channel.replace(/-/g, ' ')}...`;
  
  useEffect(() => {
    inputRef.current?.focus();
  }, []);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isInputDisabled) return;
    
    const messageToSend = message.trim();
    setMessage("");
    setIsSending(true);
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      setMessage(messageToSend);
      console.error("Error sending message:", error);
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSendMessage} className="space-y-3">
        <div className={cn(
          "flex items-center gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl border transition-all duration-200 p-3",
          isInputDisabled ? "border-red-200 dark:border-red-800 opacity-50" : "border-slate-200 dark:border-slate-700"
        )}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0"
            disabled={isInputDisabled}
          >
            <Paperclip size={16} />
          </Button>
          
          <Input
            ref={inputRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isInputDisabled ? "Chat unavailable..." : defaultPlaceholder}
            disabled={isInputDisabled}
            className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0"
            maxLength={2000}
          />
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0"
            disabled={isInputDisabled}
          >
            <Smile size={16} />
          </Button>
          
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isInputDisabled}
            className={cn(
              "h-8 w-8 p-0 shrink-0 transition-all duration-200",
              message.trim() && !isInputDisabled
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
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
        
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
          <span>
            {!isConnected ? "Reconnecting..." : "Press Enter to send"}
          </span>
          <span className={message.length > 1800 ? 'text-orange-500' : ''}>
            {message.length}/2000
          </span>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
