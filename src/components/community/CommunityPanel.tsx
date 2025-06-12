
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import LaunchReadyCommunityPanel from './LaunchReadyCommunityPanel';
import CommunityErrorBoundary from './CommunityErrorBoundary';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ channelName = 'general' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [retryCount, setRetryCount] = useState(0);
  
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (hasError && retryCount > 0) {
        toast.success('Connection restored');
        handleRetry();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setHasError(true);
      setErrorMessage('No internet connection');
      toast.error('Connection lost');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Quick initialization for launch readiness
    const timer = setTimeout(() => {
      setIsLoading(false);
      setHasError(false);
      setErrorMessage('');
    }, 300);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [hasError, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setHasError(false);
    setErrorMessage('');
    
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  };

  if (!isOnline) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <WifiOff className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Internet Connection</h3>
            <p className="text-gray-600 mb-4">Please check your internet connection and try again.</p>
            <Button onClick={handleRetry} className="flex items-center gap-2">
              <RefreshCw className="h-4 w-4" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading Community</h3>
            <p className="text-gray-600">Setting up real-time chat...</p>
            {retryCount > 0 && (
              <p className="text-sm text-gray-500 mt-2">Retry attempt #{retryCount}</p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 relative">
      {/* Online Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-3 py-1">
          <Wifi className="h-3 w-3 text-green-500" />
          <span className="text-xs text-gray-600">Live Chat</span>
        </div>
      </div>
      
      <CommunityErrorBoundary>
        <LaunchReadyCommunityPanel defaultChannel={channelName} />
      </CommunityErrorBoundary>
    </div>
  );
};

export default CommunityPanel;
