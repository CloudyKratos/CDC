
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface CalendarConnectionManagerProps {
  children: React.ReactNode;
  onRetry?: () => void;
}

const CalendarConnectionManager: React.FC<CalendarConnectionManagerProps> = ({ 
  children, 
  onRetry 
}) => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setConnectionError(null);
      if (retryCount > 0) {
        toast.success('Connection restored');
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionError('You are currently offline');
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [retryCount]);

  const handleRetry = async () => {
    setIsRetrying(true);
    setRetryCount(prev => prev + 1);
    
    try {
      if (onRetry) {
        await onRetry();
      }
      setConnectionError(null);
      toast.success('Calendar refreshed successfully');
    } catch (error) {
      console.error('Retry failed:', error);
      setConnectionError('Failed to refresh calendar. Please try again.');
      toast.error('Refresh failed');
    } finally {
      setIsRetrying(false);
    }
  };

  if (!isOnline) {
    return (
      <div className="h-full flex items-center justify-center p-8">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Internet Connection</h3>
            <p className="text-gray-600 mb-4">
              Please check your internet connection and try again.
            </p>
            <Button onClick={handleRetry} disabled={isRetrying} className="flex items-center gap-2">
              <RefreshCw className={`h-4 w-4 ${isRetrying ? 'animate-spin' : ''}`} />
              {isRetrying ? 'Checking...' : 'Check Connection'}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionError) {
    return (
      <div className="space-y-4 p-6">
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            {connectionError}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={handleRetry} disabled={isRetrying} variant="outline">
            <RefreshCw className={`h-4 w-4 mr-2 ${isRetrying ? 'animate-spin' : ''}`} />
            {isRetrying ? 'Retrying...' : 'Try Again'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
        <Wifi className="h-3 w-3 text-green-500" />
        <span className="text-xs text-gray-600">Online</span>
      </div>
      {children}
    </div>
  );
};

export default CalendarConnectionManager;
