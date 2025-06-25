
import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Youtube, 
  Clock, 
  Star, 
  Search, 
  Grid, 
  List, 
  Filter,
  CheckCircle,
  Play,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';

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

interface StableCourseGridProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

const StableCourseGrid: React.FC<StableCourseGridProps> = ({
  videos,
  userProgress,
  onProgressUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'progress' | 'title'>('newest');

  // Memoized filtered and sorted videos
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
        case 'oldest':
          return new Date(a.addedAt).getTime() - new Date(b.addedAt).getTime();
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

  const categories = useMemo(() => 
    ['all', ...Array.from(new Set(videos.map(v => v.category)))], 
    [videos]
  );

  const difficulties = ['all', 'beginner', 'intermediate', 'advanced'];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const CourseCard: React.FC<{ video: LearningVideo }> = ({ video }) => {
    const progress = userProgress[video.id] || 0;
    
    return (
      <Card className="group bg-white border border-gray-200 hover:shadow-lg hover:border-gray-300 transition-all duration-300 overflow-hidden">
        <div className="aspect-video bg-gray-100 relative overflow-hidden">
          <iframe
            src={`https://www.youtube.com/embed/${video.videoId}`}
            title={video.title}
            className="w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
        </div>
        
        <CardContent className="p-5 space-y-4">
          <div>
            <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2 text-lg leading-tight">
              {video.title}
            </h3>
            <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
              {video.description}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Badge className={getDifficultyColor(video.difficulty)}>
              {video.difficulty}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-gray-50">
              <Clock className="h-3 w-3 mr-1" />
              {video.duration}
            </Badge>
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-gray-50">
              <Star className="h-3 w-3 mr-1" />
              {video.category}
            </Badge>
            {progress === 100 && (
              <Badge className="bg-green-500 text-white border-0">
                <CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-gray-700 text-sm font-medium">Progress</span>
              <span className="text-gray-900 font-semibold">{progress}%</span>
            </div>
            
            <Progress value={progress} className="h-2 bg-gray-200" />
            
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => onProgressUpdate(video.id, value)}
                  disabled={progress >= value}
                  className="text-xs px-3 py-1 h-7 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50 flex-1"
                >
                  {value === 100 ? 'Complete' : `${value}%`}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <Badge className="bg-red-500 text-white border-0 text-xs">
              <Play className="h-3 w-3 mr-1" />
              Video Content
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
              className="text-gray-500 hover:text-gray-700 p-1 h-auto"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  };

  if (filteredVideos.length === 0) {
    return (
      <div className="text-center py-16">
        <Youtube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Found</h3>
        <p className="text-gray-500">
          {searchTerm || selectedCategory !== 'all' || selectedDifficulty !== 'all'
            ? 'Try adjusting your search or filters.' 
            : 'No learning content available yet in the vault.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses, topics, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500"
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
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="h-4 w-4 text-gray-500" />
          
          {/* Category Filter */}
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

          {/* Difficulty Filter */}
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

          <div className="h-4 w-px bg-gray-300" />

          {/* Sort Options */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-sm border border-gray-300 rounded px-3 py-1 bg-white text-gray-700 focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="progress">By Progress</option>
            <option value="title">Alphabetical</option>
          </select>
        </div>

        {/* Results Count */}
        <div className="text-sm text-gray-600">
          Showing {filteredVideos.length} of {videos.length} courses
        </div>
      </div>

      {/* Course Grid */}
      <div className={viewMode === 'grid' 
        ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
        : "space-y-4"
      }>
        {filteredVideos.map((video) => (
          <CourseCard key={video.id} video={video} />
        ))}
      </div>
    </div>
  );
};

export default StableCourseGrid;
