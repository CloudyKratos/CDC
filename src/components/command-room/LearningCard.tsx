
import React from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import Icons from '@/utils/IconUtils';

export interface LearningItem {
  id: string;
  title: string;
  type: 'course' | 'vault' | 'replay' | 'template';
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  coach: string;
  format: 'video' | 'pdf' | 'checklist' | 'template' | 'link';
  lastReviewed: string;
  progress?: number;
  isPrivate: boolean;
  isPremium: boolean;
  isFavorited: boolean;
  thumbnail?: string;
  description: string;
  modules?: number;
  duration?: string;
}

interface LearningCardProps {
  item: LearningItem;
  onFavorite: (id: string) => void;
  onClick: (item: LearningItem) => void;
}

const LearningCard: React.FC<LearningCardProps> = ({ item, onFavorite, onClick }) => {
  const getTypeIcon = () => {
    switch (item.type) {
      case 'course': return <Icons.BookOpen className="h-5 w-5 text-purple-500" />;
      case 'vault': return <Icons.FileText className="h-5 w-5 text-amber-500" />;
      case 'replay': return <Icons.Video className="h-5 w-5 text-blue-500" />;
      case 'template': return <Icons.LayoutDashboard className="h-5 w-5 text-green-500" />;
      default: return <Icons.FileText className="h-5 w-5" />;
    }
  };

  const getFormatIcon = () => {
    switch (item.format) {
      case 'video': return <Icons.Video className="h-4 w-4" />;
      case 'pdf': return <Icons.FileText className="h-4 w-4" />;
      case 'checklist': return <Icons.CheckSquare className="h-4 w-4" />;
      default: return <Icons.FileText className="h-4 w-4" />;
    }
  };

  const getLevelColor = () => {
    switch (item.level) {
      case 'beginner': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'advanced': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card 
      className="group cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-xl bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30 overflow-hidden"
      onClick={() => onClick(item)}
    >
      {/* Thumbnail or Icon Header */}
      <div className="relative h-48 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 flex items-center justify-center">
        {item.thumbnail ? (
          <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center backdrop-blur-sm">
            {getTypeIcon()}
          </div>
        )}
        
        {/* Status Badges */}
        <div className="absolute top-3 left-3 flex gap-2">
          {item.isPremium && (
            <Badge className="bg-amber-500/90 text-white text-xs">Premium</Badge>
          )}
          {item.isPrivate && (
            <Badge className="bg-gray-500/90 text-white text-xs">Private</Badge>
          )}
        </div>

        {/* Favorite Button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm opacity-70 hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onFavorite(item.id);
          }}
        >
          <Icons.Star 
            className={`h-4 w-4 ${item.isFavorited ? 'text-yellow-500 fill-yellow-500' : 'text-gray-500'}`} 
          />
        </Button>
      </div>

      {/* Content */}
      <div className="p-6 space-y-4">
        <div>
          <h3 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors line-clamp-2">
            {item.title}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
            {item.description}
          </p>
        </div>

        {/* Progress Bar for Courses */}
        {item.type === 'course' && item.progress !== undefined && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="text-gray-900 dark:text-white font-medium">{item.progress}%</span>
            </div>
            <Progress value={item.progress} className="h-2" />
          </div>
        )}

        {/* Tags */}
        <div className="flex flex-wrap gap-2">
          <Badge className={`${getLevelColor()} border-0 text-xs`}>
            {item.level}
          </Badge>
          <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-xs">
            {item.category}
          </Badge>
        </div>

        {/* Meta Info */}
        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-2">
            {getFormatIcon()}
            <span>{item.format}</span>
            {item.modules && <span>• {item.modules} modules</span>}
            {item.duration && <span>• {item.duration}</span>}
          </div>
          <span>by {item.coach}</span>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400">
          Last reviewed: {item.lastReviewed}
        </div>
      </div>
    </Card>
  );
};

export default LearningCard;
