
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { formatDistanceToNow } from 'date-fns';
import { Conversation } from '@/services/messaging/DirectMessageService';

interface ConversationListProps {
  conversations: Conversation[];
  selectedRecipientId: string | null;
  onSelectConversation: (recipientId: string) => void;
  isLoading: boolean;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedRecipientId,
  onSelectConversation,
  isLoading
}) => {
  if (isLoading) {
    return (
      <div className="p-4 space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
        <p>No conversations yet</p>
        <p className="text-sm mt-1">Start a new conversation to get started!</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200 dark:divide-gray-700">
      {conversations.map((conversation) => {
        const isSelected = selectedRecipientId === conversation.other_participant?.id;
        const hasUnread = (conversation.unread_count || 0) > 0;
        
        return (
          <div
            key={conversation.id}
            onClick={() => conversation.other_participant && onSelectConversation(conversation.other_participant.id)}
            className={`p-4 cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-blue-50 dark:bg-blue-900/20 border-r-2 border-blue-500' 
                : 'hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
          >
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Avatar className="h-10 w-10">
                  <AvatarImage 
                    src={conversation.other_participant?.avatar_url || ''} 
                    alt={conversation.other_participant?.full_name || 'User'} 
                  />
                  <AvatarFallback>
                    {(conversation.other_participant?.full_name || conversation.other_participant?.username || 'U')[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {hasUnread && (
                  <div className="absolute -top-1 -right-1 h-3 w-3 bg-blue-500 rounded-full"></div>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h4 className={`text-sm font-medium truncate ${
                    hasUnread ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  }`}>
                    {conversation.other_participant?.full_name || 
                     conversation.other_participant?.username || 
                     'Unknown User'}
                  </h4>
                  
                  <div className="flex items-center space-x-2">
                    {hasUnread && (
                      <Badge variant="default" className="h-5 min-w-[20px] text-xs px-1.5">
                        {conversation.unread_count}
                      </Badge>
                    )}
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      {formatDistanceToNow(new Date(conversation.last_activity_at), { addSuffix: true })}
                    </span>
                  </div>
                </div>
                
                {conversation.last_message && (
                  <p className={`text-sm truncate mt-1 ${
                    hasUnread ? 'text-gray-600 dark:text-gray-300 font-medium' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    {conversation.last_message.content}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;
