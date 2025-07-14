
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookOpen, Trophy } from 'lucide-react';
import ImprovedStableCourseGrid from './ImprovedStableCourseGrid';
import ProgressTab from './ProgressTab';

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  addedBy: string;
  addedAt: Date;
  progress?: number;
}

interface CommandRoomContentProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
  isAdmin: boolean;
  onAddVideo: () => void;
}

const CommandRoomContent: React.FC<CommandRoomContentProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  isAdmin,
  onAddVideo
}) => {
  const [activeTab, setActiveTab] = useState('vault');

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="border-b border-gray-100 px-6 py-4 bg-gray-50">
          <TabsList className="bg-white border border-gray-200 p-1 shadow-sm">
            <TabsTrigger 
              value="vault" 
              className="data-[state=active]:bg-blue-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 px-6 py-2"
            >
              <BookOpen className="h-4 w-4" />
              Vault Resources
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-purple-500 data-[state=active]:text-white data-[state=active]:shadow-sm flex items-center gap-2 px-6 py-2"
            >
              <Trophy className="h-4 w-4" />
              Progress Tracker
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="p-6">
          <TabsContent value="vault" className="m-0">
            <ImprovedStableCourseGrid
              videos={videos}
              userProgress={userProgress}
              onProgressUpdate={onProgressUpdate}
              isAdmin={isAdmin}
              onAddVideo={onAddVideo}
            />
          </TabsContent>

          <TabsContent value="progress" className="m-0">
            <ProgressTab
              videos={videos}
              userProgress={userProgress}
            />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default CommandRoomContent;
