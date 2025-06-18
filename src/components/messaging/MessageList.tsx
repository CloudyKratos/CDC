
import React, { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Trash2, Reply } from 'lucide-react';
import { DirectMessage } from '@/services/messaging/DirectMessageService';

interface MessageListProps {
  messages: DirectMessage[];
  onDeleteMessage: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  onDeleteMessage
}) => {
  const { user } = useAuth();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center text-gray-500 dark:text-gray-400">
          <p>No messages yet</p>
          <p className="text-sm mt-1">Send your first message to start the conversation!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message) => {
        const isOwn = message.sender_id === user?.id;
        
        return (
          <div
            key={message.id}
            className={`flex items-start space-x-3 ${isOwn ? 'flex-row-reverse space-x-reverse' : ''}`}
          >
            <Avatar className="h-8 w-8 flex-shrink-0">
              <AvatarImage 
                src={message.sender?.avatar_url || ''} 
                alt={message.sender?.full_name || 'User'} 
              />
              <AvatarFallback className="text-xs">
                {(message.sender?.full_name || message.sender?.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className={`flex-1 max-w-xs lg:max-w-md ${isOwn ? 'items-end' : 'items-start'}`}>
              <div className={`group relative ${isOwn ? 'ml-auto' : ''}`}>
                <div
                  className={`px-4 py-2 rounded-lg shadow-sm ${
                    isOwn
                      ? 'bg-blue-500 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {message.content}
                  </p>
                </div>
                
                <div className={`flex items-center mt-1 space-x-2 ${isOwn ? 'justify-end' : 'justify-start'}`}>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDistanceToNow(new Date(message.created_at), { addSuffix: true })}
                  </span>
                  
                  {isOwn && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <MoreHorizontal className="h-3 w-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => console.log('Reply to:', message.id)}>
                          <Reply className="h-4 w-4 mr-2" />
                          Reply
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteMessage(message.id)}
                          className="text-red-600 focus:text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessageList;
