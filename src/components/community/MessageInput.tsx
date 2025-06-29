
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
  const [message, setMessage] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || !isConnected) return;

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
    if (isConnected && !isSending) {
      inputRef.current?.focus();
    }
  }, [isConnected, isSending]);

  const canSend = message.trim() && isConnected && !isSending;

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          ref={inputRef}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
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
