
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Icons from '@/utils/IconUtils';

export interface LearningItem {
  id: string;
  title: string;
  type: 'video' | 'article' | 'course' | 'replay';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coach: string;
  format: string;
  lastReviewed: string;
  progress: number;
  isPrivate: boolean;
  isPremium: boolean;
  isFavorited: boolean;
  description?: string;
  duration?: string;
  youtubeId?: string;
  youtubeUrl?: string;
  thumbnail?: string;
}

interface LearningCardProps {
  item: LearningItem;
  onPlay?: (item: LearningItem) => void;
  onToggleFavorite?: (id: string) => void;
  onProgressUpdate?: (id: string, progress: number) => void;
  onDelete?: (id: string) => void;
}

const LearningCard: React.FC<LearningCardProps> = ({
  item,
  onPlay,
  onToggleFavorite,
  onProgressUpdate,
  onDelete
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'mindset': return 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300';
      case 'productivity': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300';
      case 'wellness': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'strategy': return 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300';
      case 'rituals': return 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  const getThumbnailUrl = (youtubeId: string) => {
    return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
  };

  const handleProgressClick = (percentage: number) => {
    onProgressUpdate?.(item.id, percentage);
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-xl hover:-translate-y-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-purple-200/40 dark:border-purple-800/40 hover:border-purple-300/60 dark:hover:border-purple-700/60"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay?.(item)}
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-t-lg overflow-hidden">
        {item.youtubeId ? (
          <img 
            src={getThumbnailUrl(item.youtubeId)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icons.Video className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-all duration-300 ${
          isHovered ? 'opacity-100 backdrop-blur-sm' : 'opacity-0'
        }`}>
          <div className="bg-white/95 dark:bg-gray-800/95 rounded-full p-4 transform scale-75 group-hover:scale-100 transition-all duration-300 shadow-lg">
            <Icons.Play className="h-8 w-8 text-gray-900 dark:text-white" />
          </div>
        </div>

        {/* Progress bar */}
        {item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-2 bg-black/30">
            <div 
              className="h-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-300 shadow-sm" 
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isPremium && (
            <Badge className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-yellow-900 border-0 text-xs shadow-sm">
              <Icons.Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {item.isPrivate && (
            <Badge className="bg-gradient-to-r from-red-500 to-red-600 text-white border-0 text-xs shadow-sm">
              <Icons.Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>

        {/* Action buttons */}
        <div className="absolute top-3 right-3 flex gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite?.(item.id);
            }}
            className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-200 backdrop-blur-sm"
          >
            <Icons.Heart 
              className={`h-4 w-4 transition-colors duration-200 ${
                item.isFavorited ? 'fill-red-500 text-red-500' : 'text-white hover:text-red-400'
              }`} 
            />
          </button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                onClick={(e) => e.stopPropagation()}
                className="p-2 rounded-full bg-black/30 hover:bg-black/50 transition-all duration-200 backdrop-blur-sm"
              >
                <Icons.MoreVertical className="h-4 w-4 text-white" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  if (item.youtubeUrl) window.open(item.youtubeUrl, '_blank');
                }}
                className="flex items-center gap-2"
              >
                <Icons.ExternalLink className="h-4 w-4" />
                Open in YouTube
              </DropdownMenuItem>
              <DropdownMenuItem 
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete?.(item.id);
                }}
                className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Icons.Trash2 className="h-4 w-4" />
                Remove Video
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Duration */}
        {item.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded shadow-sm backdrop-blur-sm">
            {item.duration}
          </div>
        )}
      </div>

      {/* Content */}
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white line-clamp-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors duration-200">
            {item.title}
          </h3>
          {item.description && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`text-xs ${getCategoryColor(item.category)} border-0`}>
            {item.category}
          </Badge>
          <Badge className={`text-xs ${getLevelColor(item.level)} border-0`}>
            {item.level}
          </Badge>
          <Badge className="bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300 border-0 text-xs">
            {item.format}
          </Badge>
        </div>

        {/* Progress Section */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
            <span>Progress</span>
            <span>{item.progress}%</span>
          </div>
          <Progress value={item.progress} className="h-2" />
          
          {/* Quick Progress Actions */}
          <div className="flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {[25, 50, 75, 100].map((percentage) => (
              <button
                key={percentage}
                onClick={(e) => {
                  e.stopPropagation();
                  handleProgressClick(percentage);
                }}
                className="px-2 py-1 text-xs rounded bg-gray-100 dark:bg-gray-700 hover:bg-purple-100 dark:hover:bg-purple-900/30 transition-colors duration-200"
              >
                {percentage}%
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            <span>by {item.coach}</span>
            {item.lastReviewed && (
              <span className="ml-2">• {item.lastReviewed}</span>
            )}
          </div>
          
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPlay?.(item);
            }}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white shadow-sm"
          >
            <Icons.Play className="h-3 w-3 mr-1" />
            Watch
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default LearningCard;
