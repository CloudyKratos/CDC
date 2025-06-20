
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
}

interface LearningCardProps {
  item: LearningItem;
  onPlay?: (item: LearningItem) => void;
  onToggleFavorite?: (id: string) => void;
  onProgressUpdate?: (id: string, progress: number) => void;
}

const LearningCard: React.FC<LearningCardProps> = ({
  item,
  onPlay,
  onToggleFavorite,
  onProgressUpdate
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

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onPlay?.(item)}
    >
      {/* Thumbnail/Preview */}
      <div className="relative aspect-video bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
        {item.youtubeId ? (
          <img 
            src={getThumbnailUrl(item.youtubeId)}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Icons.Video className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {/* Play overlay */}
        <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-300 ${
          isHovered ? 'opacity-100' : 'opacity-0'
        }`}>
          <div className="bg-white/90 rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
            <Icons.Play className="h-8 w-8 text-gray-900" />
          </div>
        </div>

        {/* Progress bar */}
        {item.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
            <div 
              className="h-full bg-red-500 transition-all duration-300" 
              style={{ width: `${item.progress}%` }}
            />
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isPremium && (
            <Badge className="bg-yellow-500 text-yellow-900 border-0 text-xs">
              <Icons.Crown className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {item.isPrivate && (
            <Badge className="bg-red-500 text-white border-0 text-xs">
              <Icons.Lock className="h-3 w-3 mr-1" />
              Private
            </Badge>
          )}
        </div>

        {/* Favorite button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(item.id);
          }}
          className="absolute top-3 right-3 p-2 rounded-full bg-black/20 hover:bg-black/40 transition-colors duration-200"
        >
          <Icons.Heart 
            className={`h-4 w-4 ${item.isFavorited ? 'fill-red-500 text-red-500' : 'text-white'}`} 
          />
        </button>

        {/* Duration */}
        {item.duration && (
          <div className="absolute bottom-3 right-3 bg-black/80 text-white text-xs px-2 py-1 rounded">
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

        {/* Progress */}
        {item.progress > 0 && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600 dark:text-gray-400">
              <span>Progress</span>
              <span>{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-2" />
          </div>
        )}

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
            className="bg-purple-600 hover:bg-purple-700 text-white"
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
