
import React from 'react';
import { formatDistanceToNow, format, isToday, isYesterday } from 'date-fns';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface MessageTimestampProps {
  timestamp: string;
  variant?: 'relative' | 'absolute' | 'both';
  className?: string;
}

export const MessageTimestamp: React.FC<MessageTimestampProps> = ({
  timestamp,
  variant = 'relative',
  className = ''
}) => {
  const date = new Date(timestamp);
  const now = new Date();
  
  const formatRelativeTime = (date: Date) => {
    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'HH:mm')}`;
    } else {
      return formatDistanceToNow(date, { addSuffix: true });
    }
  };

  const formatAbsoluteTime = (date: Date) => {
    return format(date, 'PPP p');
  };

  const relativeTime = formatRelativeTime(date);
  const absoluteTime = formatAbsoluteTime(date);

  if (variant === 'absolute') {
    return (
      <span className={cn("text-xs text-gray-500 dark:text-gray-400", className)}>
        {absoluteTime}
      </span>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn(
            "text-xs text-gray-500 dark:text-gray-400 cursor-help transition-colors hover:text-gray-700 dark:hover:text-gray-300",
            className
          )}>
            {relativeTime}
          </span>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-none">
          <p className="text-sm">{absoluteTime}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
