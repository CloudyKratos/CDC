
import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Play, ExternalLink, Clock, CheckCircle, AlertTriangle, Star } from 'lucide-react';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: string;
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  category?: string;
  progress?: number;
  onProgressUpdate?: (progress: number) => void;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title,
  description,
  duration,
  difficulty,
  category,
  progress = 0,
  onProgressUpdate,
  className = ""
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [currentProgress, setCurrentProgress] = useState(progress);

  useEffect(() => {
    setCurrentProgress(progress);
  }, [progress]);

  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}&rel=0&modestbranding=1`;

  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setHasError(false);
  }, []);

  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
    toast.error('Failed to load video');
  }, []);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setCurrentProgress(clampedProgress);
    
    if (onProgressUpdate) {
      onProgressUpdate(clampedProgress);
    }

    if (clampedProgress === 100) {
      toast.success('Content mastered! 🎉', {
        description: 'Great job on completing this learning resource!'
      });
    }
  }, [onProgressUpdate]);

  const getDifficultyColor = (diff?: string) => {
    switch (diff) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (hasError) {
    return (
      <Card className={`overflow-hidden bg-red-50 border border-red-200 ${className}`}>
        <div className="aspect-video bg-red-100 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">
              Content Unavailable
            </h3>
            <p className="text-red-600 mb-4 text-sm">
              This resource couldn't be loaded.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
              className="bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Open on YouTube
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-gray-100">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-500 border-t-transparent mx-auto"></div>
              <p className="text-gray-600 text-sm">Loading content...</p>
            </div>
          </div>
        )}
        
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          loading="lazy"
        />
      </div>

      {/* Content Info */}
      <CardContent className="p-4 space-y-4">
        {/* Header */}
        <div>
          <h3 className="font-semibold text-gray-900 line-clamp-2 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-600 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Meta Information */}
        <div className="flex items-center gap-2 flex-wrap">
          {difficulty && (
            <Badge className={getDifficultyColor(difficulty)}>
              {difficulty}
            </Badge>
          )}
          {duration && (
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-gray-50">
              <Clock className="h-3 w-3 mr-1" />
              {duration}
            </Badge>
          )}
          {category && (
            <Badge variant="outline" className="border-gray-300 text-gray-600 bg-gray-50">
              <Star className="h-3 w-3 mr-1" />
              {category}
            </Badge>
          )}
          {currentProgress === 100 && (
            <Badge className="bg-green-500 text-white border-0">
              <CheckCircle className="h-3 w-3 mr-1" />
              Completed
            </Badge>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-700 text-sm font-medium">Progress</span>
            <span className="text-gray-900 font-semibold">{currentProgress}%</span>
          </div>
          
          <Progress value={currentProgress} className="h-2 bg-gray-200" />
          
          {/* Quick Progress Actions */}
          <div className="flex gap-2">
            {[25, 50, 75, 100].map((value) => (
              <Button
                key={value}
                variant="outline"
                size="sm"
                onClick={() => handleProgressUpdate(value)}
                disabled={currentProgress >= value}
                className="text-xs px-3 py-1 h-7 border-gray-300 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
              >
                {value === 100 ? 'Complete' : `${value}%`}
              </Button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          <Badge className="bg-red-500 text-white border-0 text-xs">
            <Play className="h-3 w-3 mr-1" />
            Video Content
          </Badge>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            className="text-gray-500 hover:text-gray-700 p-1 h-auto"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default YouTubeEmbed;
