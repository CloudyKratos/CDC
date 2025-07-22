import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, Users, Clock, ChevronRight } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import type { Message } from '@/types/chat';

interface ThreadParticipant {
  id: string;
  name: string;
  avatar?: string;
  lastActive?: string;
}

interface EnhancedMessageThreadProps {
  parentMessage: Message;
  replies: Message[];
  participants: ThreadParticipant[];
  onSendReply: (content: string, parentId: string) => Promise<boolean>;
  onLoadMoreReplies?: () => void;
  isConnected: boolean;
  hasMoreReplies?: boolean;
  isLoadingReplies?: boolean;
  className?: string;
  showPreview?: boolean;
  maxPreviewReplies?: number;
}

export const EnhancedMessageThread: React.FC<EnhancedMessageThreadProps> = ({
  parentMessage,
  replies,
  participants,
  onSendReply,
  onLoadMoreReplies,
  isConnected,
  hasMoreReplies = false,
  isLoadingReplies = false,
  className = '',
  showPreview = true,
  maxPreviewReplies = 3
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const replyCount = replies.length;
  const lastReply = replies[replies.length - 1];
  const previewReplies = replies.slice(-maxPreviewReplies);

  const handleSendReply = async () => {
    if (!replyText.trim() || isSending) return;

    setIsSending(true);
    try {
      const success = await onSendReply(replyText, parentMessage.id);
      if (success) {
        setReplyText('');
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  useEffect(() => {
    if (isOpen && scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [replies, isOpen]);

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (replyCount === 0 && !showPreview) return null;

  return (
    <div className={className}>
      {/* Thread Preview (shown in main chat) */}
      {showPreview && replyCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-2 ml-4 border-l-2 border-primary/20 pl-3 space-y-2"
        >
          {/* Thread stats */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <MessageSquare size={12} />
            <span>{replyCount} {replyCount === 1 ? 'reply' : 'replies'}</span>
            
            {participants.length > 0 && (
              <>
                <Users size={12} />
                <span>{participants.length} participants</span>
              </>
            )}
            
            {lastReply && (
              <>
                <Clock size={12} />
                <span>Last reply {formatTime(lastReply.created_at)}</span>
              </>
            )}
          </div>

          {/* Preview replies */}
          <div className="space-y-1">
            {previewReplies.map((reply, index) => (
              <motion.div
                key={reply.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-sm bg-secondary/50 rounded-lg p-2"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-xs">
                    {reply.sender?.full_name || reply.sender?.username || 'Anonymous'}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(reply.created_at)}
                  </span>
                </div>
                <div className="text-xs text-foreground/80 line-clamp-2">
                  {reply.content}
                </div>
              </motion.div>
            ))}
          </div>

          {/* View thread button */}
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 text-xs text-primary hover:text-primary hover:bg-primary/10"
              >
                View thread
                <ChevronRight size={12} className="ml-1" />
              </Button>
            </SheetTrigger>
            <SheetContent className="w-full sm:w-[500px] sm:max-w-[500px]">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <MessageSquare size={16} />
                  Thread
                  <Badge variant="secondary" className="text-xs">
                    {replyCount} {replyCount === 1 ? 'reply' : 'replies'}
                  </Badge>
                </SheetTitle>
              </SheetHeader>

              <div className="flex flex-col h-full mt-6">
                {/* Parent message */}
                <div className="bg-secondary/30 rounded-lg p-3 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-medium text-sm">
                      {parentMessage.sender?.full_name || parentMessage.sender?.username || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(parentMessage.created_at)}
                    </span>
                  </div>
                  <div className="text-sm">{parentMessage.content}</div>
                </div>

                <Separator className="mb-4" />

                {/* Participants */}
                {participants.length > 0 && (
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users size={14} />
                      <span className="text-sm font-medium">
                        {participants.length} participants
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {participants.map((participant) => (
                        <Badge key={participant.id} variant="outline" className="text-xs">
                          {participant.name}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Replies */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 mb-4">
                  <div className="space-y-3 pr-4">
                    <AnimatePresence>
                      {replies.map((reply, index) => (
                        <motion.div
                          key={reply.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="bg-background rounded-lg p-3 border"
                        >
                          <div className="flex items-center gap-2 mb-2">
                            <span className="font-medium text-sm">
                              {reply.sender?.full_name || reply.sender?.username || 'Anonymous'}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {formatTime(reply.created_at)}
                            </span>
                          </div>
                          <div className="text-sm">{reply.content}</div>
                        </motion.div>
                      ))}
                    </AnimatePresence>

                    {/* Load more button */}
                    {hasMoreReplies && (
                      <div className="text-center py-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={onLoadMoreReplies}
                          disabled={isLoadingReplies}
                          className="text-xs"
                        >
                          {isLoadingReplies ? 'Loading...' : 'Load more replies'}
                        </Button>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reply input */}
                <div className="border-t pt-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Reply to thread..."
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      onKeyPress={handleKeyPress}
                      disabled={!isConnected || isSending}
                      className="flex-1 px-3 py-2 text-sm bg-background border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                    <Button
                      onClick={handleSendReply}
                      disabled={!replyText.trim() || !isConnected || isSending}
                      size="sm"
                    >
                      {isSending ? 'Sending...' : 'Reply'}
                    </Button>
                  </div>
                  
                  {!isConnected && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Reconnecting...
                    </div>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </motion.div>
      )}
    </div>
  );
};