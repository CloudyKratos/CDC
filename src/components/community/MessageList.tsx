
import React, { useRef, useEffect } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatMessage from './ChatMessage';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Message } from '@/types/chat';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, Users, Sparkles, Coffee } from 'lucide-react';

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
                <div className="relative">
                  <div className="animate-spin h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-blue-500" />
                </div>
                <p className="text-gray-500 dark:text-gray-400 text-lg font-medium">Loading messages...</p>
                <p className="text-gray-400 dark:text-gray-500 text-sm mt-1">Connecting to the community</p>
              </div>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20 px-8">
              <div className="relative mb-8">
                <div className="w-32 h-32 bg-gradient-to-br from-blue-100 via-purple-100 to-indigo-100 dark:from-blue-900/20 dark:via-purple-900/20 dark:to-indigo-900/20 rounded-full flex items-center justify-center mx-auto shadow-lg">
                  <MessageSquare className="w-16 h-16 text-blue-500 opacity-70" />
                </div>
                <div className="absolute -top-2 -right-8 transform rotate-12">
                  <Coffee className="w-8 h-8 text-yellow-500 opacity-60" />
                </div>
                <div className="absolute -bottom-4 -left-6 transform -rotate-12">
                  <Sparkles className="w-6 h-6 text-purple-500 opacity-60" />
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to the beginning!
              </h3>
              <p className="text-gray-600 dark:text-gray-400 max-w-lg mx-auto mb-6 leading-relaxed">
                This is the start of your conversation in this channel. Say hello, introduce yourself, and start building connections with the amazing warrior community!
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800 px-4 py-2 rounded-full">
                  <Users className="w-4 h-4" />
                  <span>Be the first to share your thoughts</span>
                </div>
                <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-4 py-2 rounded-full text-blue-600 dark:text-blue-400">
                  <Sparkles className="w-4 h-4" />
                  <span>Start the conversation</span>
                </div>
              </div>
            </div>
          ) : (
            <>
              {sortedDates.map(dateKey => (
                <div key={dateKey}>
                  <div className="flex items-center justify-center my-8">
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                    <Badge variant="outline" className="mx-6 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 px-4 py-2 shadow-sm font-medium">
                      {getDateLabel(dateKey)}
                    </Badge>
                    <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent dark:via-gray-700"></div>
                  </div>
                  
                  <div className="space-y-2">
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
        <AlertDialogContent className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-gray-900 dark:text-white">Delete Message</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-gray-400">
              Are you sure you want to delete this message? This action cannot be undone and the message will be permanently removed from the conversation.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700 text-white">
              Delete Message
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default MessageList;
