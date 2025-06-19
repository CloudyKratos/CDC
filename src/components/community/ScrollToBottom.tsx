
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ScrollToBottomProps {
  showScrollToBottom: boolean;
  newMessagesCount: number;
  onScrollToBottom: () => void;
}

const ScrollToBottom: React.FC<ScrollToBottomProps> = ({
  showScrollToBottom,
  newMessagesCount,
  onScrollToBottom
}) => {
  if (!showScrollToBottom) return null;

  return (
    <div className="absolute bottom-4 right-4 z-10">
      <Button
        onClick={onScrollToBottom}
        size="sm"
        className={cn(
          "rounded-full shadow-lg transition-all duration-200 h-10 w-10 p-0",
          "bg-blue-600 hover:bg-blue-700 text-white border-2 border-white dark:border-gray-800",
          newMessagesCount > 0 && "animate-pulse"
        )}
      >
        <div className="relative">
          <ArrowDown className="w-4 h-4" />
          {newMessagesCount > 0 && (
            <div className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-4 flex items-center justify-center px-1">
              {newMessagesCount > 99 ? '99+' : newMessagesCount}
            </div>
          )}
        </div>
      </Button>
    </div>
  );
};

export default ScrollToBottom;
