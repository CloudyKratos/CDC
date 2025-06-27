
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ArrowLeft, Filter, Grid, List } from 'lucide-react';
import CategoryOverview from './CategoryOverview';
import SimpleCourseGrid from './SimpleCourseGrid';
import { courseCategories } from './mockData';

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
  moduleCount?: number;
  estimatedHours?: number;
}

interface PremiumCoursesTabProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
  searchTerm: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
  isAdmin?: boolean;
  onAddVideo?: () => void;
}

const PremiumCoursesTab: React.FC<PremiumCoursesTabProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  isAdmin,
  onAddVideo
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Calculate course counts by category
  const courseCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courseCategories.forEach(cat => {
      counts[cat.id] = videos.filter(video => video.category === cat.id).length;
    });
    return counts;
  }, [videos]);

  // Calculate completed counts by category
  const completedCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    courseCategories.forEach(cat => {
      counts[cat.id] = videos
        .filter(video => video.category === cat.id)
        .filter(video => userProgress[video.id] === 100)
        .length;
    });
    return counts;
  }, [videos, userProgress]);

  // Filter videos by selected category, search, and difficulty
  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    if (selectedCategory) {
      filtered = filtered.filter(video => video.category === selectedCategory);
    }
    
    if (searchTerm) {
      filtered = filtered.filter(video => 
        video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(video => video.difficulty === selectedDifficulty);
    }
    
    return filtered;
  }, [videos, selectedCategory, searchTerm, selectedDifficulty]);

  // Calculate stats
  const totalCourses = videos.length;
  const completedCourses = Object.values(userProgress).filter(p => p === 100).length;
  const totalHours = videos.reduce((acc, video) => {
    const hours = parseFloat(video.duration.replace(/[^\d.]/g, '')) || 0;
    return acc + hours;
  }, 0).toFixed(1);

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedDifficulty('all');
    setSelectedCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Stats */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{totalCourses}</div>
            <div className="text-sm text-gray-600">Total Courses</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{completedCourses}</div>
            <div className="text-sm text-gray-600">Completed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-600">{totalHours}h</div>
            <div className="text-sm text-gray-600">Total Hours</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-orange-600">
              {totalCourses > 0 ? Math.round((completedCourses / totalCourses) * 100) : 0}%
            </div>
            <div className="text-sm text-gray-600">Progress</div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses, topics, or instructors..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex border border-gray-300 rounded-lg overflow-hidden">
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Difficulty:</span>
          </div>
          
          {['all', 'beginner', 'intermediate', 'advanced'].map((difficulty) => (
            <Badge
              key={difficulty}
              variant={selectedDifficulty === difficulty ? "default" : "outline"}
              className={`cursor-pointer transition-all ${
                selectedDifficulty === difficulty 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
              onClick={() => setSelectedDifficulty(difficulty)}
            >
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </Badge>
          ))}

          {(searchTerm || selectedDifficulty !== 'all' || selectedCategory) && (
            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-blue-600 hover:text-blue-700">
              Clear Filters
            </Button>
          )}
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredVideos.length} of {totalCourses} courses
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-[600px]">
        {!selectedCategory ? (
          <CategoryOverview
            categories={courseCategories}
            onCategorySelect={setSelectedCategory}
            courseCounts={courseCounts}
            completedCounts={completedCounts}
          />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Categories
              </Button>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedCategory}</h2>
                <p className="text-sm text-gray-600">{filteredVideos.length} courses</p>
              </div>
            </div>
            
            <SimpleCourseGrid
              videos={filteredVideos}
              userProgress={userProgress}
              onProgressUpdate={onProgressUpdate}
              selectedCategory={selectedCategory}
              onBackToCategories={() => setSelectedCategory(null)}
              viewMode={viewMode}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PremiumCoursesTab;
