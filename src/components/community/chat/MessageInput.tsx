
import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Send, Smile, Paperclip } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  isConnected?: boolean;
  isSending?: boolean;
  activeChannel?: string;
  placeholder?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isConnected = true,
  isSending = false,
  activeChannel = 'general',
  placeholder
}) => {
  const [message, setMessage] = useState('');
  const [isLocalSending, setIsLocalSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLocalSending || isSending || !isConnected) return;

    const messageToSend = message.trim();
    setMessage(''); // Clear immediately for better UX
    setIsLocalSending(true);

    try {
      const success = await onSendMessage(messageToSend);
      if (!success) {
        // Restore message if sending failed
        setMessage(messageToSend);
        toast.error('Failed to send message');
      }
    } catch (error) {
      // Restore message on error
      setMessage(messageToSend);
      toast.error('Failed to send message');
      console.error('Error sending message:', error);
    } finally {
      setIsLocalSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as React.FormEvent);
    }
  };

  const inputPlaceholder = placeholder || `Message #${activeChannel}...`;
  const isDisabled = !isConnected || isSending || isLocalSending;

  return (
    <div className="p-4 border-t border-gray-200 dark:border-gray-700">
      <form onSubmit={handleSubmit} className="flex gap-2 items-end">
        <div className="flex-1">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder={isDisabled ? "Connecting..." : inputPlaceholder}
            disabled={isDisabled}
            className="min-h-[40px] max-h-[120px] resize-none"
            rows={1}
          />
        </div>
        
        <div className="flex gap-1">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={() => toast.info('Emoji picker coming soon!')}
          >
            <Smile className="h-4 w-4" />
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={() => toast.info('File sharing coming soon!')}
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          
          <Button
            type="submit"
            disabled={!message.trim() || isDisabled}
            size="sm"
          >
            {(isSending || isLocalSending) ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
