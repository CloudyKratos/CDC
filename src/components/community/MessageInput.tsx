
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
  placeholder?: string;
  onAttachmentUpload?: (files: FileList) => void;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  isLoading = false,
  channelName = "general",
  placeholder,
  onAttachmentUpload
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [message]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading || isSending) return;
    
    setIsSending(true);
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
    } finally {
      setIsSending(false);
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

  const defaultPlaceholder = placeholder || `Message #${getChannelDisplayName()}...`;
  
  return (
    <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700">
      <form onSubmit={handleSendMessage} className="space-y-3">
        {/* Main input container */}
        <div className="flex items-end gap-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all duration-200 p-3 shadow-sm">
          {/* File upload button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
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
              placeholder={defaultPlaceholder}
              className="w-full bg-transparent border-0 outline-none resize-none text-slate-900 dark:text-slate-100 placeholder-slate-500 dark:placeholder-slate-400 text-sm leading-relaxed min-h-[24px] max-h-[120px] overflow-y-auto"
              disabled={isLoading || isSending}
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
                className="h-8 w-8 p-0 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 shrink-0 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg"
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
                    className="text-xl hover:bg-slate-100 dark:hover:bg-slate-700 rounded p-2 transition-colors duration-150 hover:scale-110"
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
            disabled={!message.trim() || isLoading || isSending}
            className={`h-8 w-8 p-0 shrink-0 transition-all duration-200 rounded-lg ${
              message.trim() && !isLoading && !isSending
                ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                : 'bg-slate-300 dark:bg-slate-600 text-slate-500 cursor-not-allowed'
            }`}
          >
            {isSending ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            ) : (
              <Send size={16} />
            )}
          </Button>
        </div>
        
        {/* Status and character count */}
        <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 px-1">
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
