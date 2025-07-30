
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  MessageSquare, 
  Calendar, 
  Trophy,
  Users,
  Mic
} from 'lucide-react';
import { ActivePanel } from '@/types/dashboard';
import CommunityPanel from './CommunityPanel';
import LeaderboardPage from './LeaderboardPage';

const Dashboard: React.FC = () => {
  const [activePanel, setActivePanel] = useState<ActivePanel>('community');

  const navigationItems = [
    {
      id: 'community' as ActivePanel,
      label: 'Community',
      icon: MessageSquare,
      description: 'Chat with warriors'
    },
    {
      id: 'leaderboard' as ActivePanel,
      label: 'Leaderboard',
      icon: Trophy,
      description: 'View rankings'
    },
    {
      id: 'calendar' as ActivePanel,
      label: 'Calendar',
      icon: Calendar,
      description: 'Schedule events'
    },
    {
      id: 'stage' as ActivePanel,
      label: 'Stage',
      icon: Mic,
      description: 'Join discussions'
    }
  ];

  const renderActivePanel = () => {
    switch (activePanel) {
      case 'community':
        return <CommunityPanel />;
      case 'leaderboard':
        return <LeaderboardPage />;
      case 'calendar':
        return (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Calendar className="h-16 w-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Calendar Coming Soon</h3>
              <p className="text-purple-200">Event scheduling will be available soon!</p>
            </div>
          </div>
        );
      case 'stage':
        return (
          <div className="h-full flex items-center justify-center text-white">
            <div className="text-center">
              <Mic className="h-16 w-16 mx-auto mb-4 text-purple-400" />
              <h3 className="text-xl font-semibold mb-2">Stage Coming Soon</h3>
              <p className="text-purple-200">Live discussions will be available soon!</p>
            </div>
          </div>
        );
      default:
        return <CommunityPanel />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm p-4">
        <div className="flex items-center gap-2 overflow-x-auto">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activePanel === item.id ? "default" : "ghost"}
                onClick={() => setActivePanel(item.id)}
                className={`flex items-center gap-2 whitespace-nowrap ${
                  activePanel === item.id
                    ? 'bg-purple-600 text-white'
                    : 'text-purple-200 hover:text-white hover:bg-purple-800/50'
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderActivePanel()}
      </div>
    </div>
  );
};

export default Dashboard;
