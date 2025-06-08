
import React, { useState, useRef, useEffect } from 'react';
import { Textarea } from "@/components/ui/textarea";
import { TooltipProvider } from "@/components/ui/tooltip";
import { toast } from 'sonner';
import FormattingToolbar from './input/FormattingToolbar';
import FileUploadMenu from './input/FileUploadMenu';
import InputActions from './input/InputActions';
import SendButton from './input/SendButton';
import StatusBar from './input/StatusBar';

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus textarea on mount and auto-resize
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
      // Auto-resize textarea
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [channelName, message]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    setIsTyping(false);
    
    try {
      await onSendMessage(message);
      setMessage("");
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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    setIsTyping(e.target.value.length > 0);
  };
  
  const handleEmojiSelect = (emoji: string) => {
    // Insert emoji at current cursor position
    if (textareaRef.current) {
      const start = textareaRef.current.selectionStart || 0;
      const end = textareaRef.current.selectionEnd || 0;
      const newMessage = message.substring(0, start) + emoji + message.substring(end);
      setMessage(newMessage);
      
      // Focus back on textarea and place cursor after inserted emoji
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.focus();
          textareaRef.current.selectionStart = start + emoji.length;
          textareaRef.current.selectionEnd = start + emoji.length;
        }
      }, 10);
    } else {
      setMessage(prev => prev + emoji);
    }
  };

  const insertFormatting = (format: string) => {
    if (!textareaRef.current) return;
    
    const start = textareaRef.current.selectionStart || 0;
    const end = textareaRef.current.selectionEnd || 0;
    const selectedText = message.substring(start, end);
    
    let formattedText = '';
    switch (format) {
      case 'bold':
        formattedText = `**${selectedText || 'bold text'}**`;
        break;
      case 'italic':
        formattedText = `*${selectedText || 'italic text'}*`;
        break;
      case 'code':
        formattedText = `\`${selectedText || 'code'}\``;
        break;
      case 'link':
        formattedText = `[${selectedText || 'link text'}](url)`;
        break;
    }
    
    const newMessage = message.substring(0, start) + formattedText + message.substring(end);
    setMessage(newMessage);
    
    // Focus and set cursor position
    setTimeout(() => {
      if (textareaRef.current) {
        textareaRef.current.focus();
        const newPosition = start + formattedText.length;
        textareaRef.current.selectionStart = newPosition;
        textareaRef.current.selectionEnd = newPosition;
      }
    }, 10);
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
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                placeholder={`Message #${getChannelDisplayName()}...`}
                className={`min-h-[56px] max-h-[200px] py-4 pl-4 pr-40 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none rounded-2xl transition-all duration-200 ${isFocused ? 'shadow-lg' : ''}`}
                disabled={isLoading}
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
          
          {/* Status bar */}
          <StatusBar 
            isTyping={isTyping}
            channelName={channelName}
            messageLength={message.length}
          />
        </form>
      </div>
    </TooltipProvider>
  );
};

export default MessageInput;
