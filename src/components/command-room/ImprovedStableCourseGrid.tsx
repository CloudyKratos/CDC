import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  Grid, 
  List, 
  Filter,
  SortDesc,
  BookOpen
} from 'lucide-react';
import VaultResourcesHeader from './VaultResourcesHeader';
import CourseCard from './CourseCard';

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
  cost?: number; // Add cost to support coin unlocking
}

interface ImprovedStableCourseGridProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const ImprovedStableCourseGrid: React.FC<ImprovedStableCourseGridProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  isAdmin,
  onAddVideo
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'popular' | 'progress' | 'title'>('newest');

  // Calculate stats
  const totalCourses = videos.length;
  const completedCourses = Object.values(userProgress).filter(p => p === 100).length;
  const totalHours = "24.5"; // Mock data - could be calculated from actual video durations
  const averageRating = 4.6;

  // Get unique categories
  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(videos.map(v => v.category)))], 
    [videos]
  );

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = videos.filter(video => {
      const matchesSearch = searchTerm === '' || 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
      const matchesDifficulty = selectedDifficulty === 'all' || video.difficulty === selectedDifficulty;
      
      return matchesSearch && matchesCategory && matchesDifficulty;
    });

    // Sort videos
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
        case 'popular':
          return Math.random() - 0.5; // Mock popularity sorting
        case 'progress':
          return (userProgress[b.id] || 0) - (userProgress[a.id] || 0);
        case 'title':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [videos, searchTerm, selectedCategory, selectedDifficulty, sortBy, userProgress]);

  const handleVideoPlay = (videoId: string) => {
    window.open(`https://youtube.com/watch?v=${videoId}`, '_blank');
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-16">
        <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Available</h3>
        <p className="text-gray-500">Start building your learning library by adding your first course.</p>
        {isAdmin && (
          <Button onClick={onAddVideo} className="mt-4">
            Add First Course
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <VaultResourcesHeader
        totalCourses={totalCourses}
        completedCourses={completedCourses}
        totalHours={totalHours}
        averageRating={averageRating}
        onAddCourse={onAddVideo}
        isAdmin={isAdmin}
      />

      {/* Advanced Filters */}
      <div className="bg-white rounded-lg border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>

          {/* View Mode Toggle */}
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

          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 border border-gray-300 rounded-lg bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="popular">Most Popular</option>
            <option value="progress">By Progress</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>

        {/* Filter Tags */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          
          {/* Category Filters */}
          <div className="flex gap-1 flex-wrap">
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

          <div className="h-4 w-px bg-gray-300" />

          {/* Difficulty Filters */}
          <div className="flex gap-1 flex-wrap">
            {difficulties.map((difficulty) => (
              <Badge
                key={difficulty}
                variant={selectedDifficulty === difficulty ? "default" : "outline"}
                className={`cursor-pointer ${
                  selectedDifficulty === difficulty 
                    ? 'bg-purple-500 text-white border-purple-500' 
                    : 'text-gray-600 border-gray-300 hover:bg-gray-50'
                }`}
                onClick={() => setSelectedDifficulty(difficulty)}
              >
                {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
              </Badge>
            ))}
          </div>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600 flex items-center justify-between">
          <span>Showing {filteredVideos.length} of {videos.length} courses</span>
          {filteredVideos.length !== videos.length && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </div>
      </div>

      {/* Course Grid */}
      {filteredVideos.length === 0 ? (
        <div className="text-center py-16">
          <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Courses Found</h3>
          <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
        </div>
      ) : (
        <div className={viewMode === 'grid' 
          ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
          : "space-y-4"
        }>
          {filteredVideos.map((video) => (
            <CourseCard
              key={video.id}
              id={video.id}
              title={video.title}
              description={video.description}
              videoId={video.videoId}
              duration={video.duration}
              category={video.category}
              difficulty={video.difficulty}
              progress={userProgress[video.id] || 0}
              cost={video.cost || 25} // Default cost if not specified
              onProgressUpdate={(progress) => onProgressUpdate(video.id, progress)}
              onPlay={() => handleVideoPlay(video.videoId)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ImprovedStableCourseGrid;
