
import React from 'react';
import { Tabs } from "@/components/ui/tabs";
import CommandRoomBackground from './CommandRoomBackground';
import CommandRoomHeader from './CommandRoomHeader';
import CommandRoomTabs from './CommandRoomTabs';
import CommandRoomContent from './CommandRoomContent';

const EnhancedCommandRoom: React.FC = () => {
  return (
    <div className="relative min-h-screen">
      <CommandRoomBackground />
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <CommandRoomHeader />

        <Tabs defaultValue="resources" className="space-y-6">
          <CommandRoomTabs />
          <CommandRoomContent />
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedCommandRoom;
