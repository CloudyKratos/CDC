
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Send, Smile, Plus, Paperclip } from 'lucide-react';
import { toast } from 'sonner';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

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
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      await onSendMessage(message.trim());
      setMessage("");
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Error sending message:", error);
      toast.error("Failed to send message. Please try again.");
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e as unknown as React.FormEvent);
    }
  };
  
  const handleEmojiSelect = (emoji: string) => {
    setMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
    textareaRef.current?.focus();
  };

  const getChannelDisplayName = () => {
    return channelName.replace(/-/g, ' ');
  };

  const handleFileUpload = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.accept = 'image/*,video/*,.pdf,.doc,.docx,.txt';
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files && onAttachmentUpload) {
        onAttachmentUpload(files);
      } else if (files) {
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        toast.info(`File sharing coming soon! Selected: ${fileNames}`);
      }
    };
    input.click();
  };

  const emojis = [
    '😀', '😂', '😍', '🤔', '👍', '👎', '❤️', '🔥', 
    '💯', '🎉', '😎', '🤝', '💪', '🙌', '👏', '✨',
    '🚀', '⭐', '💡', '🎯', '🏆', '🌟', '💎', '🔮'
  ];
  
  return (
    <div className="px-4 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <form onSubmit={handleSendMessage} className="space-y-3">
        {/* Main input container */}
        <div className="flex items-end gap-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200 p-3">
          {/* File upload button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
            onClick={handleFileUpload}
          >
            <Paperclip size={18} />
          </Button>
          
          {/* Message input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message #${getChannelDisplayName()}...`}
              className="w-full bg-transparent border-0 outline-none resize-none text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 text-sm leading-relaxed min-h-[20px] max-h-[120px] overflow-y-auto"
              disabled={isLoading}
              maxLength={2000}
              rows={1}
            />
          </div>
          
          {/* Emoji picker */}
          <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 shrink-0"
              >
                <Smile size={18} />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-3" align="end">
              <div className="grid grid-cols-8 gap-2">
                {emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    className="text-xl hover:bg-gray-100 dark:hover:bg-gray-700 rounded p-2 transition-colors duration-150 hover:scale-110"
                    onClick={() => handleEmojiSelect(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Send button */}
          <Button
            type="submit"
            size="sm"
            disabled={!message.trim() || isLoading}
            className={`h-8 w-8 p-0 shrink-0 transition-all duration-200 ${
              message.trim() && !isLoading
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                : 'bg-gray-300 dark:bg-gray-600 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Send size={16} />
          </Button>
        </div>
        
        {/* Character count */}
        <div className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400 px-1">
          <span>Press Enter to send, Shift+Enter for new line</span>
          <span className={message.length > 1800 ? 'text-orange-500' : ''}>
            {message.length}/2000
          </span>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
