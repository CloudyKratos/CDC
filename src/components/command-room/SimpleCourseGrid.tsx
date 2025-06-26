
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
  ArrowLeft
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
}

const SimpleCourseGrid: React.FC<SimpleCourseGridProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  selectedCategory,
  onBackToCategories
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
    return <span className="text-lg">{icons[category as keyof typeof icons] || '📚'}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center gap-4 mb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToCategories}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Categories
          </Button>
        </div>
        
        <div className="flex items-center gap-3">
          <CategoryIcon category={selectedCategory} />
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{selectedCategory}</h2>
            <p className="text-gray-600">{videos.length} courses available</p>
          </div>
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videos.map((video) => {
          const progress = userProgress[video.id] || 0;
          const isCompleted = progress === 100;
          
          return (
            <Card key={video.id} className="group hover:shadow-lg transition-all duration-300 border-gray-200">
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
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
                    <Badge className="bg-green-500 text-white border-0">
                      <CheckCircle className="h-3 w-3 mr-1" />
                      Done
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
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                )}
              </div>

              <CardContent className="p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(video.difficulty)} variant="outline">
                    {video.difficulty}
                  </Badge>
                  <div className="flex items-center gap-1 text-amber-600">
                    <Star className="h-3 w-3 fill-current" />
                    <span className="text-sm font-medium">4.8</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {video.description}
                  </p>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {video.duration}
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-4 w-4" />
                    {video.moduleCount || 8} modules
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Progress</span>
                    <span className="text-sm font-bold text-gray-900">{progress}%</span>
                  </div>
                  
                  <Progress value={progress} className="h-2" />
                  
                  <div className="flex gap-2">
                    {[25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant="outline"
                        size="sm"
                        onClick={() => onProgressUpdate(video.id, value)}
                        disabled={progress >= value}
                        className="text-xs px-2 py-1 h-6 flex-1 disabled:opacity-30"
                      >
                        {value === 100 ? 'Complete' : `${value}%`}
                      </Button>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="sm"
                >
                  {progress === 0 ? 'Start Course' : progress === 100 ? 'Review' : 'Continue'}
                  <Play className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default SimpleCourseGrid;
