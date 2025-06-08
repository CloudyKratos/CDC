
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from './ChatMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Message } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Users } from 'lucide-react';

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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                <p className="text-gray-500 dark:text-gray-400">Loading messages...</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-16 px-8">
              <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-12 h-12 text-blue-500 opacity-60" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Welcome to the beginning!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto mb-4">
                This is the start of your conversation in this channel. Say hello and introduce yourself to the community!
              </p>
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Users className="w-4 h-4" />
                <span>Be the first to share your thoughts</span>
              </div>
            </div>
          ) : (
            <>
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center justify-center my-6">
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                    <Badge variant="outline" className="mx-4 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 px-3 py-1">
                      {getDateLabel(dateKey)}
                    </Badge>
                    <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700"></div>
                  </div>
                  
                  <div className="space-y-1">
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
                </div>
              ))}
            </>
          )}
          
          <div ref={scrollRef} />
        </div>
      </ScrollArea>
      
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent className="bg-white dark:bg-gray-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this message? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageList;
