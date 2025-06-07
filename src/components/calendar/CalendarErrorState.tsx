
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface CalendarErrorStateProps {
  error: string;
  onRetry: () => void;
}

const CalendarErrorState: React.FC<CalendarErrorStateProps> = ({ error, onRetry }) => {
  return (
    <div className="space-y-6 p-6">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertTriangle className="h-12 w-12 text-destructive mb-4" />
          <h3 className="text-lg font-semibold mb-2">Unable to Load Calendar</h3>
          <p className="text-gray-600 text-center mb-4 max-w-md">
            {error || 'Something went wrong while loading your calendar. Please try again.'}
          </p>
          <Button onClick={onRetry} variant="outline" className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default CalendarErrorState;
