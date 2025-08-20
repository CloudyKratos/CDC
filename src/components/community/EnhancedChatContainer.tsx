
import React, { useState, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { useReliableCommunityChat } from '@/hooks/useReliableCommunityChat';
import { useCommunityData } from './hooks/useCommunityData';
import { ChannelType } from '@/types/chat';
import { toast } from 'sonner';
import { SimpleChatContainer } from '../messaging/SimpleChatContainer';
import { Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
  className?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({
  className = ''
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <SimpleChatContainer />;
  }

  // For desktop, still use enhanced version but simplified
  return <SimpleChatContainer />;
};
