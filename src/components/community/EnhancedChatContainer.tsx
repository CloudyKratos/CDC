
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { MessageSquare, Trophy, Users, Calendar } from 'lucide-react';
import ModernCommunityChat from './modern/ModernCommunityChat';
import LeaderboardPanel from './LeaderboardPanel';

interface EnhancedChatContainerProps {
  defaultChannel?: string;
}

export const EnhancedChatContainer: React.FC<EnhancedChatContainerProps> = ({ 
  defaultChannel = 'general' 
}) => {
  const [activeTab, setActiveTab] = useState('chat');

  return (
    <div className="h-full bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm px-4 py-2">
          <TabsList className="bg-black/60 border-purple-800/50 backdrop-blur-md">
            <TabsTrigger value="chat" className="text-white data-[state=active]:bg-purple-600">
              <MessageSquare className="h-4 w-4 mr-2" />
              Community Chat
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="text-white data-[state=active]:bg-purple-600">
              <Trophy className="h-4 w-4 mr-2" />
              Leaderboard
            </TabsTrigger>
            <TabsTrigger value="members" className="text-white data-[state=active]:bg-purple-600 opacity-50" disabled>
              <Users className="h-4 w-4 mr-2" />
              Members
            </TabsTrigger>
            <TabsTrigger value="events" className="text-white data-[state=active]:bg-purple-600 opacity-50" disabled>
              <Calendar className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="chat" className="h-full m-0">
            <ModernCommunityChat defaultChannel={defaultChannel} />
          </TabsContent>

          <TabsContent value="leaderboard" className="h-full m-0 p-6 overflow-y-auto">
            <LeaderboardPanel />
          </TabsContent>

          <TabsContent value="members" className="h-full m-0 p-6">
            <div className="text-center text-white/70">
              Members directory coming soon...
            </div>
          </TabsContent>

          <TabsContent value="events" className="h-full m-0 p-6">
            <div className="text-center text-white/70">
              Community events coming soon...
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};
