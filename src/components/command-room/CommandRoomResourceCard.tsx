
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
      case 'video': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'course': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'document': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'webinar': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 hover:bg-white/15 transition-all duration-200 h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <Badge className={`${getTypeColor(resource.type)} flex items-center gap-1`}>
            {getTypeIcon(resource.type)}
            {resource.type}
          </Badge>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleBookmark(resource.id)}
            className="text-white hover:bg-white/20"
          >
            <Bookmark className={`w-4 h-4 ${resource.isBookmarked ? 'fill-current' : ''}`} />
          </Button>
        </div>
        <CardTitle className="text-white text-lg leading-tight">
          {resource.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-white/80 text-sm line-clamp-3">
          {resource.description}
        </p>
        
        <div className="flex items-center gap-4 text-sm text-white/70">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {resource.author}
          </div>
          {resource.duration && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {resource.duration}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-white/80 text-sm">{resource.rating}</span>
          </div>
          <div className="flex items-center gap-1 text-white/60 text-sm">
            <Download className="w-3 h-3" />
            {resource.downloadCount.toLocaleString()}
          </div>
        </div>

        <div className="flex flex-wrap gap-1">
          {resource.tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="outline" className="text-xs text-white/70 border-white/30">
              {tag}
            </Badge>
          ))}
          {resource.tags.length > 3 && (
            <Badge variant="outline" className="text-xs text-white/70 border-white/30">
              +{resource.tags.length - 3}
            </Badge>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1 bg-blue-600 hover:bg-blue-700">
            <ExternalLink className="w-3 h-3 mr-1" />
            Open
          </Button>
          <Button size="sm" variant="outline" className="text-white border-white/30 hover:bg-white/20">
            <Share2 className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomResourceCard;
