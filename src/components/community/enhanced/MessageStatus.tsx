import React from 'react';
import { motion } from 'framer-motion';
import { Check, CheckCheck, Clock, AlertCircle, Eye } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

export enum MessageStatus {
  SENDING = 'sending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed'
}

interface MessageStatusIndicatorProps {
  status: MessageStatus;
  timestamp?: string;
  readBy?: Array<{
    id: string;
    name: string;
    avatar?: string;
    readAt: string;
  }>;
  className?: string;
  showTooltip?: boolean;
  size?: 'sm' | 'md';
}

export const MessageStatusIndicator: React.FC<MessageStatusIndicatorProps> = ({
  status,
  timestamp,
  readBy = [],
  className = '',
  showTooltip = true,
  size = 'sm'
}) => {
  const iconSize = size === 'sm' ? 12 : 16;

  const getStatusIcon = () => {
    switch (status) {
      case MessageStatus.SENDING:
        return (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Clock size={iconSize} className="text-muted-foreground" />
          </motion.div>
        );
      case MessageStatus.SENT:
        return <Check size={iconSize} className="text-muted-foreground" />;
      case MessageStatus.DELIVERED:
        return <CheckCheck size={iconSize} className="text-muted-foreground" />;
      case MessageStatus.READ:
        return <CheckCheck size={iconSize} className="text-blue-500" />;
      case MessageStatus.FAILED:
        return <AlertCircle size={iconSize} className="text-destructive" />;
      default:
        return null;
    }
  };

  const getStatusText = () => {
    switch (status) {
      case MessageStatus.SENDING:
        return 'Sending...';
      case MessageStatus.SENT:
        return `Sent${timestamp ? ` at ${new Date(timestamp).toLocaleTimeString()}` : ''}`;
      case MessageStatus.DELIVERED:
        return `Delivered${timestamp ? ` at ${new Date(timestamp).toLocaleTimeString()}` : ''}`;
      case MessageStatus.READ:
        if (readBy.length > 0) {
          if (readBy.length === 1) {
            return `Read by ${readBy[0].name} at ${new Date(readBy[0].readAt).toLocaleTimeString()}`;
          } else {
            return `Read by ${readBy.length} people`;
          }
        }
        return `Read${timestamp ? ` at ${new Date(timestamp).toLocaleTimeString()}` : ''}`;
      case MessageStatus.FAILED:
        return 'Failed to send. Click to retry.';
      default:
        return '';
    }
  };

  const StatusIcon = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={className}
    >
      {getStatusIcon()}
    </motion.div>
  );

  if (!showTooltip) {
    return <StatusIcon />;
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className="cursor-help">
          <StatusIcon />
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <div className="space-y-1">
          <div className="font-medium">{getStatusText()}</div>
          
          {status === MessageStatus.READ && readBy.length > 1 && (
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Read by:</div>
              {readBy.slice(0, 5).map((reader) => (
                <div key={reader.id} className="flex items-center gap-2 text-xs">
                  {reader.avatar ? (
                    <img 
                      src={reader.avatar} 
                      alt={reader.name}
                      className="w-4 h-4 rounded-full"
                    />
                  ) : (
                    <div className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-xs">{reader.name.charAt(0)}</span>
                    </div>
                  )}
                  <span>{reader.name}</span>
                  <span className="text-muted-foreground">
                    {new Date(reader.readAt).toLocaleTimeString()}
                  </span>
                </div>
              ))}
              {readBy.length > 5 && (
                <div className="text-xs text-muted-foreground">
                  +{readBy.length - 5} more
                </div>
              )}
            </div>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );
};

// Read receipt component for group chats
interface ReadReceiptAvatarsProps {
  readBy: Array<{
    id: string;
    name: string;
    avatar?: string;
  }>;
  maxAvatars?: number;
  className?: string;
}

export const ReadReceiptAvatars: React.FC<ReadReceiptAvatarsProps> = ({
  readBy,
  maxAvatars = 3,
  className = ''
}) => {
  if (readBy.length === 0) return null;

  const displayReaders = readBy.slice(0, maxAvatars);
  const remainingCount = readBy.length - maxAvatars;

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      <Eye size={10} className="text-blue-500 mr-1" />
      
      <div className="flex -space-x-1">
        {displayReaders.map((reader, index) => (
          <motion.div
            key={reader.id}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.05 }}
            className="relative"
          >
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="w-4 h-4 rounded-full border border-background overflow-hidden">
                  {reader.avatar ? (
                    <img 
                      src={reader.avatar} 
                      alt={reader.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                      <span className="text-xs text-white font-medium">
                        {reader.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <span>{reader.name}</span>
              </TooltipContent>
            </Tooltip>
          </motion.div>
        ))}
        
        {remainingCount > 0 && (
          <div className="w-4 h-4 rounded-full bg-muted border border-background flex items-center justify-center">
            <span className="text-xs text-muted-foreground font-medium">
              +{remainingCount}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};