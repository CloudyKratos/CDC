
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { 
  Play, 
  Clock, 
  Star, 
  CheckCircle, 
  BookOpen,
  Users,
  Trophy
} from 'lucide-react';

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

interface SimpleCourseGridProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
  selectedCategory: string;
  onBackToCategories: () => void;
  viewMode?: 'grid' | 'list';
}

const SimpleCourseGrid: React.FC<SimpleCourseGridProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  selectedCategory,
  onBackToCategories,
  viewMode = 'grid'
}) => {
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const CategoryIcon = ({ category }: { category: string }) => {
    const icons = {
      'Mindset': '🧠',
      'Metapreneur': '🚀',
      'Business Wiz': '💎',
      'Inner Circles': '🎯',
      "Warrior's Training": '⚔️'
    };
    return <span className="text-2xl">{icons[category as keyof typeof icons] || '📚'}</span>;
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-20 bg-gradient-to-br from-slate-50 to-blue-50 rounded-2xl border border-slate-200">
        <div className="max-w-md mx-auto space-y-6">
          <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-2xl flex items-center justify-center mx-auto">
            <BookOpen className="h-12 w-12 text-blue-600" />
          </div>
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-gray-900">No Courses Found</h3>
            <p className="text-gray-600">
              No courses match your current filters. Try adjusting your search criteria.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const gridClasses = viewMode === 'grid' 
    ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
    : 'space-y-4';

  return (
    <div className={gridClasses}>
      {videos.map((video) => {
        const progress = userProgress[video.id] || 0;
        const isCompleted = progress === 100;
        
        return (
          <Card 
            key={video.id} 
            className={`group hover:shadow-lg transition-all duration-300 border-gray-200 hover:border-blue-200 ${
              viewMode === 'list' ? 'flex flex-row' : ''
            }`}
          >
            <div className={`relative bg-gray-100 overflow-hidden ${
              viewMode === 'list' 
                ? 'w-48 flex-shrink-0' 
                : 'aspect-video'
            }`}>
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                alt={video.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiNGMUY1RjkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMTIuNSIgcj0iMzAiIGZpbGw9IiM5RkEyQjIiLz48L3N2Zz4=';
                }}
              />
              
              {isCompleted && (
                <div className="absolute top-3 right-3">
                  <Badge className="bg-green-500 text-white border-0 shadow-md">
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Complete
                  </Badge>
                </div>
              )}

              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
                <Button
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                  size="lg"
                  className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 text-gray-900 hover:bg-white rounded-full h-12 w-12 p-0"
                >
                  <Play className="h-5 w-5 ml-0.5" />
                </Button>
              </div>

              {progress > 0 && (
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              )}
            </div>

            <CardContent className={`space-y-4 ${viewMode === 'list' ? 'flex-1 p-6' : 'p-5'}`}>
              <div className="flex items-center justify-between">
                <Badge className={getDifficultyColor(video.difficulty)} variant="outline">
                  {video.difficulty}
                </Badge>
                <div className="flex items-center gap-1 text-amber-600">
                  <Star className="h-3 w-3 fill-current" />
                  <span className="text-sm font-medium">4.8</span>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 group-hover:text-blue-700 transition-colors">
                  {video.title}
                </h3>
                <p className="text-gray-600 text-sm line-clamp-2">
                  {video.description}
                </p>
              </div>

              <div className="flex items-center justify-between text-sm text-gray-500">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {video.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {video.moduleCount || 8} modules
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  1.2k enrolled
                </div>
              </div>

              <div className="space-y-3 pt-2 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-700">Progress</span>
                  <span className="text-sm font-bold text-blue-600">{progress}%</span>
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
                      className="text-xs px-2 py-1 h-6 flex-1 disabled:opacity-30 border-gray-300 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                    >
                      {value === 100 ? (
                        <>
                          <Trophy className="h-3 w-3 mr-1" />
                          Done
                        </>
                      ) : (
                        `${value}%`
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <Button 
                onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                size="sm"
              >
                {progress === 0 ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Start Learning
                  </>
                ) : progress === 100 ? (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Review Course
                  </>
                ) : (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Continue Learning
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default SimpleCourseGrid;
