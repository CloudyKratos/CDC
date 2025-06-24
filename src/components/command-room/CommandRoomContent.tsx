
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { BookOpen, Trophy, Youtube, Search, Filter, Grid, List } from 'lucide-react';
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
  const [activeTab, setActiveTab] = useState('vault');
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = ['all', ...Array.from(new Set(videos.map(v => v.category)))];

  return (
    <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
      {/* Enhanced Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full lg:w-auto">
            <TabsList className="bg-gray-100 border border-gray-200">
              <TabsTrigger 
                value="vault" 
                className="data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Vault Resources
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="data-[state=active]:bg-white data-[state=active]:text-purple-600 data-[state=active]:shadow-sm"
              >
                <Trophy className="h-4 w-4 mr-2" />
                Progress Tracker
              </TabsTrigger>
            </TabsList>
          </Tabs>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search vault..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-64 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              />
            </div>

            {/* View Toggle */}
            <div className="flex border border-gray-300 rounded-lg">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-r-none"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-l-none"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>

            {isAdmin && (
              <Button 
                onClick={onAddVideo}
                className="bg-red-500 hover:bg-red-600 text-white"
                size="sm"
              >
                <Youtube className="h-4 w-4 mr-2" />
                Add Content
              </Button>
            )}
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex items-center gap-2 mt-4">
          <Filter className="h-4 w-4 text-gray-500" />
          <div className="flex gap-2 flex-wrap">
            {categories.map((category) => (
              <Badge
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedCategory === category 
                    ? 'bg-blue-500 text-white border-blue-500' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedCategory(category)}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsContent value="vault" className="p-6 m-0">
          <CoursesTab
            videos={videos}
            userProgress={userProgress}
            onProgressUpdate={onProgressUpdate}
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            viewMode={viewMode}
          />
        </TabsContent>

        <TabsContent value="progress" className="p-6 m-0">
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
