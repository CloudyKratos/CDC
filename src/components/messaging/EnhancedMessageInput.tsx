import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Loader2 } from 'lucide-react';
import { useTypingIndicator } from '@/hooks/use-typing-indicator';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isLoading: boolean;
  recipientName: string;
  placeholder?: string;
  channelId?: string;
}

const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSendMessage,
  isLoading,
  recipientName,
  placeholder,
  channelId
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  
  // Initialize typing indicator if channelId is provided
  const { startTyping, stopTyping, cleanup } = channelId 
    ? useTypingIndicator({ channelId }) 
    : { startTyping: () => {}, stopTyping: () => {}, cleanup: () => {} };

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending || isLoading) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);
    stopTyping(); // Stop typing indicator when sending

    try {
      const success = await onSendMessage(messageToSend);
      if (!success) {
        // If sending failed, restore the message
        setMessage(messageToSend);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessage(messageToSend);
    } finally {
      setIsSending(false);
    }
  }, [message, onSendMessage, isSending, isLoading, stopTyping]);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setMessage(newValue);
    
    // Start typing when user starts typing
    if (newValue.length > 0 && channelId) {
      startTyping();
    } else if (newValue.length === 0) {
      stopTyping();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Cleanup typing indicator on unmount or when message is cleared
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Stop typing when message is cleared
  useEffect(() => {
    if (message.length === 0) {
      stopTyping();
    }
  }, [message, stopTyping]);

  return (
    <div className="p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder || `Message ${recipientName}...`}
            disabled={isLoading || isSending}
            rows={1}
            className="resize-none min-h-[44px] max-h-32 rounded-3xl border-2 focus:border-primary transition-colors"
          />
        </div>
        
        <Button 
          onClick={handleSendMessage}
          disabled={!message.trim() || isLoading || isSending}
          size="sm"
          className="h-11 w-11 rounded-full p-0 shrink-0"
        >
          {isSending || isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </div>
    </div>
  );
};

export default EnhancedMessageInput;