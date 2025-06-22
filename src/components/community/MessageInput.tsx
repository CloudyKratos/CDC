
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { 
  Send, 
  Smile, 
  Paperclip, 
  AtSign,
  Hash,
  Bold,
  Italic,
  Code
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  isLoading: boolean;
  placeholder?: string;
  channelId: string | null;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  isLoading,
  placeholder = "Type a message...",
  channelId
}) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { user } = useAuth();

  // Handle typing indicators
  useEffect(() => {
    if (!channelId || !user) return;

    const handleTyping = async () => {
      if (message.trim() && !isTyping) {
        setIsTyping(true);
        try {
          await supabase
            .from('typing_indicators')
            .upsert({
              channel_id: channelId,
              user_id: user.id,
              started_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 10000).toISOString()
            });
        } catch (error) {
          console.error('Failed to set typing indicator:', error);
        }
      }

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Set new timeout to stop typing
      typingTimeoutRef.current = setTimeout(async () => {
        if (isTyping) {
          setIsTyping(false);
          try {
            await supabase
              .from('typing_indicators')
              .delete()
              .eq('channel_id', channelId)
              .eq('user_id', user.id);
          } catch (error) {
            console.error('Failed to clear typing indicator:', error);
          }
        }
      }, 3000);
    };

    if (message.trim()) {
      handleTyping();
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, channelId, user, isTyping]);

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;

    const messageContent = message.trim();
    setMessage('');
    
    // Clear typing indicator
    if (isTyping && channelId && user) {
      setIsTyping(false);
      try {
        await supabase
          .from('typing_indicators')
          .delete()
          .eq('channel_id', channelId)
          .eq('user_id', user.id);
      } catch (error) {
        console.error('Failed to clear typing indicator:', error);
      }
    }

    await onSendMessage(messageContent);
    
    // Focus back to textarea
    textareaRef.current?.focus();
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const insertFormatting = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = message.substring(start, end);
    
    const newText = message.substring(0, start) + before + selectedText + after + message.substring(end);
    setMessage(newText);
    
    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  return (
    <div className="space-y-2">
      {/* Formatting Toolbar */}
      <div className="flex items-center space-x-1 px-1">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('**', '**')}
          className="h-7 w-7 p-0"
        >
          <Bold className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('*', '*')}
          className="h-7 w-7 p-0"
        >
          <Italic className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('`', '`')}
          className="h-7 w-7 p-0"
        >
          <Code className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => insertFormatting('@')}
          className="h-7 w-7 p-0"
        >
          <AtSign className="h-3 w-3" />
        </Button>
      </div>

      {/* Input Area */}
      <div className="flex items-end space-x-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={placeholder}
            disabled={isLoading}
            className="min-h-[44px] max-h-32 resize-none pr-20"
            rows={1}
          />
          
          {/* Toolbar in textarea */}
          <div className="absolute right-2 bottom-2 flex items-center space-x-1">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={isLoading}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-7 w-7 p-0"
              disabled={isLoading}
            >
              <Smile className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          size="sm"
          className="h-11"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Character count and tips */}
      <div className="flex justify-between text-xs text-muted-foreground px-1">
        <span>
          {message.length > 0 && `${message.length}/2000 characters`}
        </span>
        <span>
          **bold** *italic* `code` @mention
        </span>
      </div>
    </div>
  );
};

export default MessageInput;
