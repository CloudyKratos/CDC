
import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { RefreshCw, Quote as QuoteIcon } from 'lucide-react';
import { useDailyQuote } from '@/hooks/useDailyQuote';

const DailyQuote: React.FC = () => {
  const { quote, isLoading, refreshQuote } = useDailyQuote();

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
        <div className="flex items-start gap-4">
          <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
            <QuoteIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 space-y-3">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
      </div>
    );
  }

  if (!quote) return null;

  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30 transition-all duration-300 hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex-shrink-0">
          <QuoteIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="flex-1 min-w-0">
          <blockquote className="text-gray-700 dark:text-gray-300 text-lg font-medium leading-relaxed mb-3">
            "{quote.text}"
          </blockquote>
          <cite className="text-blue-600 dark:text-blue-400 text-sm font-semibold">
            — {quote.author}
          </cite>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={refreshQuote}
          className="text-blue-600 hover:text-blue-700 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/30 flex-shrink-0"
          title="Get new quote"
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default DailyQuote;
