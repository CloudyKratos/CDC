
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageCircle, Video, Users } from 'lucide-react';
import { EnhancedChatContainer } from './EnhancedChatContainer';
import { CommunityCallsPanel } from './calls/CommunityCallsPanel';

export const CommunityTabsPanel: React.FC = () => {
  return (
    <div className="h-full flex flex-col bg-background">
      <Tabs defaultValue="chat" className="flex-1 flex flex-col">
        <div className="border-b border-border/50 px-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="chat" className="flex items-center gap-2">
              <MessageCircle className="w-4 h-4" />
              Chat
            </TabsTrigger>
            <TabsTrigger value="calls" className="flex items-center gap-2">
              <Video className="w-4 h-4" />
              Calls
            </TabsTrigger>
            <TabsTrigger value="members" className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Members
            </TabsTrigger>
          </TabsList>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0">
            <EnhancedChatContainer />
          </TabsContent>
          
          <TabsContent value="calls" className="h-full m-0">
            <CommunityCallsPanel />
          </TabsContent>
          
          <TabsContent value="members" className="h-full m-0 p-4">
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">Community Members</h3>
              <p className="text-muted-foreground">Member directory coming soon</p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
