
import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
  const embedUrl = `https://www.youtube.com/embed/${videoId}?enablejsapi=1&origin=${window.location.origin}`;

  const handleProgressUpdate = (newProgress: number) => {
    if (onProgressUpdate) {
      onProgressUpdate(newProgress);
    }
  };

  return (
    <Card className={`overflow-hidden bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30 ${className}`}>
      {/* Video Player */}
      <div className="relative aspect-video bg-black">
        <iframe
          src={embedUrl}
          title={title}
          className="w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>

      {/* Video Info */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2">
            {title}
          </h3>
          {description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2 line-clamp-3">
              {description}
            </p>
          )}
        </div>

        {/* Progress Section */}
        {progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Watch Progress</span>
              <span className="text-gray-900 dark:text-white font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        )}

        {/* Meta Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-0 text-xs">
              <Icons.Video className="h-3 w-3 mr-1" />
              Video
            </Badge>
            {duration && (
              <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-xs">
                {duration}
              </Badge>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => window.open(`https://youtube.com/watch?v=${videoId}`, '_blank')}
            className="text-xs"
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
