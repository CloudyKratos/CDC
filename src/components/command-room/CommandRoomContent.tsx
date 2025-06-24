
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Youtube } from 'lucide-react';
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
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="bg-gray-800/50 border border-gray-700">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-blue-600 data-[state=active]:text-white text-gray-300"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-300"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {isAdmin && (
          <Button 
            onClick={onAddVideo}
            size="sm"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Youtube className="h-4 w-4 mr-2" />
            Add Video
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="courses" className="mt-0">
          <CoursesTab
            videos={videos}
            userProgress={userProgress}
            onProgressUpdate={onProgressUpdate}
          />
        </TabsContent>

        <TabsContent value="progress" className="mt-0">
          <ProgressTab
            videos={videos}
            userProgress={userProgress}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CommandRoomContent;
