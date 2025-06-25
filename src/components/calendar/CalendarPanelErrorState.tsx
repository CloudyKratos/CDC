
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw, Calendar as CalendarIcon } from 'lucide-react';

interface CalendarPanelErrorStateProps {
  error: string;
  retryCount: number;
  onRetry: () => void;
}

export const CalendarPanelErrorState: React.FC<CalendarPanelErrorStateProps> = ({
  error,
  retryCount,
  onRetry
}) => {
  return (
    <div className="space-y-4 p-6">
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          {error}
        </AlertDescription>
      </Alert>
      
      <Card className="max-w-md mx-auto">
        <CardContent className="p-8 text-center">
          <CalendarIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Calendar Error</h3>
          <p className="text-gray-600 mb-4">Unable to load calendar events.</p>
          <div className="space-y-2">
            <Button onClick={onRetry} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            {retryCount > 2 && (
              <p className="text-sm text-gray-500">
                Tried {retryCount} times. Please check your connection.
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
