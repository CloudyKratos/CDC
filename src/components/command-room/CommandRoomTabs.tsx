
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Users, BarChart3, Settings, Coins } from 'lucide-react';
import CommandRoomCourses from './CommandRoomCourses';
import CoinWallet from '@/components/coins/CoinWallet';

interface CommandRoomTabsProps {
  isAdmin: boolean;
}

const CommandRoomTabs: React.FC<CommandRoomTabsProps> = ({ isAdmin }) => {
  return (
    <div className="h-full p-6">
      <Tabs defaultValue="courses" className="h-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Courses
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Coin Wallet
          </TabsTrigger>
          <TabsTrigger value="community" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Community
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" />
              Analytics
            </TabsTrigger>
          )}
        </TabsList>

        <TabsContent value="courses" className="mt-0 h-full">
          <CommandRoomCourses />
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 h-full">
          <CoinWallet />
        </TabsContent>

        <TabsContent value="community" className="mt-0 h-full">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            <div className="text-center">
              <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Community features coming soon</p>
            </div>
          </div>
        </TabsContent>

        {isAdmin && (
          <TabsContent value="analytics" className="mt-0 h-full">
            <div className="flex items-center justify-center h-64 text-muted-foreground">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>Analytics dashboard coming soon</p>
              </div>
            </div>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
};

export default CommandRoomTabs;
