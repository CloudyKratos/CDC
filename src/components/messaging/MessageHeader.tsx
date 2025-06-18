
import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Wifi, WifiOff, Video, Phone } from 'lucide-react';

interface MessageHeaderProps {
  recipient?: {
    id: string;
    username?: string;
    full_name?: string;
    avatar_url?: string;
  };
  isConnected: boolean;
  onClose: () => void;
}

const MessageHeader: React.FC<MessageHeaderProps> = ({
  recipient,
  isConnected,
  onClose
}) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={recipient?.avatar_url || ''} 
              alt={recipient?.full_name || 'User'} 
            />
            <AvatarFallback>
              {(recipient?.full_name || recipient?.username || 'U')[0].toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {recipient?.full_name || recipient?.username || 'Unknown User'}
            </h3>
            <div className="flex items-center space-x-2">
              {isConnected ? (
                <Badge variant="default" className="bg-green-100 text-green-800 border-green-200 text-xs">
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </Badge>
              ) : (
                <Badge variant="secondary" className="bg-gray-100 text-gray-600 text-xs">
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm">
            <Phone className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Video className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessageHeader;
