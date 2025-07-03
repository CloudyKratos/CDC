
import React from 'react';
import { Megaphone, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface AnnouncementMessageProps {
  title: string;
  content: string;
  author: {
    name: string;
    avatar?: string;
  };
  createdAt: string;
  isPinned?: boolean;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  className?: string;
}

export const AnnouncementMessage: React.FC<AnnouncementMessageProps> = ({
  title,
  content,
  author,
  createdAt,
  isPinned = false,
  priority = 'medium',
  className = ''
}) => {
  const getPriorityColor = () => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700';
      case 'high': return 'bg-orange-100 dark:bg-orange-900/20 border-orange-300 dark:border-orange-700';
      case 'medium': return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
      case 'low': return 'bg-gray-100 dark:bg-gray-900/20 border-gray-300 dark:border-gray-700';
      default: return 'bg-blue-100 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700';
    }
  };

  const getPriorityIcon = () => {
    switch (priority) {
      case 'urgent': return '🚨';
      case 'high': return '⚠️';
      case 'medium': return '📢';
      case 'low': return 'ℹ️';
      default: return '📢';
    }
  };

  return (
    <div className={`rounded-lg border-l-4 p-4 ${getPriorityColor()} ${className}`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-white dark:bg-gray-800 rounded-full flex items-center justify-center">
            <Megaphone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
              {getPriorityIcon()} {title}
            </h3>
            {isPinned && (
              <Pin className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            )}
            <Badge variant="secondary" className="text-xs">
              Announcement
            </Badge>
          </div>
          
          <div className="prose prose-sm dark:prose-invert max-w-none mb-3">
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {content}
            </p>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              {author.avatar && (
                <img 
                  src={author.avatar} 
                  alt={author.name}
                  className="w-4 h-4 rounded-full"
                />
              )}
              <span>By {author.name}</span>
            </div>
            <span>{new Date(createdAt).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
