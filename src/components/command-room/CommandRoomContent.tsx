
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Youtube, Filter } from 'lucide-react';
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
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="space-y-6">
      {/* Enhanced Tab Navigation */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="bg-black/30 backdrop-blur-xl border border-white/20 p-1 rounded-xl">
            <TabsTrigger 
              value="courses" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-cyan-500 data-[state=active]:to-blue-600 data-[state=active]:text-white text-blue-200 px-6 py-2 rounded-lg font-medium"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Courses
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-600 data-[state=active]:text-white text-purple-200 px-6 py-2 rounded-lg font-medium"
            >
              <Trophy className="h-4 w-4 mr-2" />
              Progress
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="border-white/20 text-white bg-white/5 px-4 py-2"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          
          {isAdmin && (
            <Button 
              onClick={onAddVideo}
              className="bg-red-500 text-white px-4 py-2 rounded-lg font-medium"
            >
              <Youtube className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          )}
        </div>
      </div>

      {/* Tab Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="courses" className="mt-0">
          <CoursesTab
            videos={videos}
            userProgress={userProgress}
            onProgressUpdate={onProgressUpdate}
            showFilters={showFilters}
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
