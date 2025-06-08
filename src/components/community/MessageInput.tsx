
import React, { useState, useRef, useEffect } from 'react';
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { Send, Smile, Plus } from 'lucide-react';
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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
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
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
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
    
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  const insertFormatting = (format: string) => {
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
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={handleSendMessage} className="space-y-2">
          {/* Main input area with Discord-like styling */}
          <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200">
            {/* File upload button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
              onClick={() => {
                const input = document.createElement('input');
                input.type = 'file';
                input.multiple = true;
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files;
                  if (files) handleFileUpload(files);
                };
                input.click();
              }}
            >
              <Plus size={18} />
            </Button>
            
            {/* Message input */}
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => handleInputChange(e.target.value)}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Message #${getChannelDisplayName()}...`}
                className="w-full bg-transparent border-0 outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed min-h-[20px] max-h-[120px] overflow-y-auto"
                disabled={isLoading}
                maxLength={2000}
                rows={1}
              />
            </div>
            
            {/* Emoji picker button */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
            >
              <Smile size={18} />
            </Button>
            
            {/* Send button */}
            <Button
              type="submit"
              size="sm"
              disabled={!message.trim() || isLoading}
              className={`h-8 w-8 p-0 shrink-0 transition-all duration-200 ${
                message.trim() && !isLoading
                  ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md'
                  : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
              }`}
            >
              <Send size={16} />
            </Button>
          </div>
          
          {/* Enhanced status bar with typing indicator */}
          <TypingIndicator
            channelName={channelName}
            isTyping={isTyping}
          />
          
          {/* Simple emoji picker */}
          {showEmojiPicker && (
            <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-3 shadow-lg">
              <div className="grid grid-cols-8 gap-2">
                {['😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-2xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 transition-colors duration-150"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </form>
      </div>
    </TooltipProvider>
  );
};

export default MessageInput;
