
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GraduationCap, Coins } from 'lucide-react';
import CommandRoomContent from './CommandRoomContent';
import CoinWallet from '@/components/coins/CoinWallet';

interface CommandRoomTabsProps {
  isAdmin: boolean;
}

const CommandRoomTabs: React.FC<CommandRoomTabsProps> = ({ isAdmin }) => {
  return (
    <div className="h-full p-6">
      <Tabs defaultValue="courses" className="h-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="courses" className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4" />
            Premium Content
          </TabsTrigger>
          <TabsTrigger value="wallet" className="flex items-center gap-2">
            <Coins className="w-4 h-4" />
            Coin Wallet
          </TabsTrigger>
        </TabsList>

        <TabsContent value="courses" className="mt-0 h-full">
          <CommandRoomContent />
        </TabsContent>

        <TabsContent value="wallet" className="mt-0 h-full">
          <CoinWallet />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommandRoomTabs;
