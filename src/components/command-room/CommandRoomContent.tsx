
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Plus } from 'lucide-react';
import CoursesTab from './CoursesTab';
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
  const [activeTab, setActiveTab] = useState('courses');

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab}>
      <div className="flex flex-col lg:flex-row items-center justify-between mb-6 gap-4">
        <TabsList className="bg-black/40 backdrop-blur-xl border border-white/20 p-2 rounded-2xl shadow-xl">
          <TabsTrigger 
            value="courses" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-blue-200 px-4 lg:px-6 py-3 rounded-xl font-semibold text-sm lg:text-base"
          >
            <BookOpen className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Epic Courses
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white data-[state=active]:shadow-lg text-purple-200 px-4 lg:px-6 py-3 rounded-xl font-semibold text-sm lg:text-base"
          >
            <Trophy className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Progress Hub
          </TabsTrigger>
        </TabsList>

        {isAdmin && (
          <Button 
            onClick={onAddVideo}
            className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-600 text-white px-4 lg:px-6 py-2 lg:py-3 rounded-xl font-semibold text-sm lg:text-base shadow-xl"
          >
            <Plus className="h-4 w-4 lg:h-5 lg:w-5 mr-2" />
            Add Epic Course
          </Button>
        )}
      </div>

      <TabsContent value="courses" className="space-y-6 mt-0">
        <CoursesTab
          videos={videos}
          userProgress={userProgress}
          onProgressUpdate={onProgressUpdate}
        />
      </TabsContent>

      <TabsContent value="progress" className="space-y-6 mt-0">
        <ProgressTab
          videos={videos}
          userProgress={userProgress}
        />
      </TabsContent>
    </Tabs>
  );
};

export default CommandRoomContent;
