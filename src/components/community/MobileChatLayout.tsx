
import React, { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import { Menu, X, Hash } from 'lucide-react';

interface MobileChatLayoutProps {
  children: React.ReactNode;
  sidebar: React.ReactNode;
  showSidebar: boolean;
  onToggleSidebar: () => void;
  activeChannelName?: string;
}

const MobileChatLayout = ({ 
  children, 
  sidebar, 
  showSidebar, 
  onToggleSidebar,
  activeChannelName = 'general'
}: MobileChatLayoutProps) => {
  const isMobile = useIsMobile();

  if (!isMobile) {
    return (
      <div className="flex h-full">
        {sidebar}
        <div className="flex-1">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleSidebar}
          className="flex items-center gap-2"
        >
          <Menu className="h-4 w-4" />
          <span className="text-sm font-medium">Channels</span>
        </Button>
        
        <div className="flex items-center gap-2">
          <Hash className="h-4 w-4 text-gray-500" />
          <span className="font-semibold text-gray-900 dark:text-white">
            {activeChannelName}
          </span>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            className="flex-1 bg-black/50 backdrop-blur-sm"
            onClick={onToggleSidebar}
          />
          <div className="w-80 max-w-[85vw] bg-white dark:bg-gray-900 shadow-xl">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="font-semibold text-gray-900 dark:text-white">Channels</h2>
              <Button variant="ghost" size="icon" onClick={onToggleSidebar}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="overflow-y-auto">{sidebar}</div>
          </div>
        </div>
      )}

      {/* Main Chat Content */}
      <div className="flex-1 overflow-hidden">{children}</div>
    </div>
  );
};

export default MobileChatLayout;
