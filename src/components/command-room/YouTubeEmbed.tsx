
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Play, ExternalLink, Clock, CheckCircle, AlertTriangle } from 'lucide-react';

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
    toast.error('Failed to load video');
  }, []);

  const handleProgressUpdate = useCallback((newProgress: number) => {
    const clampedProgress = Math.max(0, Math.min(100, newProgress));
    setCurrentProgress(clampedProgress);
    
    if (onProgressUpdate) {
      onProgressUpdate(clampedProgress);
    }

    if (clampedProgress === 100) {
      toast.success('Course completed!');
    }
  }, [onProgressUpdate]);

  if (hasError) {
    return (
      <Card className={`overflow-hidden bg-red-900/20 border-red-800/50 ${className}`}>
        <div className="aspect-video bg-red-900/10 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-300 mb-2">
              Video Unavailable
            </h3>
            <p className="text-red-200/80 mb-4 text-sm">
              This video couldn't be loaded.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
              className="bg-red-500/20 border-red-400/50 text-red-300"
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
    <Card className={`overflow-hidden bg-gray-800/50 border-gray-700 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-center space-y-3">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-400 border-t-transparent mx-auto"></div>
              <p className="text-gray-300 text-sm">Loading...</p>
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
      <div className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-white line-clamp-2 mb-2">
            {title}
          </h3>
          {description && (
            <p className="text-gray-400 text-sm line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-300 text-sm">Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-semibold">{currentProgress}%</span>
              {currentProgress === 100 && <CheckCircle className="h-4 w-4 text-green-400" />}
            </div>
          </div>
          
          <Progress value={currentProgress} className="h-2 bg-gray-700" />
          
          {/* Quick Progress Controls */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProgressUpdate(25)}
              disabled={currentProgress >= 25}
              className="bg-gray-700 border-gray-600 text-gray-300 text-xs px-2 py-1 h-auto"
            >
              25%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProgressUpdate(50)}
              disabled={currentProgress >= 50}
              className="bg-gray-700 border-gray-600 text-gray-300 text-xs px-2 py-1 h-auto"
            >
              50%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProgressUpdate(75)}
              disabled={currentProgress >= 75}
              className="bg-gray-700 border-gray-600 text-gray-300 text-xs px-2 py-1 h-auto"
            >
              75%
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleProgressUpdate(100)}
              disabled={currentProgress >= 100}
              className="bg-gray-700 border-gray-600 text-gray-300 text-xs px-2 py-1 h-auto"
            >
              Done
            </Button>
          </div>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-700">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-600 text-white border-0 text-xs">
              <Play className="h-3 w-3 mr-1" />
              Video
            </Badge>
            {duration && (
              <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {duration}
              </Badge>
            )}
            {currentProgress === 100 && (
              <Badge className="bg-green-600 text-white border-0 text-xs">
                <CheckCircle className="h-3 w-3 mr-1" />
                Complete
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            className="text-gray-400 hover:text-gray-300 p-1 h-auto"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default YouTubeEmbed;
