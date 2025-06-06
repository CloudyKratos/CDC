
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X, Smile, MoreHorizontal, Users } from 'lucide-react';
import { ChatMessage } from '@/services/core/types/StageTypes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface StageChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  participantCount: number;
  connectionState?: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
  currentUserId?: string;
  userRole?: 'speaker' | 'audience' | 'moderator';
}

export const StageChat: React.FC<StageChatProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onToggle,
  participantCount,
  connectionState = 'connected',
  currentUserId,
  userRole
}) => {
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const quickEmojis = ['👍', '👎', '❤️', '😂', '😮', '😢', '🎉', '👏'];

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && connectionState === 'connected') {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleEmojiClick = (emoji: string) => {
    onSendMessage(emoji);
    setShowEmojiPicker(false);
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  const getConnectionIndicator = () => {
    switch (connectionState) {
      case 'connected':
        return <div className="w-2 h-2 bg-green-400 rounded-full" />;
      case 'connecting':
      case 'reconnecting':
        return <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" />;
      case 'disconnected':
        return <div className="w-2 h-2 bg-red-400 rounded-full" />;
      default:
        return <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />;
    }
  };

  const getMessageStyles = (message: ChatMessage) => {
    const isCurrentUser = message.userId === currentUserId;
    const isSystemMessage = message.type === 'system';
    
    if (isSystemMessage) {
      return "bg-blue-500/10 border border-blue-500/20 text-blue-300 text-center italic";
    }
    
    if (isCurrentUser) {
      return "bg-blue-600 text-white ml-8";
    }
    
    return "bg-white/5 text-white mr-8";
  };

  const unreadCount = messages.filter(m => m.userId !== currentUserId).length;

  return (
    <div className={cn(
      "fixed right-4 bottom-20 w-80 bg-black/95 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-300 z-50 shadow-2xl",
      isOpen ? "h-96" : "h-12"
    )}>
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium">Chat</span>
          <span className="text-xs text-white/60">({participantCount})</span>
          {!isOpen && unreadCount > 0 && (
            <div className="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs text-white font-medium">
              {unreadCount > 9 ? '9+' : unreadCount}
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          {isOpen ? (
            <X className="w-4 h-4 text-white/60 hover:text-white" />
          ) : (
            getConnectionIndicator()
          )}
        </div>
      </div>

      {/* Chat Content */}
      {isOpen && (
        <>
          {/* Connection Status */}
          {connectionState !== 'connected' && (
            <div className="px-3 py-2 bg-yellow-500/10 border-b border-white/10">
              <div className="flex items-center gap-2 text-yellow-400 text-xs">
                {getConnectionIndicator()}
                <span>
                  {connectionState === 'connecting' && 'Connecting...'}
                  {connectionState === 'reconnecting' && 'Reconnecting...'}
                  {connectionState === 'disconnected' && 'Disconnected'}
                </span>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className="px-3 py-2 border-b border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                {quickEmojis.slice(0, 4).map((emoji, index) => (
                  <button
                    key={index}
                    onClick={() => handleEmojiClick(emoji)}
                    className="w-6 h-6 text-sm hover:bg-white/10 rounded transition-colors"
                    disabled={connectionState !== 'connected'}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
              
              <DropdownMenu open={showEmojiPicker} onOpenChange={setShowEmojiPicker}>
                <DropdownMenuTrigger asChild>
                  <Button size="sm" variant="ghost" className="w-6 h-6 p-0 text-white/60 hover:text-white">
                    <Smile className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-48">
                  <div className="grid grid-cols-4 gap-1 p-2">
                    {quickEmojis.map((emoji, index) => (
                      <DropdownMenuItem
                        key={index}
                        onClick={() => handleEmojiClick(emoji)}
                        className="justify-center text-lg hover:bg-white/10 cursor-pointer"
                      >
                        {emoji}
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3 h-56">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 text-sm py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-1">
                  {message.type !== 'system' && (
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-blue-400 font-medium">{message.userName}</span>
                      <span className="text-white/40">{formatTimestamp(message.timestamp)}</span>
                    </div>
                  )}
                  <div className={cn(
                    "text-sm rounded-lg p-2 max-w-full break-words",
                    getMessageStyles(message)
                  )}>
                    {message.message}
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-3 border-t border-white/10">
            <div className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={connectionState === 'connected' ? "Type a message..." : "Chat unavailable"}
                disabled={connectionState !== 'connected'}
                className="flex-1 bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white placeholder-white/60 text-sm focus:outline-none focus:border-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
                maxLength={500}
              />
              <button
                type="submit"
                disabled={!newMessage.trim() || connectionState !== 'connected'}
                className="bg-blue-600 hover:bg-blue-700 disabled:bg-white/10 disabled:text-white/40 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            
            {/* Character count */}
            {newMessage.length > 400 && (
              <div className="text-xs text-white/60 mt-1 text-right">
                {newMessage.length}/500
              </div>
            )}
          </form>
        </>
      )}
    </div>
  );
};
