
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';
import LearningCard, { LearningItem } from './LearningCard';
import AddYouTubeVideoModal from './AddYouTubeVideoModal';
import VideoViewerModal from './VideoViewerModal';

const CommandRoomContent: React.FC = () => {
  const [learningItems, setLearningItems] = useState<LearningItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState<LearningItem | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

  const handleAddVideo = (item: LearningItem) => {
    setLearningItems(prev => [...prev, item]);
  };

  const handlePlayVideo = (item: LearningItem) => {
    setSelectedVideo(item);
    setIsViewerOpen(true);
  };

  const handleToggleFavorite = (id: string) => {
    setLearningItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, isFavorited: !item.isFavorited } : item
      )
    );
  };

  const handleProgressUpdate = (id: string, progress: number) => {
    setLearningItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, progress } : item
      )
    );
  };

  const filteredItems = learningItems.filter(item => {
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.coach.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || item.level === selectedLevel;
    
    return searchMatch && categoryMatch && levelMatch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mindset">Mindset</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="wellness">Wellness</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="rituals">Rituals</SelectItem>
              <SelectItem value="wisdom">Wisdom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button 
          onClick={() => setIsAddModalOpen(true)}
          className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
        >
          <Icons.Youtube className="h-4 w-4 mr-2" />
          Add YouTube Video
        </Button>
      </div>

      <TabsContent value="resources" className="space-y-6">
        {learningItems.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <Icons.Youtube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Videos Added Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start building your course library by adding YouTube videos. Create comprehensive learning experiences with curated content.
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
              >
                <Icons.Youtube className="h-4 w-4 mr-2" />
                Add Your First Video
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <LearningCard
                key={item.id}
                item={item}
                onPlay={handlePlayVideo}
                onToggleFavorite={handleToggleFavorite}
                onProgressUpdate={handleProgressUpdate}
              />
            ))}
          </div>
        )}

        {learningItems.length > 0 && filteredItems.length === 0 && (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-8 text-center">
              <Icons.Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Videos Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters to find videos.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookmarks" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {learningItems.filter(item => item.isFavorited).map((item) => (
            <LearningCard
              key={item.id}
              item={item}
              onPlay={handlePlayVideo}
              onToggleFavorite={handleToggleFavorite}
              onProgressUpdate={handleProgressUpdate}
            />
          ))}
        </div>
        
        {learningItems.filter(item => item.isFavorited).length === 0 && (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <Icons.BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Bookmarks Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bookmark your favorite videos to access them quickly later.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Icons.TrendingUp className="h-5 w-5 text-blue-500" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Total Videos</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{learningItems.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Completed</span>
                <span className="text-lg font-semibold text-green-600">
                  {learningItems.filter(item => item.progress === 100).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">In Progress</span>
                <span className="text-lg font-semibold text-yellow-600">
                  {learningItems.filter(item => item.progress > 0 && item.progress < 100).length}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">Bookmarked</span>
                <span className="text-lg font-semibold text-purple-600">
                  {learningItems.filter(item => item.isFavorited).length}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Upload className="h-5 w-5" />
              Upload Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <Icons.Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload Learning Materials
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload documents, PDFs, or other learning materials to complement your video courses.
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </TabsContent>

      {/* Modals */}
      <AddYouTubeVideoModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddVideo}
      />

      <VideoViewerModal
        item={selectedVideo}
        isOpen={isViewerOpen}
        onClose={() => setIsViewerOpen(false)}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
};

export default CommandRoomContent;
