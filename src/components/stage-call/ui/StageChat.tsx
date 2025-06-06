
import React, { useState, useRef, useEffect } from 'react';
import { Send, MessageCircle, X } from 'lucide-react';
import { ChatMessage } from '@/services/core/types/StageTypes';
import { cn } from '@/lib/utils';

interface StageChatProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  isOpen: boolean;
  onToggle: () => void;
  participantCount: number;
  connectionState?: 'connected' | 'disconnected' | 'connecting' | 'reconnecting';
}

export const StageChat: React.FC<StageChatProps> = ({
  messages,
  onSendMessage,
  isOpen,
  onToggle,
  participantCount,
  connectionState = 'connected'
}) => {
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && connectionState === 'connected') {
      onSendMessage(newMessage.trim());
      setNewMessage('');
    }
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

  return (
    <div className={cn(
      "fixed right-4 bottom-20 w-80 bg-black/90 backdrop-blur-md rounded-lg border border-white/20 transition-all duration-300 z-50",
      isOpen ? "h-96" : "h-12"
    )}>
      {/* Chat Header */}
      <div 
        className="flex items-center justify-between p-3 border-b border-white/10 cursor-pointer"
        onClick={onToggle}
      >
        <div className="flex items-center gap-2">
          <MessageCircle className="w-4 h-4 text-blue-400" />
          <span className="text-white font-medium">Chat</span>
          <span className="text-xs text-white/60">({participantCount})</span>
        </div>
        {isOpen ? (
          <X className="w-4 h-4 text-white/60 hover:text-white" />
        ) : (
          getConnectionIndicator()
        )}
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

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 h-64">
            {messages.length === 0 ? (
              <div className="text-center text-white/60 text-sm py-8">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No messages yet</p>
                <p className="text-xs">Start the conversation!</p>
              </div>
            ) : (
              messages.map((message) => (
                <div key={message.id} className="space-y-1">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-blue-400 font-medium">{message.userName}</span>
                    <span className="text-white/40">{formatTimestamp(message.timestamp)}</span>
                  </div>
                  <div className="text-white text-sm bg-white/5 rounded-lg p-2">
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
          </form>
        </>
      )}
    </div>
  );
};
