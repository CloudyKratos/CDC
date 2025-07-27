
import React from 'react';
import { Check, CheckCheck, Clock, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface MessageStatusProps {
  status?: 'sending' | 'sent' | 'delivered' | 'failed';
  className?: string;
}

export const MessageStatus: React.FC<MessageStatusProps> = ({
  status = 'sent',
  className = ''
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'sending':
        return <Clock className="w-3 h-3 text-gray-400 animate-pulse" />;
      case 'sent':
        return <Check className="w-3 h-3 text-gray-400" />;
      case 'delivered':
        return <CheckCheck className="w-3 h-3 text-blue-500" />;
      case 'failed':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      default:
        return null;
    }
  };

  return (
    <div className={cn("flex items-center justify-end", className)}>
      {getStatusIcon()}
    </div>
  );
};
