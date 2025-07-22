import React, { useState } from 'react';
import { Shield, ShieldCheck, Lock, Unlock, Key } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { motion } from 'framer-motion';

interface MessageEncryptionProps {
  isEncrypted: boolean;
  encryptionLevel?: 'none' | 'basic' | 'end-to-end';
  onToggleEncryption?: () => void;
  onViewEncryptionDetails?: () => void;
  className?: string;
  showBadge?: boolean;
  showControls?: boolean;
}

export const MessageEncryption: React.FC<MessageEncryptionProps> = ({
  isEncrypted,
  encryptionLevel = 'none',
  onToggleEncryption,
  onViewEncryptionDetails,
  className = '',
  showBadge = true,
  showControls = false
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getEncryptionIcon = () => {
    switch (encryptionLevel) {
      case 'end-to-end':
        return <ShieldCheck size={12} className="text-green-500" />;
      case 'basic':
        return <Shield size={12} className="text-blue-500" />;
      default:
        return <Lock size={12} className="text-gray-400" />;
    }
  };

  const getEncryptionText = () => {
    switch (encryptionLevel) {
      case 'end-to-end':
        return 'End-to-end encrypted';
      case 'basic':
        return 'Encrypted';
      default:
        return 'Not encrypted';
    }
  };

  const getEncryptionColor = () => {
    switch (encryptionLevel) {
      case 'end-to-end':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'basic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* Encryption Badge */}
      {showBadge && isEncrypted && (
        <Tooltip>
          <TooltipTrigger asChild>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              onHoverStart={() => setIsHovered(true)}
              onHoverEnd={() => setIsHovered(false)}
            >
              <Badge 
                variant="outline" 
                className={`text-xs px-2 py-0.5 cursor-help ${getEncryptionColor()}`}
                onClick={onViewEncryptionDetails}
              >
                <motion.div
                  animate={{ rotate: isHovered ? 15 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="mr-1"
                >
                  {getEncryptionIcon()}
                </motion.div>
                {getEncryptionText()}
              </Badge>
            </motion.div>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <div className="font-medium">{getEncryptionText()}</div>
              {encryptionLevel === 'end-to-end' && (
                <div className="text-xs text-muted-foreground">
                  Only you and the recipient can read this message
                </div>
              )}
              {encryptionLevel === 'basic' && (
                <div className="text-xs text-muted-foreground">
                  Message is encrypted in transit and at rest
                </div>
              )}
              <div className="text-xs text-muted-foreground">
                Click to view encryption details
              </div>
            </div>
          </TooltipContent>
        </Tooltip>
      )}

      {/* Encryption Controls */}
      {showControls && (
        <div className="flex items-center gap-1">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onToggleEncryption}
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {isEncrypted ? (
                    <Lock size={12} className="text-green-500" />
                  ) : (
                    <Unlock size={12} className="text-gray-400" />
                  )}
                </motion.div>
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isEncrypted ? 'Disable encryption' : 'Enable encryption'}
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={onViewEncryptionDetails}
              >
                <Key size={12} className="text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              View encryption details
            </TooltipContent>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

// Utility functions for message encryption
export const encryptMessage = async (message: string, key: string): Promise<string> => {
  // This is a simplified example - in production, use proper encryption libraries
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const keyData = encoder.encode(key);
  
  // Simple XOR encryption for demo purposes
  const encrypted = data.map((byte, index) => byte ^ keyData[index % keyData.length]);
  return btoa(String.fromCharCode(...encrypted));
};

export const decryptMessage = async (encryptedMessage: string, key: string): Promise<string> => {
  try {
    const encoder = new TextEncoder();
    const keyData = encoder.encode(key);
    const encrypted = new Uint8Array(atob(encryptedMessage).split('').map(c => c.charCodeAt(0)));
    
    const decrypted = encrypted.map((byte, index) => byte ^ keyData[index % keyData.length]);
    return new TextDecoder().decode(decrypted);
  } catch (error) {
    throw new Error('Failed to decrypt message');
  }
};

// Hook for managing message encryption
export const useMessageEncryption = () => {
  const [isEncryptionEnabled, setIsEncryptionEnabled] = useState(false);
  const [encryptionKey, setEncryptionKey] = useState<string>('');

  const generateEncryptionKey = () => {
    const key = crypto.getRandomValues(new Uint8Array(32));
    return Array.from(key, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  const enableEncryption = () => {
    if (!encryptionKey) {
      setEncryptionKey(generateEncryptionKey());
    }
    setIsEncryptionEnabled(true);
  };

  const disableEncryption = () => {
    setIsEncryptionEnabled(false);
  };

  return {
    isEncryptionEnabled,
    encryptionKey,
    enableEncryption,
    disableEncryption,
    generateEncryptionKey,
    encryptMessage: (message: string) => encryptMessage(message, encryptionKey),
    decryptMessage: (message: string) => decryptMessage(message, encryptionKey)
  };
};