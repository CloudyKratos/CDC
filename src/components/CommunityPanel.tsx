
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import FixedCommunityChat from './community/FixedCommunityChat';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ channelName = 'general' }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  const { user } = useAuth();

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('Connection restored - chat is now available');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('Connection lost - you\'ll be able to chat when back online');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Quick initialization
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, []);

  const handleRetry = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      toast.success('Chat refreshed successfully');
    }, 1000);
  };

  if (!isOnline) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <WifiOff className="h-8 w-8 text-red-500" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              No Internet Connection
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Please check your internet connection to access the community chat.
            </p>
            <Button onClick={handleRetry} className="flex items-center gap-2 w-full">
              <RefreshCw className="h-4 w-4" />
              Check Connection
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 flex items-center justify-center">
        <Card className="max-w-md mx-auto shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary border-t-transparent mx-auto mb-6"></div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
              Loading Community Chat
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Setting up real-time messaging...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-blue-50/30 via-purple-50/20 to-indigo-50/30 dark:from-blue-950/20 dark:via-purple-950/20 dark:to-indigo-950/20 relative">
      {/* Status Indicator */}
      <div className="absolute top-4 right-4 z-10">
        <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg border border-white/20">
          <Wifi className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium text-gray-700">Stable Chat</span>
        </div>
      </div>
      
      <div className="h-full p-4">
        <div className="h-full max-w-4xl mx-auto">
          <FixedCommunityChat defaultChannel={channelName} />
        </div>
      </div>
    </div>
  );
};

export default CommunityPanel;
