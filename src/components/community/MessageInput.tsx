
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
  Paperclip,
  Hash
} from "lucide-react";
import { EmojiPicker } from '@/components/EmojiPicker';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
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
  const [isTyping, setIsTyping] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
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
        toast.success(`Files selected: ${fileNames}`, {
          description: "File sharing feature coming soon!"
        });
      }
    }
    // Reset the file input
    if (e.target) e.target.value = '';
  };

  const getChannelDisplayName = () => {
    return channelName.replace(/-/g, ' ');
  };
  
  return (
    <TooltipProvider>
      <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <form onSubmit={handleSendMessage} className="space-y-3">
          {/* Main input area */}
          <div className="flex gap-3">
            {/* File upload button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="flex-shrink-0 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                  onClick={handleFileUpload}
                >
                  <Paperclip size={20} />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Attach files</p>
              </TooltipContent>
            </Tooltip>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileChange}
            />
            
            {/* Message input */}
            <div className="relative flex-1">
              <Textarea
                ref={textareaRef}
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                placeholder={`Message #${getChannelDisplayName()}`}
                className="min-h-[44px] max-h-[120px] py-3 pl-4 pr-32 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none rounded-lg"
                disabled={isLoading}
              />
              
              {/* Action buttons in input */}
              <div className="absolute bottom-2 right-2 flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Smile size={18} className="text-gray-500 dark:text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-64 p-0" align="end" alignOffset={-40}>
                        <EmojiPicker
                          emojis={['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆']}
                          onSelectEmoji={handleEmojiSelect}
                          onClose={() => setShowEmojiPicker(false)}
                        />
                      </PopoverContent>
                    </Popover>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Add emoji</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => toast.info("Mention feature coming soon!")}
                    >
                      <AtSign size={18} className="text-gray-500 dark:text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mention someone</p>
                  </TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => toast.info("GIF feature coming soon!")}
                    >
                      <Gift size={18} className="text-gray-500 dark:text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send GIF</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Send button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className="flex-shrink-0 bg-blue-600 hover:bg-blue-700 text-white h-11 w-11"
                  disabled={!message.trim() || isLoading}
                >
                  {isLoading ? (
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                  ) : message.trim() ? (
                    <Send size={20} />
                  ) : (
                    <Mic size={20} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{message.trim() ? 'Send message' : 'Voice message'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Typing indicator and quick actions */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {isTyping && (
                <span className="flex items-center gap-1">
                  <div className="w-1 h-1 bg-green-500 rounded-full animate-pulse"></div>
                  Typing...
                </span>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span>Use Shift + Enter for new line</span>
              <span className="flex items-center gap-1">
                <Hash size={12} />
                {getChannelDisplayName()}
              </span>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
};

export default MessageInput;
