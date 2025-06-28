
import React, { useState, useRef, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send, Wifi, WifiOff } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isConnected: boolean;
  isSending: boolean;
  activeChannel: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isConnected,
  isSending,
  activeChannel
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isSending || !isConnected) return;

    const messageToSend = currentMessage.trim();
    setCurrentMessage(''); // Clear immediately for better UX
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      // Restore message on error
      setCurrentMessage(messageToSend);
      // Focus input for retry
      inputRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  // Auto-focus when connected
  useEffect(() => {
    if (isConnected && !isSending) {
      inputRef.current?.focus();
    }
  }, [isConnected, isSending]);

  const canSend = currentMessage.trim() && isConnected && !isSending;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          ref={inputRef}
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={
            isConnected 
              ? `Message #${activeChannel}...` 
              : 'Connecting to chat...'
          }
          disabled={!isConnected || isSending}
          className="flex-1"
          maxLength={2000}
        />
        <Button
          type="submit"
          disabled={!canSend}
          size="sm"
          className="px-4 min-w-[60px]"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      <div className="flex items-center justify-between mt-2 text-xs">
        <div className="flex items-center gap-2">
          {isConnected ? (
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
        
        {currentMessage && (
          <span className="text-gray-500">
            {currentMessage.length}/2000
          </span>
        )}
      </div>
    </div>
  );
};

export default MessageInput;
