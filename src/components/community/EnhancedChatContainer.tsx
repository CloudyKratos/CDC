
import React from 'react';
import { Hash } from 'lucide-react';
import ModernCommunityChat from './modern/ModernCommunityChat';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({ 
  defaultChannel = 'general' 
}) => {
  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-6 py-4">
        <div className="flex items-center gap-3">
          <Hash className="h-6 w-6 text-purple-400" />
          <div>
            <h2 className="text-xl font-semibold text-white">Community Chat</h2>
            <p className="text-purple-200 text-sm">Connect with fellow warriors</p>
          </div>
        </div>
      </div>

      <div className="flex-1 h-full">
        <ModernCommunityChat defaultChannel={defaultChannel} />
      </div>
    </div>
  );
};
