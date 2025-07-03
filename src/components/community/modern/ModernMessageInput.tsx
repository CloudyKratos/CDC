
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Send, 
  Paperclip, 
  Smile, 
  Mic, 
  Image as ImageIcon,
  X,
  Plus
} from 'lucide-react';
import { toast } from 'sonner';

interface ModernMessageInputProps {
  onSendMessage: (content: string) => Promise<boolean>;
  onStartTyping?: () => void;
  isConnected: boolean;
  isLoading: boolean;
  channelName: string;
  placeholder?: string;
}

export const ModernMessageInput: React.FC<ModernMessageInputProps> = ({
  onSendMessage,
  onStartTyping,
  isConnected,
  isLoading,
  channelName,
  placeholder
}) => {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (value: string) => {
    setMessage(value);
    
    // Trigger typing indicator
    if (onStartTyping && value.trim()) {
      onStartTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(() => {
        // Stop typing indicator after 3 seconds
      }, 3000);
    }

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isSending || !isConnected) return;

    const messageToSend = message.trim();
    setMessage('');
    setIsSending(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      const success = await onSendMessage(messageToSend);
      if (!success) {
        setMessage(messageToSend);
        toast.error('Failed to send message');
      }
    } catch (error) {
      setMessage(messageToSend);
      toast.error('Failed to send message');
    } finally {
      setIsSending(false);
      textareaRef.current?.focus();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleFileUpload = () => {
    toast.info('File upload coming soon!');
  };

  const handleVoiceRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      toast.info('Voice recording stopped');
    } else {
      setIsRecording(true);
      toast.info('Voice recording started');
    }
  };

  const isDisabled = !isConnected || isSending || isLoading;
  const inputPlaceholder = placeholder || `Message #${channelName}...`;

  return (
    <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
      {/* Input Area */}
      <div className="p-4">
        <form onSubmit={handleSubmit} className="flex items-end gap-3">
          {/* Attachment Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isDisabled}
            onClick={handleFileUpload}
            className="h-10 w-10 p-0 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 flex-shrink-0"
          >
            <Plus className="h-5 w-5 theme-text-muted" />
          </Button>

          {/* Message Input */}
          <div className="flex-1 relative">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isDisabled ? "Connecting..." : inputPlaceholder}
              disabled={isDisabled}
              className="min-h-[44px] max-h-[120px] resize-none rounded-2xl border-gray-300 dark:border-gray-600 focus:border-blue-500 dark:focus:border-accent focus:ring-blue-500 dark:focus:ring-accent bg-gray-50 dark:bg-gray-700 pr-20"
              rows={1}
            />
            
            {/* Inline Actions */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDisabled}
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              >
                <Smile className="h-4 w-4 theme-text-muted" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={isDisabled}
                onClick={handleFileUpload}
                className="h-8 w-8 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
              >
                <ImageIcon className="h-4 w-4 theme-text-muted" />
              </Button>
            </div>
          </div>

          {/* Voice/Send Button */}
          {message.trim() ? (
            <Button
              type="submit"
              disabled={isDisabled}
              className="h-10 w-10 p-0 rounded-full bg-blue-500 hover:bg-blue-600 dark:bg-accent dark:hover:bg-accent/90 flex-shrink-0"
            >
              {isSending ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
              ) : (
                <Send className="h-4 w-4 text-white" />
              )}
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              onClick={handleVoiceRecord}
              disabled={isDisabled}
              className={`h-10 w-10 p-0 rounded-full flex-shrink-0 ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600 text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Mic className={`h-4 w-4 ${isRecording ? 'text-white' : 'theme-text-muted'}`} />
            </Button>
          )}
        </form>

        {/* Status */}
        {!isConnected && (
          <div className="mt-2 text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
            <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            Reconnecting...
          </div>
        )}
      </div>
    </div>
  );
};
