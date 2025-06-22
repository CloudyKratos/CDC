
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import Icons from '@/utils/IconUtils';

interface YouTubeEmbedProps {
  videoId: string;
  title: string;
  description?: string;
  duration?: string;
  progress?: number;
  onProgressUpdate?: (progress: number) => void;
  className?: string;
}

const YouTubeEmbed: React.FC<YouTubeEmbedProps> = ({
  videoId,
  title,
  description,
  duration,
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
    toast.error('Failed to load video', {
      description: 'Please check your internet connection and try again.'
    });
  }, []);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setCurrentProgress(clampedProgress);
    
    if (onProgressUpdate) {
      onProgressUpdate(clampedProgress);
    }

    if (clampedProgress === 100) {
      toast.success('Video completed! 🎉');
    }
  }, [onProgressUpdate]);

  const handleQuickProgress = useCallback((targetProgress: number) => {
    handleProgressUpdate(targetProgress);
  }, [handleProgressUpdate]);

  if (hasError) {
    return (
      <Card className={`overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-red-200/50 dark:border-red-800/50 ${className}`}>
        <div className="aspect-video bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
          <div className="text-center p-8">
            <Icons.AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 dark:text-red-300 mb-2">
              Video Failed to Load
            </h3>
            <p className="text-sm text-red-600 dark:text-red-400 mb-4">
              Unable to load this video. It may be unavailable or restricted.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
              className="text-red-600 border-red-300 hover:bg-red-50"
            >
              <Icons.ExternalLink className="h-4 w-4 mr-2" />
              Open on YouTube
            </Button>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className={`overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-4 border-primary border-t-transparent mx-auto mb-2"></div>
              <p className="text-sm text-gray-600 dark:text-gray-400">Loading video...</p>
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

      {/* Video Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Learning Progress</span>
            <span className="text-gray-900 dark:text-white font-medium">{currentProgress}%</span>
          </div>
          <Progress value={currentProgress} className="h-2" />
          
          {/* Quick Progress Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(25)}
              disabled={currentProgress >= 25}
              className="text-xs"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(50)}
              disabled={currentProgress >= 50}
              className="text-xs"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(75)}
              disabled={currentProgress >= 75}
              className="text-xs"
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(100)}
              disabled={currentProgress >= 100}
              className="text-xs"
            >
              Complete
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 text-xs">
              <Icons.Play className="h-3 w-3 mr-1" />
              Video
            </Badge>
            {duration && (
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-xs">
                <Icons.Clock className="h-3 w-3 mr-1" />
                {duration}
              </Badge>
            )}
            {currentProgress === 100 && (
              <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border-0 text-xs">
                <Icons.CheckCircle className="h-3 w-3 mr-1" />
                Completed
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            className="text-xs hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <Icons.ExternalLink className="h-3 w-3 mr-1" />
            YouTube
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default YouTubeEmbed;
