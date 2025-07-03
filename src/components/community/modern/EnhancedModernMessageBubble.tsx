import React, { useState } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { 
  MoreVertical,
  Reply,
  Smile,
  Trash2,
  Copy,
  Pin,
  Flag
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MessageReactions } from './MessageReactions';
import { MessageThread } from './MessageThread';
import { toast } from 'sonner';
import type { Message } from '@/types/chat';
import { supabase } from '@/integrations/supabase/client';

interface Reaction {
  emoji: string;
  count: number;
  users: string[];
  hasReacted: boolean;
}

interface EnhancedModernMessageBubbleProps {
  message: Message & {
    reactions?: Reaction[];
    replies?: Message[];
    isPinned?: boolean;
  };
  isOwn: boolean;
  onDelete?: (messageId: string) => void;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onRemoveReaction?: (messageId: string, emoji: string) => void;
  onPin?: (messageId: string) => void;
  onReport?: (messageId: string) => void;
  onSendReply?: (content: string, parentId: string) => Promise<boolean>;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  isThread?: boolean;
  hideActions?: boolean;
  isConnected?: boolean;
  className?: string;
}

export const EnhancedModernMessageBubble: React.FC<EnhancedModernMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onReply,
  onReact,
  onRemoveReaction,
  onPin,
  onReport,
  onSendReply,
  showAvatar = true,
  isConsecutive = false,
  isThread = false,
  hideActions = false,
  isConnected = true,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [showReportDialog, setShowReportDialog] = useState(false);
  const [reportReason, setReportReason] = useState('');

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
    toast.success('Message copied to clipboard');
  };

  const handleReportMessage = async () => {
    if (!reportReason.trim()) {
      toast.error('Please provide a reason for reporting');
      return;
    }

    try {
      const { error } = await supabase
        .from('message_reports')
        .insert({
          message_id: message.id,
          reporter_id: (await supabase.auth.getUser()).data.user?.id,
          reason: reportReason.trim()
        });

      if (error) throw error;

      toast.success('Message reported successfully');
      setShowReportDialog(false);
      setReportReason('');
    } catch (error) {
      console.error('Error reporting message:', error);
      toast.error('Failed to report message');
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const senderName = message.sender?.full_name || message.sender?.username || 'Unknown User';
  const senderInitials = senderName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <>
      <div 
        className={`group flex gap-3 px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors ${
          message.isPinned ? 'bg-yellow-50 dark:bg-yellow-900/10 border-l-4 border-yellow-400' : ''
        } ${className}`}
        onMouseEnter={() => setShowActions(true)}
        onMouseLeave={() => setShowActions(false)}
      >
        {/* Avatar */}
        <div className="flex-shrink-0">
          {showAvatar && !isConsecutive ? (
            <Avatar className="h-8 w-8">
              <AvatarImage src={message.sender?.avatar_url || ''} alt={senderName} />
              <AvatarFallback className="text-xs font-medium bg-blue-500 text-white">
                {senderInitials}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div className="w-8 h-8 flex items-center justify-center">
              <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                {formatTime(message.created_at)}
              </span>
            </div>
          )}
        </div>

        {/* Message Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          {showAvatar && !isConsecutive && (
            <div className="flex items-baseline gap-2 mb-1">
              <span className="font-semibold text-sm text-gray-900 dark:text-white">
                {senderName}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {formatTime(message.created_at)}
              </span>
              {message.isPinned && (
                <Pin className="h-3 w-3 text-yellow-600 dark:text-yellow-400" />
              )}
            </div>
          )}

          {/* Message Text */}
          <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap break-words">
            {message.content}
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <MessageReactions
              messageId={message.id}
              reactions={message.reactions}
              onAddReaction={onReact || (() => {})}
              onRemoveReaction={onRemoveReaction || (() => {})}
              className="mt-1"
            />
          )}

          {/* Thread Preview */}
          {message.replies && message.replies.length > 0 && !isThread && onSendReply && (
            <MessageThread
              parentMessage={message}
              replies={message.replies}
              onSendReply={onSendReply}
              isConnected={isConnected}
              className="mt-2"
            />
          )}
        </div>

        {/* Actions */}
        {showActions && !hideActions && (
          <div className="flex-shrink-0 flex items-start gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onReact?.(message.id, '👍')}
            >
              <Smile className="h-3 w-3" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
              onClick={() => onReply?.(message.id)}
            >
              <Reply className="h-3 w-3" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600"
                >
                  <MoreVertical className="h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleCopyMessage}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy message
                </DropdownMenuItem>
                
                {onPin && (
                  <DropdownMenuItem onClick={() => onPin(message.id)}>
                    <Pin className="h-4 w-4 mr-2" />
                    {message.isPinned ? 'Unpin message' : 'Pin message'}
                  </DropdownMenuItem>
                )}
                
                <DropdownMenuSeparator />
                
                {!isOwn && (
                  <DropdownMenuItem onClick={() => setShowReportDialog(true)}>
                    <Flag className="h-4 w-4 mr-2" />
                    Report message
                  </DropdownMenuItem>
                )}
                
                {isOwn && onDelete && (
                  <DropdownMenuItem 
                    onClick={() => onDelete(message.id)}
                    className="text-red-600 dark:text-red-400"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete message
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      {/* Report Dialog */}
      {showReportDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Report Message</h3>
            <textarea
              placeholder="Please describe why you're reporting this message..."
              value={reportReason}
              onChange={(e) => setReportReason(e.target.value)}
              className="w-full p-3 border rounded-lg resize-none h-24"
            />
            <div className="flex gap-2 mt-4">
              <Button onClick={handleReportMessage} variant="destructive">
                Submit Report
              </Button>
              <Button onClick={() => setShowReportDialog(false)} variant="outline">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
