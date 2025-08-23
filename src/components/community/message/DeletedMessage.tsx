import React from 'react';
import { MessageSquareX } from 'lucide-react';

interface DeletedMessageProps {
  timestamp: string;
  className?: string;
}

const DeletedMessage: React.FC<DeletedMessageProps> = ({ timestamp, className = "" }) => {
  return (
    <div className={`flex items-center gap-2 text-muted-foreground italic py-2 ${className}`}>
      <MessageSquareX className="h-4 w-4" />
      <span className="text-sm">This message was deleted</span>
      <span className="text-xs opacity-60">• {timestamp}</span>
    </div>
  );
};

export default DeletedMessage;