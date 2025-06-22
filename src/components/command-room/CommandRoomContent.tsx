import React, { useState, useCallback, useMemo } from 'react';
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

  // Memoized filtered items for better performance
  const filteredItems = useMemo(() => {
    return learningItems.filter(item => {
      const searchMatch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.coach.toLowerCase().includes(searchTerm.toLowerCase());
      const categoryMatch = selectedCategory === 'all' || item.category === selectedCategory;
      const levelMatch = selectedLevel === 'all' || item.level === selectedLevel;
      
      return searchMatch && categoryMatch && levelMatch;
    });
  }, [learningItems, searchTerm, selectedCategory, selectedLevel]);

  // Memoized progress stats
  const progressStats = useMemo(() => {
    const total = learningItems.length;
    const completed = learningItems.filter(item => item.progress === 100).length;
    const inProgress = learningItems.filter(item => item.progress > 0 && item.progress < 100).length;
    const bookmarked = learningItems.filter(item => item.isFavorited).length;
    return { total, completed, inProgress, bookmarked };
  }, [learningItems]);

  const handleAddVideo = useCallback((item: LearningItem) => {
    try {
      setLearningItems(prev => [...prev, item]);
      toast.success('Learning resource added successfully!', {
        description: `"${item.title}" is now available in your library`
      });
    } catch (error) {
      console.error('Error adding video:', error);
      toast.error('Failed to add learning resource');
    }
  }, []);

  const handlePlayVideo = useCallback((item: LearningItem) => {
    try {
      setSelectedVideo(item);
      setIsViewerOpen(true);
    } catch (error) {
      console.error('Error opening video:', error);
      toast.error('Failed to open video');
    }
  }, []);

  const handleToggleFavorite = useCallback((id: string) => {
    try {
      setLearningItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, isFavorited: !item.isFavorited } : item
        )
      );
      toast.success('Bookmark updated!');
    } catch (error) {
      console.error('Error updating bookmark:', error);
      toast.error('Failed to update bookmark');
    }
  }, []);

  const handleProgressUpdate = useCallback((id: string, progress: number) => {
    try {
      setLearningItems(prev => 
        prev.map(item => 
          item.id === id ? { ...item, progress } : item
        )
      );
      if (progress === 100) {
        toast.success('Learning completed! 🎉', {
          description: 'Great job on finishing this resource!'
        });
      }
    } catch (error) {
      console.error('Error updating progress:', error);
      toast.error('Failed to update progress');
    }
  }, []);

  const handleDeleteVideo = useCallback((id: string) => {
    try {
      const item = learningItems.find(item => item.id === id);
      setLearningItems(prev => prev.filter(item => item.id !== id));
      toast.success('Learning resource removed', {
        description: item ? `"${item.title}" has been removed from your library` : undefined
      });
    } catch (error) {
      console.error('Error deleting video:', error);
      toast.error('Failed to remove learning resource');
    }
  }, [learningItems]);

  const handleClearAll = useCallback(() => {
    if (learningItems.length === 0) {
      toast.info('No resources to clear');
      return;
    }
    
    try {
      setLearningItems([]);
      toast.success(`Cleared ${learningItems.length} learning resources`);
    } catch (error) {
      console.error('Error clearing all:', error);
      toast.error('Failed to clear resources');
    }
  }, [learningItems.length]);

  const handleClearFilters = useCallback(() => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedLevel('all');
    toast.info('Filters cleared');
  }, []);

  return (
    <>
      {/* Enhanced Search and Filters */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 items-center w-full sm:w-auto">
            <div className="relative flex-1 max-w-md">
              <Icons.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search learning resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50">
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
              <SelectTrigger className="w-40 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50">
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
            {(searchTerm || selectedCategory !== 'all' || selectedLevel !== 'all') && (
              <Button 
                variant="outline"
                onClick={handleClearFilters}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-purple-200/50 dark:border-purple-800/50"
              >
                <Icons.X className="h-4 w-4 mr-2" />
                Clear Filters
              </Button>
            )}
            {learningItems.length > 0 && (
              <Button 
                variant="outline"
                onClick={handleClearAll}
                className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm hover:bg-red-50 hover:border-red-300 border-purple-200/50 dark:border-purple-800/50"
              >
                <Icons.Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            )}
            <Button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg"
            >
              <Icons.Plus className="h-4 w-4 mr-2" />
              Add Resource
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Bar */}
        {learningItems.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-lg border border-purple-200/30 dark:border-purple-800/30">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900 dark:text-white">{progressStats.total}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Total Resources</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-green-600">{progressStats.completed}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Completed</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-yellow-600">{progressStats.inProgress}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">In Progress</div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-600">{progressStats.bookmarked}</div>
                <div className="text-xs text-gray-600 dark:text-gray-400">Bookmarked</div>
              </div>
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
          <Card className="bg-gradient-to-br from-white/80 to-purple-50/50 dark:from-gray-800/80 dark:to-purple-950/50 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <div className="mb-8">
                <div className="relative mx-auto mb-6 w-32 h-32">
                  <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-purple-500/20 rounded-full animate-pulse"></div>
                  <Icons.BookOpen className="h-20 w-20 text-gray-400 mx-auto mt-6" />
                </div>
                <div className="w-32 h-2 bg-gradient-to-r from-red-500 to-purple-600 mx-auto rounded-full"></div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                Welcome to Your Command Room
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto leading-relaxed">
                This is your personal learning command center. Add YouTube videos, courses, and resources to build your customized learning library.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <Icons.Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Organized Learning</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Categorize by topics and skill levels</p>
                </div>
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <Icons.TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Track Progress</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Monitor your learning journey</p>
                </div>
                <div className="p-4 bg-white/50 dark:bg-gray-700/50 rounded-lg">
                  <Icons.Star className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
                  <h4 className="font-semibold mb-1">Bookmark Favorites</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Save your best resources</p>
                </div>
              </div>
              <Button 
                onClick={() => setIsAddModalOpen(true)}
                className="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 shadow-lg text-lg px-8 py-3"
                size="lg"
              >
                <Icons.Plus className="h-5 w-5 mr-2" />
                Add Your First Resource
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
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-8 text-center">
              <Icons.Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Resources Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                No learning resources match your current search and filter criteria.
              </p>
              <Button
                variant="outline"
                onClick={handleClearFilters}
                className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm"
              >
                <Icons.RotateCcw className="h-4 w-4 mr-2" />
                Clear All Filters
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
          <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <Icons.Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Bookmarks Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Bookmark your favorite learning resources to access them quickly later.
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
                <span className="text-sm text-blue-600 dark:text-blue-400">Total Resources</span>
                <span className="text-2xl font-bold text-blue-700 dark:text-blue-300">{progressStats.total}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-green-600 dark:text-green-400">Completed</span>
                <span className="text-2xl font-bold text-green-600">{progressStats.completed}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-yellow-600 dark:text-yellow-400">In Progress</span>
                <span className="text-2xl font-bold text-yellow-600">{progressStats.inProgress}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-purple-600 dark:text-purple-400">Bookmarked</span>
                <span className="text-2xl font-bold text-purple-600">{progressStats.bookmarked}</span>
              </div>
            </CardContent>
          </Card>

          {progressStats.total > 0 && (
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
                    {Math.round((progressStats.completed / progressStats.total) * 100)}%
                  </div>
                  <div className="w-full bg-green-200 dark:bg-green-800 rounded-full h-3 mb-2">
                    <div 
                      className="bg-green-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(progressStats.completed / progressStats.total) * 100}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-green-600 dark:text-green-400">
                    {progressStats.completed} of {progressStats.total} resources completed
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-purple-700 dark:text-purple-300">
                <Icons.Award className="h-5 w-5" />
                Learning Stats
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-purple-600 dark:text-purple-400">Avg. Progress</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {progressStats.total > 0 
                    ? Math.round(learningItems.reduce((sum, item) => sum + item.progress, 0) / progressStats.total)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-600 dark:text-purple-400">Categories</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {new Set(learningItems.map(item => item.category)).size}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-purple-600 dark:text-purple-400">Levels</span>
                <span className="font-bold text-purple-700 dark:text-purple-300">
                  {new Set(learningItems.map(item => item.level)).size}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
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
        onClose={() => {
          setIsViewerOpen(false);
          setSelectedVideo(null);
        }}
        onProgressUpdate={handleProgressUpdate}
      />
    </>
  );
};

export default CommandRoomContent;
