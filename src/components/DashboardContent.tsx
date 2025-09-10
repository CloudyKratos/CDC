
import React, { useState, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Home, LayoutDashboard, Settings, Users, Trophy } from 'lucide-react';
import WorkspaceContent from './WorkspaceContent';
import SettingsContent from './SettingsContent';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CommunityTabsPanel } from './community/CommunityTabsPanel';
import LeaderboardPanel from './leaderboard/LeaderboardPanel';

const DashboardContent: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab') || 'workspace';
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) {
      navigate('/sign-in');
    }
  }, [user, navigate]);

  useEffect(() => {
    // Update active tab when URL parameter changes
    const urlTab = searchParams.get('tab') || 'workspace';
    setActiveTab(urlTab);
  }, [searchParams]);

  if (!user) {
    return null;
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case 'workspace':
        return <WorkspaceContent />;
      case 'community':
        return <CommunityTabsPanel />;
      case 'leaderboard':
        return <LeaderboardPanel />;
      case 'settings':
        return <SettingsContent />;
      default:
        return <WorkspaceContent />;
    }
  };

  return (
    <div className="flex h-screen">
      <div className="w-64 border-r border-gray-200 dark:border-gray-700">
        <div className="p-4">
          <h1 className="text-lg font-semibold">Dashboard</h1>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex flex-col h-full">
          <TabsList className="flex flex-col space-y-1 p-4">
            <TabsTrigger value="workspace" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 flex items-center space-x-2">
              <LayoutDashboard className="w-4 h-4" />
              <span>Workspace</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 flex items-center space-x-2">
              <Users className="w-4 h-4" />
              <span>Community</span>
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 flex items-center space-x-2">
              <Trophy className="w-4 h-4" />
              <span>Leaderboard</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="data-[state=active]:bg-gray-100 data-[state=active]:text-gray-900 dark:data-[state=active]:bg-gray-800 dark:data-[state=active]:text-gray-50 flex items-center space-x-2">
              <Settings className="w-4 h-4" />
              <span>Settings</span>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      <div className="flex-1 p-4">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default DashboardContent;
