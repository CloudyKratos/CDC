
import React, { useState, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  PlusCircle, 
  Smile, 
  Send,
  Image,
  AtSign,
  Gift,
  Mic
} from "lucide-react";
import { EmojiPicker } from '@/components/EmojiPicker';

interface MessageInputProps {
  onSendMessage: (content: string) => Promise<void>;
  isLoading?: boolean;
  channelName?: string;
}

const MessageInput: React.FC<MessageInputProps> = ({ 
  onSendMessage,
  isLoading = false,
  channelName = "general"
}) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!message.trim() || isLoading) return;
    
    try {
      await onSendMessage(message);
      setMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
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
  };
  
  const handleFileUpload = () => {
    fileInputRef.current?.click();
  };
  
  const emojis = ['😊', '👍', '🎉', '❤️', '🚀', '🔥', '👏', '😂', '🤔', '👋', '✅', '⭐', '💡', '📈', '🙌', '💪', '🌟', '🎯', '💯', '🏆', '🎊', '🙏', '👌', '💬'];
  
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
            <PlusCircle size={20} />
          </Button>
          
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            multiple
            onChange={(e) => console.log('Files selected:', e.target.files)}
          />
          
          <div className="relative flex-1 rounded-md bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={`Message #${channelName}`}
              className="min-h-[40px] max-h-[200px] py-2.5 pl-3 pr-10 bg-transparent border-none focus:ring-0 resize-none w-full"
              disabled={isLoading}
            />
            
            <div className="absolute bottom-2 right-2 flex items-center space-x-1">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-7 w-7 rounded-full"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              >
                <Smile size={18} className="text-gray-500 dark:text-gray-400" />
              </Button>
              
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
            
            {showEmojiPicker && (
              <div className="absolute bottom-full right-0 mb-2">
                <EmojiPicker
                  emojis={emojis}
                  onSelectEmoji={handleEmojiSelect}
                  onClose={() => setShowEmojiPicker(false)}
                />
              </div>
            )}
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
