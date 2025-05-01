
import React, { useState, useRef, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Smile, 
  Send,
  Image,
  AtSign,
  Gift,
  Mic,
  Paperclip
} from "lucide-react";
import { EmojiPicker } from '@/components/EmojiPicker';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { toast } from 'sonner';

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Focus textarea on mount
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [channelName]);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
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
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      if (onAttachmentUpload) {
        onAttachmentUpload(files);
      } else {
        // Fallback if no attachment handler provided
        const fileNames = Array.from(files).map(file => file.name).join(', ');
        toast.info(`Selected files: ${fileNames}`);
      }
    }
    // Reset the file input
    if (e.target) e.target.value = '';
  };
  
  return (
    <div className="p-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      <form onSubmit={handleSendMessage} className="relative">
        <div className="flex gap-2">
          <Button 
            type="button"
            variant="ghost" 
            size="icon" 
            className="flex-shrink-0 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
            onClick={handleFileUpload}
          >
            <Paperclip size={20} />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={handleFileChange}
          />
          
          <div className="relative flex-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Textarea
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message #${channelName}`}
              className="min-h-[40px] max-h-[200px] py-2.5 pl-3 pr-10 bg-transparent border-none focus:ring-0 resize-none w-full"
              disabled={isLoading}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 rounded-full"
                  >
                    <Smile size={18} className="text-gray-500 dark:text-gray-400" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-64 p-0" align="end" alignOffset={-40}>
                  <EmojiPicker
                    emojis={['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋']}
                    onSelectEmoji={handleEmojiSelect}
                    onClose={() => setShowEmojiPicker(false)}
                  />
                </PopoverContent>
              </Popover>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
              >
                <AtSign size={18} className="text-gray-500 dark:text-gray-400" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
              >
                <Gift size={18} className="text-gray-500 dark:text-gray-400" />
              </Button>
              
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
              >
                <Image size={18} className="text-gray-500 dark:text-gray-400" />
              </Button>
            </div>
          </div>
          
          <Button
            type="submit"
            size="icon"
            className="flex-shrink-0"
            disabled={!message.trim() || isLoading}
          >
            {isLoading ? (
              <span className="animate-spin">⏳</span>
            ) : message.trim() ? (
              <Send size={20} />
            ) : (
              <Mic size={20} />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default MessageInput;
