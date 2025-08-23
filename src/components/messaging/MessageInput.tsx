
import React, { useState, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, Paperclip, Smile } from 'lucide-react';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isLoading: boolean;
  recipientName: string;
  placeholder?: string;
  channelId?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  recipientName,
  placeholder
}) => {
  const [message, setMessage] = useState('');

  const handleSend = async () => {
    if (message.trim() && !isLoading) {
      const success = await onSendMessage(message.trim());
      if (success) {
        setMessage('');
      }
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-end space-x-3">
        <div className="flex-1">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder || `Message ${recipientName}...`}
            disabled={isLoading}
            rows={1}
            className="resize-none min-h-[44px] max-h-32 rounded-3xl border-2 focus:border-primary transition-colors"
          />
        </div>
        
        <Button 
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="sm"
          className="h-11 w-11 rounded-full p-0 shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default MessageInput;
