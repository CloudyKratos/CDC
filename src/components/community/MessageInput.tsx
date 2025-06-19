
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Send } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  activeChannel: string;
  isConnected: boolean;
  isLoading: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  activeChannel,
  isConnected,
  isLoading
}) => {
  const [messageInput, setMessageInput] = useState('');

  const handleSendMessage = async () => {
    if (!messageInput.trim()) return;
    
    const content = messageInput.trim();
    setMessageInput('');
    
    try {
      await onSendMessage(content);
    } catch (error) {
      // Restore input on error
      setMessageInput(content);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <div className="flex gap-2">
        <Input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message #${activeChannel}...`}
          disabled={!isConnected || isLoading}
          className="flex-1"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!messageInput.trim() || !isConnected || isLoading}
          size="sm"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
