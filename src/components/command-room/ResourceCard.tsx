
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  BookOpen, 
  Bookmark, 
  Upload, 
  Play, 
  Clock, 
  User, 
  ExternalLink,
  Star,
  Download,
  Eye
} from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string;
  type: 'video' | 'article' | 'course' | 'tool';
  author: string;
  tags: string[];
  duration: string;
  views: number;
  rating: number;
  url: string;
}

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard: React.FC<ResourceCardProps> = ({ resource }) => {
  return (
    <Card className="group hover:shadow-lg transition-all duration-200 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm border-slate-200 dark:border-slate-700">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${resource.type === 'video' ? 'bg-red-100 dark:bg-red-900/20 text-red-600' : 
              resource.type === 'article' ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-600' :
              resource.type === 'course' ? 'bg-green-100 dark:bg-green-900/20 text-green-600' :
              'bg-purple-100 dark:bg-purple-900/20 text-purple-600'}`}>
              {resource.type === 'video' ? <Play className="w-4 h-4" /> :
               resource.type === 'article' ? <BookOpen className="w-4 h-4" /> :
               resource.type === 'course' ? <BookOpen className="w-4 h-4" /> :
               <Upload className="w-4 h-4" />}
            </div>
            <div>
              <CardTitle className="text-base leading-tight text-slate-900 dark:text-white">
                {resource.title}
              </CardTitle>
              <p className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-1">
                <User className="w-3 h-3" />
                {resource.author}
              </p>
            </div>
          </div>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 transition-opacity">
            <Bookmark className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-slate-700 dark:text-slate-300 line-clamp-2">
          {resource.description}
        </p>
        
        <div className="flex flex-wrap gap-1">
          {resource.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {tag}
            </Badge>
          ))}
        </div>

        <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {resource.duration}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {resource.views} views
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
            <span>{resource.rating}</span>
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <Button size="sm" className="flex-1">
            <Play className="w-3 h-3 mr-1" />
            {resource.type === 'video' ? 'Watch' : 'Read'}
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-3 h-3" />
          </Button>
          <Button variant="outline" size="sm">
            <ExternalLink className="w-3 h-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourceCard;
