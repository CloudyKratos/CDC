
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
  Users,
  BookOpen,
  Trophy,
  TrendingUp,
  Award
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
  progress?: number;
  instructor?: string;
  rating?: number;
  enrolledCount?: number;
  thumbnail?: string;
}

interface PremiumCourseCardProps {
  video: LearningVideo & { 
    instructor: string; 
    rating: number; 
    enrolledCount: number; 
    thumbnail: string; 
  };
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

const PremiumCourseCard: React.FC<PremiumCourseCardProps> = ({
  video,
  userProgress,
  onProgressUpdate
}) => {
  const progress = userProgress[video.id] || 0;
  const isCompleted = progress === 100;

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'intermediate': return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="group bg-white border-0 shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden rounded-2xl transform hover:scale-[1.02]">
      {/* Premium Thumbnail */}
      <div className="relative aspect-video overflow-hidden bg-gradient-to-br from-slate-100 to-slate-200">
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjIyNSIgdmlld0JveD0iMCAwIDQwMCAyMjUiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIyMjUiIGZpbGw9IiNGMUY1RjkiLz48Y2lyY2xlIGN4PSIyMDAiIGN5PSIxMTIuNSIgcj0iMzAiIGZpbGw9IiM5RkEyQjIiLz48L3N2Zz4=';
          }}
        />
        
        {/* Premium Badge */}
        <div className="absolute top-3 left-3">
          <Badge className="bg-gradient-to-r from-purple-600 to-blue-600 text-white border-0 shadow-lg">
            <Award className="h-3 w-3 mr-1" />
            Premium
          </Badge>
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 shadow-lg">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}

        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-center justify-center">
          <Button
            onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white/95 text-gray-900 hover:bg-white shadow-2xl rounded-full h-16 w-16 p-0"
          >
            <Play className="h-8 w-8 ml-1" />
          </Button>
        </div>

        {/* Progress Bar at Bottom */}
        {progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/20">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>

      <CardContent className="p-6 space-y-4">
        {/* Course Meta */}
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(video.difficulty)} variant="outline">
            {video.difficulty.charAt(0).toUpperCase() + video.difficulty.slice(1)}
          </Badge>
          <div className="flex items-center gap-1 text-sm text-amber-600">
            <Star className="h-4 w-4 fill-current" />
            <span className="font-semibold">{video.rating.toFixed(1)}</span>
          </div>
        </div>

        {/* Course Title & Description */}
        <div className="space-y-2">
          <h3 className="font-bold text-xl text-gray-900 line-clamp-2 leading-tight group-hover:text-blue-700 transition-colors">
            {video.title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {video.description}
          </p>
        </div>

        {/* Instructor & Stats */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-bold">
              {video.instructor.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{video.instructor}</p>
              <p className="text-xs text-gray-500">Course Instructor</p>
            </div>
          </div>

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {video.duration}
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {video.enrolledCount.toLocaleString()}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span className="capitalize">{video.category}</span>
            </div>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 pt-4 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-700">Your Progress</span>
            <span className="text-sm font-bold text-blue-600">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2 bg-gray-200" />
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => onProgressUpdate(video.id, value)}
                disabled={progress >= value}
                className="text-xs px-2 py-1 h-6 border-gray-300 text-gray-600 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 disabled:opacity-30 flex-1"
              >
                {value === 100 ? (
                  <>
                    <Trophy className="h-3 w-3 mr-1" />
                    Complete
                  </>
                ) : (
                  `${value}%`
                )}
              </Button>
            ))}
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          onClick={() => window.open(`https://youtube.com/watch?v=${video.videoId}`, '_blank')}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300"
          size="lg"
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
              <TrendingUp className="h-4 w-4 mr-2" />
              Continue Learning
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};

export default PremiumCourseCard;
