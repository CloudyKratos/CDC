
import React, { useState, useEffect, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Play, ExternalLink, Clock, CheckCircle, AlertTriangle, Star, Zap } from 'lucide-react';

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
      toast.success('🎉 Course completed! Amazing work!', {
        description: 'You\'ve mastered another skill. Keep up the momentum!'
      });
    }
  }, [onProgressUpdate]);

  const handleQuickProgress = useCallback((targetProgress: number) => {
    handleProgressUpdate(targetProgress);
  }, [handleProgressUpdate]);

  if (hasError) {
    return (
      <Card className={`overflow-hidden bg-gradient-to-br from-red-500/10 to-orange-500/10 backdrop-blur-sm border-red-400/30 shadow-xl ${className}`}>
        <div className="aspect-video bg-gradient-to-br from-red-900/20 to-orange-900/20 flex items-center justify-center">
          <div className="text-center p-8">
            <AlertTriangle className="h-16 w-16 text-red-400 mx-auto mb-6" />
            <h3 className="text-xl font-bold text-red-300 mb-3">
              Video Unavailable
            </h3>
            <p className="text-red-200/80 mb-6">
              This course couldn't be loaded. It might be temporarily unavailable.
            </p>
            <Button
              variant="outline"
              onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
              className="bg-red-500/20 border-red-400/50 text-red-300 hover:bg-red-500/30 hover:text-red-200"
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
    <Card className={`overflow-hidden bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-300 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-black rounded-t-xl overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-gray-900 to-black">
            <div className="text-center space-y-4">
              <div className="relative">
                <div className="animate-spin rounded-full h-12 w-12 border-4 border-gradient-to-r from-cyan-400 to-purple-500 border-t-transparent mx-auto"></div>
                <Zap className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 h-5 w-5 text-cyan-400 animate-pulse" />
              </div>
              <p className="text-cyan-200 font-medium">Loading epic content...</p>
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

      {/* Enhanced Video Info */}
      <div className="p-6 space-y-6">
        <div>
          <h3 className="font-bold text-xl text-white line-clamp-2 mb-3">
            {title}
          </h3>
          {description && (
            <p className="text-blue-100/80 line-clamp-3 leading-relaxed">
              {description}
            </p>
          )}
        </div>

        {/* Enhanced Progress Section */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-cyan-200 font-medium">Learning Progress</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-lg">{currentProgress}%</span>
              {currentProgress === 100 && <Star className="h-5 w-5 text-yellow-400" />}
            </div>
          </div>
          
          <div className="relative">
            <Progress value={currentProgress} className="h-3 bg-gray-700/50" />
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 rounded-full opacity-80" 
                 style={{ width: `${currentProgress}%` }}></div>
          </div>
          
          {/* Enhanced Quick Progress Controls */}
          <div className="flex gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(25)}
              disabled={currentProgress >= 25}
              className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border-cyan-400/40 text-cyan-300 hover:from-cyan-500/30 hover:to-blue-500/30 hover:text-cyan-200 disabled:opacity-50"
            >
              25% 🌱
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(50)}
              disabled={currentProgress >= 50}
              className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-purple-400/40 text-purple-300 hover:from-purple-500/30 hover:to-pink-500/30 hover:text-purple-200 disabled:opacity-50"
            >
              50% 🚀
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(75)}
              disabled={currentProgress >= 75}
              className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border-amber-400/40 text-amber-300 hover:from-amber-500/30 hover:to-orange-500/30 hover:text-amber-200 disabled:opacity-50"
            >
              75% ⚡
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleQuickProgress(100)}
              disabled={currentProgress >= 100}
              className="bg-gradient-to-r from-emerald-500/20 to-green-500/20 border-emerald-400/40 text-emerald-300 hover:from-emerald-500/30 hover:to-green-500/30 hover:text-emerald-200 disabled:opacity-50"
            >
              Complete 🏆
            </Button>
          </div>
        </div>

        {/* Enhanced Meta Info */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge className="bg-gradient-to-r from-red-500/80 to-pink-500/80 text-white border-0 font-medium">
              <Play className="h-3 w-3 mr-1" />
              Video Course
            </Badge>
            {duration && (
              <Badge className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border-0 font-medium">
                <Clock className="h-3 w-3 mr-1" />
                {duration}
              </Badge>
            )}
            {currentProgress === 100 && (
              <Badge className="bg-gradient-to-r from-emerald-500/80 to-green-500/80 text-white border-0 font-medium animate-pulse">
                <CheckCircle className="h-3 w-3 mr-1" />
                Mastered
              </Badge>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            className="text-cyan-300 hover:text-cyan-200 hover:bg-cyan-500/20 transition-colors"
          >
            <ExternalLink className="h-4 w-4 mr-1" />
            YouTube
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default YouTubeEmbed;
