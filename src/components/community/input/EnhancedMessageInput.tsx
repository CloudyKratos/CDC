
import React, { useState, useCallback, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Paperclip, Smile } from "lucide-react";
import MessageInputField from './MessageInputField';
import SendButton from './SendButton';

interface EnhancedMessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isConnected: boolean;
  isSending: boolean;
  activeChannel: string;
  placeholder?: string;
}

const EnhancedMessageInput: React.FC<EnhancedMessageInputProps> = ({
  onSendMessage,
  isConnected,
  isSending,
  activeChannel,
  placeholder
}) => {
  const [message, setMessage] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const inputRef = useRef<HTMLDivElement>(null);

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || isSending || !isConnected) return;

    const messageToSend = message.trim();
    setMessage(''); // Clear immediately for better UX
    
    try {
      await onSendMessage(messageToSend);
    } catch (error) {
      // Restore message on error
      setMessage(messageToSend);
    }
  }, [message, isSending, isConnected, onSendMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  const canSend = message.trim() && isConnected && !isSending;
  const defaultPlaceholder = placeholder || `Message #${activeChannel}...`;

  return (
    <div className="relative bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
      <div className="p-4">
        <div className="relative flex items-end gap-3">
          {/* Message Input Field */}
          <div className="flex-1 relative">
            <MessageInputField
              value={message}
              onChange={setMessage}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={isConnected ? defaultPlaceholder : 'Connecting to chat...'}
              disabled={!isConnected}
              isFocused={isFocused}
            />
            
            {/* Input Actions */}
            <div className="absolute right-3 bottom-3 flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={!isConnected}
                  >
                    <Paperclip size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Attach file (coming soon)</p>
                </TooltipContent>
              </Tooltip>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    disabled={!isConnected}
                  >
                    <Smile size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Add emoji (coming soon)</p>
                </TooltipContent>
              </Tooltip>
              
              {/* Character count for long messages */}
              {message.length > 1500 && (
                <span className="text-xs text-gray-400 px-2">
                  {message.length}/2000
                </span>
              )}
            </div>
          </div>

          {/* Send Button */}
          <SendButton
            hasMessage={canSend}
            isLoading={isSending}
            onClick={handleSendMessage}
          />
        </div>

        {/* Connection Status */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
            <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {isConnected ? 'Connected' : 'Reconnecting...'}
            </span>
          </div>
          
          {!isConnected && (
            <span className="text-gray-500 dark:text-gray-400">
              Messages will be sent when connected
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancedMessageInput;
