
import React from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Message } from '@/types/chat';

interface MessageReplyThreadProps {
  replyingTo: Message | null;
  onCancel: () => void;
}

export const MessageReplyThread: React.FC<MessageReplyThreadProps> = ({
  replyingTo,
  onCancel
}) => {
  if (!replyingTo) return null;

  return (
    <div className="border-l-4 border-primary bg-muted/50 p-3 mx-4 mb-2 rounded-r-lg">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-foreground">
              Replying to {replyingTo.sender?.full_name || replyingTo.sender?.username || 'Unknown User'}
            </span>
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {replyingTo.content}
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCancel}
          className="h-6 w-6 p-0 shrink-0"
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};
