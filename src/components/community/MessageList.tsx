
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from './ChatMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Message } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';

interface MessageListProps {
  messages: Message[];
  isLoading?: boolean;
  onDeleteMessage?: (messageId: string) => void;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  isLoading = false,
  onDeleteMessage
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);
  const [selectedMessageId, setSelectedMessageId] = React.useState<string | null>(null);
  
  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);
  
  const handleDelete = (messageId: string) => {
    setSelectedMessageId(messageId);
    setShowDeleteDialog(true);
  };
  
  const confirmDelete = () => {
    if (selectedMessageId && onDeleteMessage) {
      onDeleteMessage(selectedMessageId);
      toast.success('Message deleted successfully');
    }
    setShowDeleteDialog(false);
    setSelectedMessageId(null);
  };
  
  const handleReaction = (messageId: string, reaction: string) => {
    toast.success(`Added reaction ${reaction} to message`);
  };
  
  const handleReply = (messageId: string) => {
    toast.info(`Replying to message ${messageId}`);
  };
  
  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at);
      const dateKey = new Date(date.getFullYear(), date.getMonth(), date.getDate()).toISOString();
      
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      
      groups[dateKey].push(message);
    });
    
    return groups;
  };
  
  const groupedMessages = groupMessagesByDate(messages);
  const sortedDates = Object.keys(groupedMessages).sort();
  
  const getDateLabel = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) {
      return 'Today';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    }
  };
  
  return (
    <>
      <ScrollArea className="flex-1 px-0">
        <div className="py-4">
          {isLoading ? (
            <div className="flex items-center justify-center h-24">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p className="text-lg font-medium">Welcome to the beginning of this channel!</p>
              <p className="text-sm mt-2">Be the first one to send a message</p>
            </div>
          ) : (
            <>
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center justify-center my-4">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/10">
                      {getDateLabel(dateKey)}
                    </Badge>
                  </div>
                  
                  {groupedMessages[dateKey].map((message, index) => (
                    <ChatMessage
                      key={message.id}
                      message={message}
                      onDelete={handleDelete}
                      onReaction={handleReaction}
                      onReply={handleReply}
                      isLast={index === groupedMessages[dateKey].length - 1}
                    />
                  ))}
                </div>
              ))}
            </>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Message</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageList;
