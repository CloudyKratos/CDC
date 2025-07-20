
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { useIsMobile } from '@/hooks/use-mobile';
import { BarChart3, Users, Trophy, Settings, MessageCircle } from 'lucide-react';
import CommunityPanel from '../CommunityPanel';

interface DashboardTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const DashboardTabs: React.FC<DashboardTabsProps> = ({ activeTab, onTabChange }) => {
  const isMobile = useIsMobile();

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'community', label: 'Community', icon: MessageCircle },
    { id: 'leaderboard', label: 'Leaderboard', icon: Trophy },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className={`grid w-full ${isMobile ? 'grid-cols-2 gap-1 h-auto p-1' : 'grid-cols-4'}`}>
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <TabsTrigger 
              key={tab.id} 
              value={tab.id} 
              className={`flex items-center gap-2 ${
                isMobile ? 'flex-col py-2 px-1 text-xs' : 'px-4 py-2'
              }`}
            >
              <Icon className={`${isMobile ? 'h-4 w-4' : 'h-4 w-4'}`} />
              <span className={isMobile ? 'text-[10px]' : 'text-sm'}>{tab.label}</span>
            </TabsTrigger>
          );
        })}
      </TabsList>

      <div className={`mt-4 ${isMobile ? 'mt-2' : ''}`}>
        <TabsContent value="overview" className="mt-0">
          <Card>
            <CardContent className={`p-6 ${isMobile ? 'p-4' : ''}`}>
              <div className="space-y-4">
                <h3 className={`text-lg font-semibold ${isMobile ? 'text-base' : ''}`}>
                  Dashboard Overview
                </h3>
                <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-sm' : ''}`}>
                  Welcome to your personal dashboard. Here you can track your progress, 
                  engage with the community, and manage your settings.
                </p>
                
                <div className={`grid gap-4 ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 lg:grid-cols-3'}`}>
                  <div className={`p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 ${
                    isMobile ? 'p-3' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <Users className={`text-blue-600 dark:text-blue-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Community</h4>
                    </div>
                    <p className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Connect with fellow members
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 ${
                    isMobile ? 'p-3' : ''
                  }`}>
                    <div className="flex items-center gap-2">
                      <Trophy className={`text-green-600 dark:text-green-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Progress</h4>
                    </div>
                    <p className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Track your achievements
                    </p>
                  </div>
                  
                  <div className={`p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 ${
                    isMobile ? 'p-3 col-span-1' : ''
                  } ${!isMobile ? 'lg:col-span-1' : ''}`}>
                    <div className="flex items-center gap-2">
                      <Settings className={`text-purple-600 dark:text-purple-400 ${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h4 className={`font-medium ${isMobile ? 'text-sm' : ''}`}>Settings</h4>
                    </div>
                    <p className={`text-gray-600 dark:text-gray-400 mt-1 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                      Customize your experience
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="community" className="mt-0">
          <Card className="h-[calc(100vh-200px)] min-h-[500px]">
            <CardContent className="p-0 h-full">
              <CommunityPanel />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaderboard" className="mt-0">
          <Card>
            <CardContent className={`p-6 ${isMobile ? 'p-4' : ''}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isMobile ? 'text-base mb-3' : ''}`}>
                Leaderboard
              </h3>
              <div className="space-y-3">
                {[1, 2, 3, 4, 5].map((rank) => (
                  <div 
                    key={rank} 
                    className={`flex items-center justify-between p-3 rounded-lg border ${
                      isMobile ? 'p-2' : ''
                    } ${rank <= 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border-yellow-200 dark:border-yellow-800' : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                        isMobile ? 'w-6 h-6 text-xs' : 'text-sm'
                      } ${rank === 1 ? 'bg-yellow-500 text-white' : rank === 2 ? 'bg-gray-400 text-white' : rank === 3 ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-600'}`}>
                        {rank}
                      </div>
                      <div>
                        <p className={`font-medium ${isMobile ? 'text-sm' : ''}`}>
                          Warrior {rank}
                        </p>
                        <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                          Level {10 - rank + 5}
                        </p>
                      </div>
                    </div>
                    <div className={`text-right ${isMobile ? 'text-sm' : ''}`}>
                      <p className="font-semibold">{1000 - rank * 50} XP</p>
                      <p className={`text-gray-500 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                        {rank <= 3 ? '🏆' : '⭐'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-0">
          <Card>
            <CardContent className={`p-6 ${isMobile ? 'p-4' : ''}`}>
              <h3 className={`text-lg font-semibold mb-4 ${isMobile ? 'text-base mb-3' : ''}`}>
                Settings
              </h3>
              <div className="space-y-4">
                <div className={`p-4 rounded-lg border ${isMobile ? 'p-3' : ''}`}>
                  <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm mb-1' : ''}`}>
                    Notifications
                  </h4>
                  <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Manage your notification preferences
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border ${isMobile ? 'p-3' : ''}`}>
                  <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm mb-1' : ''}`}>
                    Privacy
                  </h4>
                  <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Control your privacy settings
                  </p>
                </div>
                
                <div className={`p-4 rounded-lg border ${isMobile ? 'p-3' : ''}`}>
                  <h4 className={`font-medium mb-2 ${isMobile ? 'text-sm mb-1' : ''}`}>
                    Account
                  </h4>
                  <p className={`text-gray-600 dark:text-gray-400 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Manage your account settings
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </div>
    </Tabs>
  );
};

export default DashboardTabs;
