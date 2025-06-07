
import React, { useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import Icons from '@/utils/IconUtils';
import { LearningItem } from './LearningCard';

interface VideoViewerModalProps {
  item: LearningItem | null;
  isOpen: boolean;
  onClose: () => void;
  onProgressUpdate: (id: string, progress: number) => void;
}

const VideoViewerModal: React.FC<VideoViewerModalProps> = ({
  item,
  isOpen,
  onClose,
  onProgressUpdate
}) => {
  const [currentProgress, setCurrentProgress] = useState(item?.progress || 0);

  if (!item || !item.youtubeId) return null;

  const embedUrl = `https://www.youtube.com/embed/${item.youtubeId}?autoplay=1&enablejsapi=1&origin=${window.location.origin}`;

  const handleMarkAsWatched = () => {
    setCurrentProgress(100);
    onProgressUpdate(item.id, 100);
  };

  const handleProgressChange = (progress: number) => {
    setCurrentProgress(progress);
    onProgressUpdate(item.id, progress);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0 bg-black border-0">
        <div className="flex flex-col h-[90vh]">
          {/* Video Player */}
          <div className="relative flex-1 bg-black">
            <iframe
              src={embedUrl}
              title={item.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
            
            {/* Close Button Overlay */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 text-white"
            >
              <Icons.X className="h-5 w-5" />
            </Button>
          </div>

          {/* Video Controls & Info */}
          <div className="bg-white dark:bg-gray-900 p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {item.title}
                </h2>
                <div className="flex flex-wrap gap-2 mb-3">
                  <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
                    {item.category}
                  </Badge>
                  <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                    {item.level}
                  </Badge>
                  <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300">
                    {item.format}
                  </Badge>
                  {item.duration && (
                    <Badge className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300">
                      {item.duration}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">
                    {item.description}
                  </p>
                )}
              </div>

              <div className="flex gap-2 ml-4">
                <Button
                  variant="outline"
                  onClick={() => window.open(item.youtubeUrl, '_blank')}
                  className="flex items-center gap-2"
                >
                  <Icons.ExternalLink className="h-4 w-4" />
                  YouTube
                </Button>
                <Button
                  onClick={handleMarkAsWatched}
                  className="bg-green-600 hover:bg-green-700 text-white"
                >
                  <Icons.Check className="h-4 w-4 mr-2" />
                  Mark Complete
                </Button>
              </div>
            </div>

            {/* Progress Section */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600 dark:text-gray-400">Watch Progress</span>
                <span className="text-gray-900 dark:text-white font-medium">{currentProgress}%</span>
              </div>
              <Progress value={currentProgress} className="h-3" />
              
              {/* Progress Controls */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange(25)}
                  className="text-xs"
                >
                  25%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange(50)}
                  className="text-xs"
                >
                  50%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange(75)}
                  className="text-xs"
                >
                  75%
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleProgressChange(100)}
                  className="text-xs"
                >
                  Complete
                </Button>
              </div>
            </div>

            {/* Creator Info */}
            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Created by: <span className="font-medium text-gray-900 dark:text-white">{item.coach}</span></span>
                <span>Added: {item.lastReviewed}</span>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VideoViewerModal;
