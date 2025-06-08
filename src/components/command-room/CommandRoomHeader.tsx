
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Zap, Youtube, BookOpen, TrendingUp } from 'lucide-react';

const CommandRoomHeader: React.FC = () => {
  return (
    <div className="text-center mb-8">
      <div className="flex items-center justify-center gap-2 mb-4">
        <div className="p-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-blue-500/20 backdrop-blur-sm">
          <Zap className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent">
          Command Room
        </h1>
      </div>
      
      <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 max-w-2xl mx-auto">
        Create and manage your learning courses with YouTube video integration
      </p>
      
      <div className="flex items-center justify-center gap-4 text-sm">
        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0">
          <Youtube className="h-3 w-3 mr-1" />
          Video Courses
        </Badge>
        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0">
          <BookOpen className="h-3 w-3 mr-1" />
          Learning Materials
        </Badge>
        <Badge className="bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300 border-0">
          <TrendingUp className="h-3 w-3 mr-1" />
          Progress Tracking
        </Badge>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
