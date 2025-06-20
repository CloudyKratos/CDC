
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
  const [isLoading, setIsLoading] = useState(false);

  const handleAddVideo = (item: LearningItem) => {
    setLearningItems(prev => [...prev, item]);
    toast.success('Video added successfully!');
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
    toast.success('Bookmark updated!');
  };

  const handleProgressUpdate = (id: string, progress: number) => {
    setLearningItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, progress } : item
      )
    );
    if (progress === 100) {
      toast.success('Course completed! 🎉');
    }
  };

  const handleDeleteVideo = (id: string) => {
    setLearningItems(prev => prev.filter(item => item.id !== id));
    toast.success('Video removed successfully');
  };

  const handleClearAll = () => {
    if (learningItems.length === 0) return;
    setLearningItems([]);
    toast.success('All videos cleared');
  };

  const filteredItems = learningItems.filter(item => {
    const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       item.coach.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || item.level === selectedLevel;
    
    return searchMatch && categoryMatch && levelMatch;
  });

  const getProgressStats = () => {
    const total = learningItems.length;
    const completed = learningItems.filter(item => item.progress === 100).length;
    const inProgress = learningItems.filter(item => item.progress > 0 && item.progress < 100).length;
    const bookmarked = learningItems.filter(item => item.isFavorited).length;
    return { total, completed, inProgress, bookmarked };
  };

  const stats = getProgressStats();

  return (
    <>
      {/* Enhanced Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search videos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
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
              <SelectTrigger className="w-40 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                <SelectValue placeholder="Level" />
              </SelectTrigger>
              <SelectContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            {learningItems.length > 0 && (
              <Button 
                variant="outline"
                onClick={handleClearAll}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-red-50 hover:border-red-300"
              >
                <Icons.Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
            >
              <Icons.Youtube className="h-4 w-4 mr-2" />
              Add Video
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        {learningItems.length > 0 && (
          <div className="flex gap-4 p-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Total: <span className="font-semibold text-gray-900 dark:text-white">{stats.total}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Completed: <span className="font-semibold text-green-600">{stats.completed}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                In Progress: <span className="font-semibold text-yellow-600">{stats.inProgress}</span>
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                Bookmarked: <span className="font-semibold text-purple-600">{stats.bookmarked}</span>
              </span>
            </div>
          </div>
        )}
      </div>

      <TabsContent value="resources" className="space-y-6">
        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="animate-pulse bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg"></div>
                <CardContent className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                  <div className="flex gap-2">
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-20"></div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : learningItems.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <div className="mb-6">
                <Icons.Youtube className="h-20 w-20 text-gray-400 mx-auto mb-4" />
                <div className="w-24 h-1 bg-gradient-to-r from-red-500 to-red-600 mx-auto rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Build Your Learning Library
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto leading-relaxed">
                Start creating your personalized command room by adding YouTube videos. Transform content into structured learning experiences.
              </p>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
                size="lg"
              >
                <Icons.Youtube className="h-5 w-5 mr-2" />
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
                onDelete={handleDeleteVideo}
              />
            ))}
          </div>
        )}

        {learningItems.length > 0 && filteredItems.length === 0 && (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-8 text-center">
              <Icons.Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Videos Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Try adjusting your search terms or filters to find videos.
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                  setSelectedLevel('all');
                }}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                Clear Filters
              </Button>
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
              onDelete={handleDeleteVideo}
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
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Icons.TrendingUp className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-blue-600 dark:text-blue-400">Total Videos</span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{stats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                <span className="text-2xl font-bold text-green-600">{stats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</span>
                <span className="text-2xl font-bold text-yellow-600">{stats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600 dark:text-purple-400">Bookmarked</span>
                <span className="text-2xl font-bold text-purple-600">{stats.bookmarked}</span>
              </div>
            </CardContent>
          </Card>

          {stats.total > 0 && (
            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Icons.Target className="h-5 w-5" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {Math.round((stats.completed / stats.total) * 100)}%
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(stats.completed / stats.total) * 100}%` }}
                    ></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Icons.Upload className="h-5 w-5" />
              Upload Learning Materials
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
              <Icons.Upload className="h-4 w-4 mr-2" />
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
