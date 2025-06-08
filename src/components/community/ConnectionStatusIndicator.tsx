
import React from 'react';
import { WifiOff } from 'lucide-react';

interface ConnectionStatusIndicatorProps {
  isOnline: boolean;
  reconnecting: boolean;
  connectionAttempts: number;
}

const ConnectionStatusIndicator: React.FC<ConnectionStatusIndicatorProps> = ({
  isOnline,
  reconnecting,
  connectionAttempts
}) => {
  if (isOnline && !reconnecting) return null;

  return (
    <div className="absolute top-0 left-0 right-0 bg-red-500 text-white text-center py-2 text-sm font-medium z-50">
      <div className="flex items-center justify-center gap-2">
        <WifiOff className="inline w-4 h-4" />
        {reconnecting ? 
          `Reconnecting... (Attempt ${connectionAttempts}/5)` : 
          'You\'re offline. Messages will be sent when connection is restored.'
        }
      </div>
    </div>
  );
};

export default ConnectionStatusIndicator;
