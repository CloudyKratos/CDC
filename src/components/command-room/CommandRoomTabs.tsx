
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";

const CommandRoomTabs: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-white/10 backdrop-blur-sm">
      <TabsTrigger value="resources" className="text-white data-[state=active]:bg-white/20">Resources</TabsTrigger>
      <TabsTrigger value="bookmarks" className="text-white data-[state=active]:bg-white/20">Bookmarks</TabsTrigger>
      <TabsTrigger value="progress" className="text-white data-[state=active]:bg-white/20">Progress</TabsTrigger>
      <TabsTrigger value="upload" className="text-white data-[state=active]:bg-white/20">Upload</TabsTrigger>
    </TabsList>
  );
};

export default CommandRoomTabs;
