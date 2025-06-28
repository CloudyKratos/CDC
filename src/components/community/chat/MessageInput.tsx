
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Send } from 'lucide-react';

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

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentMessage.trim() || isSending) return;

    try {
      await onSendMessage(currentMessage);
      setCurrentMessage('');
    } catch (error) {
      // Error already handled in the hook
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={currentMessage}
          onChange={(e) => setCurrentMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message #${activeChannel}...`}
          disabled={!isConnected || isSending}
          className="flex-1"
        />
        <Button
          type="submit"
          disabled={!currentMessage.trim() || !isConnected || isSending}
          size="sm"
          className="px-4"
        >
          {isSending ? (
            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
      
      {!isConnected && (
        <p className="text-xs text-red-600 mt-2">
          Reconnecting to chat...
        </p>
      )}
    </div>
  );
};

export default MessageInput;
