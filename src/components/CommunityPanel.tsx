
import React from 'react';
import { ModernCommunityChat } from './community/modern/ModernCommunityChat';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent } from '@/components/ui/card';
import { MessageCircle, Loader2 } from 'lucide-react';

interface CommunityPanelProps {
  channelName?: string;
}

const CommunityPanel: React.FC<CommunityPanelProps> = ({ 
  channelName = 'general' 
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while auth is initializing
  if (isLoading) {
    return (
      <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="flex items-center gap-3 text-blue-600 dark:text-accent">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="font-medium">Initializing community...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="h-full max-w-6xl mx-auto">
        <ModernCommunityChat 
          channelName={channelName}
          className="h-full"
        />
      </div>
    </div>
  );
};

export default CommunityPanel;
