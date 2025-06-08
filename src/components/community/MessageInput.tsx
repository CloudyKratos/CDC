
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
  Hash,
  Bold,
  Italic,
  Link,
  Code
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
  const [isFocused, setIsFocused] = useState(false);
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
  
  return (
    <TooltipProvider>
      <div className={`p-6 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 transition-all duration-200 ${isFocused ? 'shadow-lg' : ''}`}>
        <form onSubmit={handleSendMessage} className="space-y-4">
          {/* Formatting toolbar */}
          {isFocused && message.length > 0 && (
            <div className="flex items-center gap-2 pb-2 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('bold')}
                      className="h-8 w-8 p-0"
                    >
                      <Bold size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Bold</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('italic')}
                      className="h-8 w-8 p-0"
                    >
                      <Italic size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Italic</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('code')}
                      className="h-8 w-8 p-0"
                    >
                      <Code size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Inline code</p></TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => insertFormatting('link')}
                      className="h-8 w-8 p-0"
                    >
                      <Link size={14} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent><p>Add link</p></TooltipContent>
                </Tooltip>
              </div>
              
              <div className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {message.length}/2000
              </div>
            </div>
          )}
          
          {/* Main input area */}
          <div className="flex gap-4">
            {/* Enhanced file upload button */}
            <Popover>
              <PopoverTrigger asChild>
                <Button 
                  type="button"
                  variant="ghost" 
                  size="icon" 
                  className="flex-shrink-0 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 h-12 w-12 rounded-full"
                >
                  <PlusCircle size={22} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-2" align="start">
                <div className="space-y-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={handleFileUpload}
                  >
                    <Paperclip className="mr-2 h-4 w-4" />
                    Upload File
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => toast.info("Image upload coming soon!")}
                  >
                    <Image className="mr-2 h-4 w-4" />
                    Upload Image
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => toast.info("GIF feature coming soon!")}
                  >
                    <Gift className="mr-2 h-4 w-4" />
                    Add GIF
                  </Button>
                </div>
              </PopoverContent>
            </Popover>
            
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              multiple
              accept="image/*,video/*,.pdf,.doc,.docx,.txt,.zip,.rar"
              onChange={handleFileChange}
            />
            
            {/* Enhanced message input */}
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
              <div className="absolute bottom-3 right-3 flex items-center space-x-1">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Popover open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                        >
                          <Smile size={18} className="text-gray-500 dark:text-gray-400" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-80 p-0" align="end" alignOffset={-40}>
                        <EmojiPicker
                          emojis={['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆', '✨', '🤝', '💎', '⚡', '🎨']}
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
                      className="h-9 w-9 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      onClick={() => toast.info("Mention feature coming soon!")}
                    >
                      <AtSign size={18} className="text-gray-500 dark:text-gray-400" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Mention someone</p>
                  </TooltipContent>
                </Tooltip>
              </div>
            </div>
            
            {/* Enhanced send button */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="submit"
                  size="icon"
                  className={`flex-shrink-0 h-12 w-12 rounded-full transition-all duration-200 ${
                    message.trim() 
                      ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl hover:scale-105' 
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500'
                  }`}
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
                <p>{message.trim() ? 'Send message (Enter)' : 'Voice message'}</p>
              </TooltipContent>
            </Tooltip>
          </div>
          
          {/* Enhanced typing indicator and quick actions */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              {isTyping && (
                <span className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <div className="flex space-x-1">
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                  Typing...
                </span>
              )}
              <span className="flex items-center gap-2">
                <Hash size={12} />
                {getChannelDisplayName()}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span>Shift + Enter for new line</span>
              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs">
                {message.length > 0 ? `${message.length}/2000` : 'Start typing...'}
              </span>
            </div>
          </div>
        </form>
      </div>
    </TooltipProvider>
  );
};

export default MessageInput;
