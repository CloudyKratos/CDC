
import React, { useState, useRef, useEffect } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import FormattingToolbar from './input/FormattingToolbar';
import FileUploadMenu from './input/FileUploadMenu';
import InputActions from './input/InputActions';
import SendButton from './input/SendButton';
import MessageInputField from './input/MessageInputField';
import TypingIndicator from './input/TypingIndicator';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  channelName?: string;
  onAttachmentUpload?: (files: FileList) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  isLoading = false,
  channelName = "general",
  onAttachmentUpload
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Focus management and typing detection
  useEffect(() => {
    if (message.length > 0 && !isTyping) {
      setIsTyping(true);
    }

    // Clear existing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (message.length > 0) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 2000);
    } else {
      setIsTyping(false);
    }

    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [message, isTyping]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    setIsTyping(false);
    
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };

  const handleInputChange = (value: string) => {
    setMessage(value);
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
  };

  const insertFormatting = (format: string) => {
    // Simplified formatting for better UX
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**bold text**`;
        break;
      case 'italic':
        formattedText = `*italic text*`;
        break;
      case 'code':
        formattedText = `\`code\``;
        break;
      case 'link':
        formattedText = `[link text](url)`;
        break;
    }
    
    setMessage(prev => prev + formattedText);
  };

  const getChannelDisplayName = () => {
    return channelName.replace(/-/g, ' ');
  };

  const handleFileUpload = (files: FileList) => {
    if (onAttachmentUpload) {
      onAttachmentUpload(files);
    } else {
      const fileNames = Array.from(files).map(file => file.name).join(', ');
      toast.success(`Files selected: ${fileNames}`, {
        description: "File sharing feature coming soon!"
      });
    }
  };
  
  return (
    <TooltipProvider>
      <div className={`p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200 ${isFocused ? 'shadow-lg' : ''}`}>
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Formatting toolbar */}
          {isFocused && message.length > 0 && (
            <FormattingToolbar 
              onFormatting={insertFormatting}
              messageLength={message.length}
            />
          )}
          
          {/* Main input area */}
          <div className="flex gap-4">
            {/* File upload menu */}
            <FileUploadMenu onFileUpload={handleFileUpload} />
            
            {/* Message input */}
            <div className="relative flex-1">
              <MessageInputField
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Message #${getChannelDisplayName()}...`}
                disabled={isLoading}
                isFocused={isFocused}
              />
              
              {/* Action buttons in input */}
              <InputActions 
                showEmojiPicker={showEmojiPicker}
                setShowEmojiPicker={setShowEmojiPicker}
                onEmojiSelect={handleEmojiSelect}
              />
            </div>
            
            {/* Send button */}
            <SendButton 
              hasMessage={!!message.trim()}
              isLoading={isLoading}
              onClick={() => {}}
            />
          </div>
          
          {/* Enhanced status bar with typing indicator */}
          <TypingIndicator
            channelName={channelName}
            isTyping={isTyping}
          />
        </form>
      </div>
    </TooltipProvider>
  );
};

export default MessageInput;
