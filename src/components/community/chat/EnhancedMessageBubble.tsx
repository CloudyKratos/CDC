import React, { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  MoreHorizontal, 
  Reply, 
  Heart, 
  Trash2, 
  Edit,
  MessageSquare,
  Copy,
  Check,
  X
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MessageReactions } from '../modern/MessageReactions';
import { Message } from '@/types/chat';

interface EnhancedMessageBubbleProps {
  message: Message;
  isOwn: boolean;
  onDelete?: (messageId: string) => Promise<void>;
  onEdit?: (messageId: string, content: string) => Promise<boolean>;
  onReply?: (messageId: string) => void;
  onReact?: (messageId: string, emoji: string) => void;
  onOpenThread?: (messageId: string) => void;
  showAvatar?: boolean;
  isConsecutive?: boolean;
  className?: string;
}

export const EnhancedMessageBubble: React.FC<EnhancedMessageBubbleProps> = ({
  message,
  isOwn,
  onDelete,
  onEdit,
  onReply,
  onReact,
  onOpenThread,
  showAvatar = true,
  isConsecutive = false,
  className = ''
}) => {
  const [showActions, setShowActions] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [isDeleting, setIsDeleting] = useState(false);

  const sender = message.sender || {
    id: message.sender_id,
    username: 'Unknown User',
    full_name: 'Unknown User',
    avatar_url: null
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(message.content);
  };

  const handleSaveEdit = async () => {
    if (onEdit && editContent.trim() !== message.content) {
      const success = await onEdit(message.id, editContent.trim());
      if (success) {
        setIsEditing(false);
      }
    } else {
      setIsEditing(false);
    }
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete(message.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  // Show deleted message placeholder
  if (message.is_deleted) {
    return (
      <div className={`group relative px-4 py-2 transition-all duration-200 ${
        isConsecutive ? 'mt-1' : 'mt-4'
      } ${className}`}>
        <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
          {showAvatar && !isConsecutive && (
            <div className="flex-shrink-0">
              <Avatar className="h-8 w-8 opacity-50">
                <AvatarFallback className="bg-muted text-muted-foreground">
                  {(sender.full_name || sender.username || 'U')[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
          <div className={`flex flex-col min-w-0 flex-1 ${isConsecutive && showAvatar ? 'ml-11' : ''}`}>
            <div className="italic text-muted-foreground text-sm p-2 border border-dashed rounded-lg">
              This message was deleted
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div 
      className={`group relative px-4 py-2 transition-all duration-200 hover:bg-muted/30 ${
        isConsecutive ? 'mt-1' : 'mt-4'
      } ${className}`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        {showAvatar && !isConsecutive && (
          <div className="flex-shrink-0">
            <Avatar className="h-8 w-8 ring-2 ring-background shadow-sm">
              <AvatarImage 
                src={sender.avatar_url || ''} 
                alt={sender.full_name || sender.username || 'User'} 
              />
              <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
                {(sender.full_name || sender.username || 'U')[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        )}

        {/* Message Content */}
        <div className={`flex flex-col min-w-0 flex-1 ${isConsecutive && showAvatar ? 'ml-11' : ''}`}>
          {/* Header */}
          {!isConsecutive && (
            <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="font-semibold text-foreground text-sm">
                {sender.full_name || sender.username || 'Unknown User'}
              </span>
              <span className="text-xs text-muted-foreground">
                {formatTime(message.created_at)}
              </span>
              {message.edited && (
                <Badge variant="outline" className="text-xs px-1 py-0 bg-muted/50 text-muted-foreground">
                  edited
                </Badge>
              )}
              {isOwn && (
                <Badge variant="outline" className="text-xs px-2 py-0 bg-primary/10 text-primary border-primary/20">
                  You
                </Badge>
              )}
            </div>
          )}

          {/* Message Bubble */}
          <div className={`relative ${isOwn ? 'flex justify-end' : 'flex justify-start'}`}>
            <div className={`
              relative max-w-[85%] px-4 py-3 rounded-2xl shadow-sm backdrop-blur-sm transition-all duration-200
              ${isOwn 
                ? 'bg-primary text-primary-foreground rounded-br-md' 
                : 'bg-muted/50 text-foreground border border-border/50 rounded-bl-md'
              }
            `}>
              {isEditing ? (
                <div className="space-y-2">
                  <Textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="min-h-[60px] resize-none bg-background/50"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && e.ctrlKey) {
                        handleSaveEdit();
                      } else if (e.key === 'Escape') {
                        handleCancelEdit();
                      }
                    }}
                  />
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="ghost" onClick={handleCancelEdit}>
                      <X className="h-3 w-3 mr-1" />
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveEdit}>
                      <Check className="h-3 w-3 mr-1" />
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-sm leading-relaxed break-words whitespace-pre-wrap">
                  {message.content}
                </p>
              )}
            </div>
          </div>

          {/* Reactions */}
          {message.reactions && message.reactions.length > 0 && (
            <div className="mt-2">
              <MessageReactions
                messageId={message.id}
                reactions={message.reactions}
                onAddReaction={(messageId, emoji) => onReact?.(messageId, emoji)}
                onRemoveReaction={(messageId, emoji) => onReact?.(messageId, emoji)}
                className={isOwn ? 'justify-end' : 'justify-start'}
              />
            </div>
          )}

          {/* Thread Count */}
          {message.thread_count && message.thread_count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onOpenThread?.(message.id)}
              className={`mt-2 text-xs text-muted-foreground hover:text-foreground ${
                isOwn ? 'self-end' : 'self-start'
              }`}
            >
              <MessageSquare className="h-3 w-3 mr-1" />
              {message.thread_count} {message.thread_count === 1 ? 'reply' : 'replies'}
            </Button>
          )}
        </div>

        {/* Actions */}
        {showActions && !isEditing && (
          <div className={`flex items-start mt-1 transition-all duration-200 ${
            isOwn ? 'order-first mr-2' : 'order-last ml-2'
          }`}>
            <div className="flex items-center gap-1 bg-background/90 backdrop-blur-sm border border-border/50 rounded-lg p-1 shadow-lg">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReact?.(message.id, '❤️')}
                className="h-7 w-7 p-0 rounded-md hover:bg-red-50 hover:text-red-500 transition-colors"
                title="React with heart"
              >
                <Heart className="h-3.5 w-3.5" />
              </Button>

              {onReply && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onReply(message.id)}
                  className="h-7 w-7 p-0 rounded-md hover:bg-blue-50 hover:text-blue-500 transition-colors"
                  title="Reply"
                >
                  <Reply className="h-3.5 w-3.5" />
                </Button>
              )}

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 w-7 p-0 rounded-md hover:bg-muted transition-colors"
                  >
                    <MoreHorizontal className="h-3.5 w-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleCopyMessage}>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy message
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => onReply?.(message.id)}>
                    <Reply className="h-4 w-4 mr-2" />
                    Reply
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {isOwn && onEdit && (
                    <DropdownMenuItem onClick={() => setIsEditing(true)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit message
                    </DropdownMenuItem>
                  )}
                  {isOwn && onDelete && (
                    <DropdownMenuItem 
                      onClick={handleDelete} 
                      className="text-destructive focus:text-destructive"
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {isDeleting ? 'Deleting...' : 'Delete message'}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};