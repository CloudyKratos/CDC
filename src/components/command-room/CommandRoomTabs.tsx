
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface CommandRoomTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  children: React.ReactNode;
}

const CommandRoomTabs: React.FC<CommandRoomTabsProps> = ({
  activeTab,
  onTabChange,
  children
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="mb-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border border-purple-200/30 dark:border-purple-800/30 p-1">
        <TabsTrigger value="all" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">All</TabsTrigger>
        <TabsTrigger value="videos" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Videos</TabsTrigger>
        <TabsTrigger value="courses" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Courses</TabsTrigger>
        <TabsTrigger value="vault" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Vault</TabsTrigger>
        <TabsTrigger value="replays" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Replays</TabsTrigger>
        <TabsTrigger value="templates" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Templates</TabsTrigger>
        <TabsTrigger value="favorites" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white">Favorites</TabsTrigger>
      </TabsList>
      {children}
    </Tabs>
  );
};

export default CommandRoomTabs;
