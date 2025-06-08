
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Video, 
  BookOpen, 
  FileText, 
  Calendar,
  Clock,
  User,
  Star,
  Download,
  ExternalLink,
  Bookmark,
  Share2
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'document' | 'course' | 'webinar' | 'article';
  description: string;
  author: string;
  duration?: string;
  rating: number;
  tags: string[];
  url: string;
  thumbnail?: string;
  isBookmarked: boolean;
  downloadCount: number;
  createdAt: string;
}

interface CommandRoomResourceCardProps {
  resource: Resource;
  onToggleBookmark: (id: string) => void;
}

const CommandRoomResourceCard: React.FC<CommandRoomResourceCardProps> = ({
  resource,
  onToggleBookmark
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="w-4 h-4" />;
      case 'course': return <BookOpen className="w-4 h-4" />;
      case 'document': return <FileText className="w-4 h-4" />;
      case 'webinar': return <Calendar className="w-4 h-4" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'video': return 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800';
      case 'course': return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800';
      case 'document': return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800';
      case 'webinar': return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800';
      default: return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-900/20 dark:text-gray-300 dark:border-gray-800';
    }
  };

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 hover:shadow-xl transition-all duration-300 hover:scale-105 h-full group">
      {resource.thumbnail && (
        <div className="aspect-video w-full overflow-hidden rounded-t-lg">
          <img 
            src={resource.thumbnail} 
            alt={resource.title}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
          />
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge className={`${getTypeColor(resource.type)} flex items-center gap-1 border`}>
            {getTypeIcon(resource.type)}
            {resource.type}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(resource.id)}
            className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current text-blue-600' : ''}`} />
          </Button>
        </div>
        <CardTitle className="text-slate-900 dark:text-white text-lg leading-tight line-clamp-2">
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-slate-600 dark:text-slate-400 text-sm line-clamp-3 leading-relaxed">
          {resource.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            <span className="truncate">{resource.author}</span>
          </div>
          {resource.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{resource.duration}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">{resource.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-sm">
            <Download className="w-3 h-3" />
            <span>{resource.downloadCount.toLocaleString()}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-slate-500 dark:text-slate-500 border-slate-200 dark:border-slate-700">
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </Button>
          <Button size="sm" variant="outline" className="border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800">
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomResourceCard;
