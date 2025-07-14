
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
  ExternalLink,
  MoreHorizontal
} from 'lucide-react';

interface CourseCardProps {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  progress: number;
  rating?: number;
  instructor?: string;
  onProgressUpdate: (progress: number) => void;
  onPlay: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
  title,
  description,
  videoId,
  duration,
  category,
  difficulty,
  progress,
  rating = 4.5,
  instructor = "Expert Instructor",
  onProgressUpdate,
  onPlay
}) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const isCompleted = progress === 100;

  return (
    <Card className="group bg-white border border-gray-200 hover:shadow-xl hover:border-blue-200 transition-all duration-300 overflow-hidden">
      {/* Course Thumbnail */}
      <div className="relative aspect-video bg-gray-100 overflow-hidden">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
        
        {/* Play Button Overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
          <Button
            onClick={onPlay}
            size="lg"
            className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white/90 text-gray-900 hover:bg-white shadow-lg"
          >
            <Play className="h-6 w-6 mr-2" />
            Watch Now
          </Button>
        </div>

        {/* Completion Badge */}
        {isCompleted && (
          <div className="absolute top-3 right-3">
            <Badge className="bg-green-500 text-white border-0 shadow-md">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          </div>
        )}
      </div>

      <CardContent className="p-5 space-y-4">
        {/* Course Meta */}
        <div className="flex items-center justify-between">
          <Badge className={getDifficultyColor(difficulty)} variant="outline">
            {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
          </Badge>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>

        {/* Course Info */}
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 text-lg line-clamp-2 leading-tight">
            {title}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-2 leading-relaxed">
            {description}
          </p>
        </div>

        {/* Course Details */}
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            {duration}
          </div>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
            {rating}
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-4 w-4" />
            {category}
          </div>
        </div>

        {/* Instructor */}
        <div className="text-sm text-gray-600">
          by <span className="font-medium text-gray-900">{instructor}</span>
        </div>

        {/* Progress Section */}
        <div className="space-y-3 pt-2 border-t border-gray-100">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-semibold text-gray-900">{progress}%</span>
          </div>
          
          <Progress value={progress} className="h-2" />
          
          {/* Quick Progress Actions */}
          {!isCompleted && (
            <div className="flex gap-2">
              {[25, 50, 75, 100].map((value) => (
                <Button
                  key={value}
                  variant="outline"
                  size="sm"
                  onClick={() => onProgressUpdate(value)}
                  disabled={progress >= value}
                  className="text-xs px-3 py-1 h-7 flex-1 disabled:opacity-50"
                >
                  {value === 100 ? 'Complete' : `${value}%`}
                </Button>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <Button 
          onClick={onPlay}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          size="sm"
        >
          {progress === 0 ? 'Start Course' : progress === 100 ? 'Review' : 'Continue'}
          <ExternalLink className="h-4 w-4 ml-2" />
        </Button>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
