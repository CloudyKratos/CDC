
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [reconnecting, setReconnecting] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setReconnecting(false);
      setConnectionAttempts(0);
      toast.success('Connection restored');
    };

    const handleOffline = () => {
      setIsOnline(false);
      setReconnecting(true);
      toast.error('Connection lost - attempting to reconnect...');
    };

    // Connection retry logic
    const retryConnection = () => {
      if (!navigator.onLine && connectionAttempts < 5) {
        setConnectionAttempts(prev => prev + 1);
        setTimeout(retryConnection, 5000); // Retry every 5 seconds
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Start retry logic if offline
    if (!navigator.onLine) {
      retryConnection();
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [connectionAttempts]);

  return {
    isOnline,
    reconnecting,
    connectionAttempts
  };
}
