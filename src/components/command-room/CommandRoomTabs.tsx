
import React from 'react';
import { TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Bookmark, TrendingUp, Upload } from 'lucide-react';

const CommandRoomTabs: React.FC = () => {
  return (
    <TabsList className="grid w-full grid-cols-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
      <TabsTrigger 
        value="resources" 
        className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
      >
        <BookOpen className="w-4 h-4" />
        <span className="hidden sm:inline">Resources</span>
      </TabsTrigger>
      <TabsTrigger 
        value="bookmarks" 
        className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
      >
        <Bookmark className="w-4 h-4" />
        <span className="hidden sm:inline">Bookmarks</span>
      </TabsTrigger>
      <TabsTrigger 
        value="progress" 
        className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
      >
        <TrendingUp className="w-4 h-4" />
        <span className="hidden sm:inline">Progress</span>
      </TabsTrigger>
      <TabsTrigger 
        value="upload" 
        className="flex items-center gap-2 data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 dark:data-[state=active]:bg-blue-900/20 dark:data-[state=active]:text-blue-300"
      >
        <Upload className="w-4 h-4" />
        <span className="hidden sm:inline">Upload</span>
      </TabsTrigger>
    </TabsList>
  );
};

export default CommandRoomTabs;
