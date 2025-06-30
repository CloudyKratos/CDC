
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Wifi, WifiOff } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isConnected?: boolean;
  isSending?: boolean;
  isLoading?: boolean; // Added for backward compatibility
  activeChannel?: string;
  channelName?: string; // Added for backward compatibility
  placeholder?: string; // Added for backward compatibility
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isConnected = true,
  isSending = false,
  isLoading = false,
  activeChannel,
  channelName,
  placeholder
}) => {
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Use channelName if provided (backward compatibility), otherwise use activeChannel
  const displayChannel = channelName || activeChannel || 'general';
  
  // Use isLoading or isSending for loading state
  const isCurrentlyLoading = isLoading || isSending;
  
  // Use isConnected, but if isLoading is true, consider it as not connected
  const isCurrentlyConnected = isConnected && !isLoading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isCurrentlyLoading || !isCurrentlyConnected) return;

    const messageToSend = message.trim();
    setMessage(''); // Clear immediately for better UX
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      // Restore message on error
      setMessage(messageToSend);
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  // Auto-focus when connected
  useEffect(() => {
    if (isCurrentlyConnected && !isCurrentlyLoading) {
      inputRef.current?.focus();
    }
  }, [isCurrentlyConnected, isCurrentlyLoading]);

  const canSend = message.trim() && isCurrentlyConnected && !isCurrentlyLoading;

  const defaultPlaceholder = isCurrentlyConnected 
    ? `Message #${displayChannel}...` 
    : 'Connecting to chat...';

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder || defaultPlaceholder}
          disabled={!isCurrentlyConnected || isCurrentlyLoading}
          className="flex-1"
          maxLength={2000}
        />
        <Button
          type="submit"
          disabled={!canSend}
          size="sm"
          className="px-4 min-w-[60px]"
        >
          {isCurrentlyLoading ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-2">
          {isCurrentlyConnected ? (
            <>
              <Wifi className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-3 w-3 text-red-600" />
              <span className="text-red-600">Reconnecting...</span>
            </>
          )}
        </div>
        
        {message && (
          <span className="text-gray-500">
            {message.length}/2000
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
