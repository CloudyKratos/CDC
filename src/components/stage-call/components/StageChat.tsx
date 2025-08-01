
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Send, X } from 'lucide-react';
import { ChatMessage } from '../hooks/useStageChat';

interface StageChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  onClose: () => void;
  currentUserId: string;
  currentUserName: string;
}

const StageChat: React.FC<StageChatProps> = ({
  messages,
  onSendMessage,
  onClose,
  currentUserId,
  currentUserName
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focus input when chat opens
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: true,
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getMessageTypeStyle = (type: ChatMessage['type']) => {
    switch (type) {
      case 'system':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'hand-raise':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'mute-toggle':
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default:
        return '';
    }
  };

  return (
    <div className="w-80 bg-black/40 backdrop-blur-sm border-l border-white/10 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-white/10">
        <h3 className="text-lg font-semibold text-white">Stage Chat</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/60 hover:text-white"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 px-4">
        <div className="space-y-3 py-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`${
                message.type === 'system' || message.type === 'hand-raise' || message.type === 'mute-toggle'
                  ? `p-2 rounded-lg border ${getMessageTypeStyle(message.type)}`
                  : ''
              }`}
            >
              {message.type === 'text' ? (
                <div className={`${
                  message.userId === currentUserId ? 'text-right' : 'text-left'
                }`}>
                  {message.userId !== currentUserId && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-white/80">
                        {message.userName}
                      </span>
                      <span className="text-xs text-white/60">
                        {formatTime(message.timestamp)}
                      </span>
                    </div>
                  )}
                  <div
                    className={`inline-block px-3 py-2 rounded-lg max-w-[80%] ${
                      message.userId === currentUserId
                        ? 'bg-blue-600 text-white ml-auto'
                        : 'bg-white/10 text-white'
                    }`}
                  >
                    <p className="text-sm break-words">{message.message}</p>
                    {message.userId === currentUserId && (
                      <span className="text-xs text-blue-200 block mt-1">
                        {formatTime(message.timestamp)}
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{message.message}</p>
                  <span className="text-xs opacity-70">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input */}
      <div className="p-4 border-t border-white/10">
        <div className="flex gap-2">
          <Input
            ref={inputRef}
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
          />
          <Button
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
            size="sm"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default StageChat;
