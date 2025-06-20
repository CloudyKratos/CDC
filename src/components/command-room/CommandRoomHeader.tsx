
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icons from '@/utils/IconUtils';

const CommandRoomHeader: React.FC = () => {
  const handleQuickAction = (action: string) => {
    console.log(`Quick action: ${action}`);
    // These would trigger actual functionality in a real app
  };

  return (
    <div className="text-center mb-8 space-y-6">
      {/* Main Header */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 to-blue-600/20 blur-3xl rounded-full"></div>
        <div className="relative">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full shadow-lg">
              <Icons.Command className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              Command Room
            </h1>
          </div>
          
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Your personalized learning headquarters. Curate, organize, and master content from across the web.
          </p>
        </div>
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-purple-500 rounded-full w-fit mx-auto mb-3">
              <Icons.Youtube className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">
              YouTube Integration
            </h3>
            <p className="text-sm text-purple-600 dark:text-purple-400">
              Transform any YouTube video into a structured learning experience
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-blue-500 rounded-full w-fit mx-auto mb-3">
              <Icons.BookOpen className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">
              Progress Tracking
            </h3>
            <p className="text-sm text-blue-600 dark:text-blue-400">
              Monitor your learning journey with detailed progress analytics
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-4 text-center">
            <div className="p-2 bg-green-500 rounded-full w-fit mx-auto mb-3">
              <Icons.Star className="h-5 w-5 text-white" />
            </div>
            <h3 className="font-semibold text-green-700 dark:text-green-300 mb-1">
              Smart Organization
            </h3>
            <p className="text-sm text-green-600 dark:text-green-400">
              Categorize and filter content by topics, difficulty, and more
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Badge 
          variant="outline" 
          className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors cursor-pointer"
          onClick={() => handleQuickAction('trending')}
        >
          <Icons.TrendingUp className="h-4 w-4 mr-2" />
          Trending Topics
        </Badge>
        <Badge 
          variant="outline" 
          className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors cursor-pointer"
          onClick={() => handleQuickAction('recent')}
        >
          <Icons.Clock className="h-4 w-4 mr-2" />
          Recently Added
        </Badge>
        <Badge 
          variant="outline" 
          className="px-4 py-2 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors cursor-pointer"
          onClick={() => handleQuickAction('popular')}
        >
          <Icons.Users className="h-4 w-4 mr-2" />
          Popular Picks
        </Badge>
      </div>
    </div>
  );
};

export default CommandRoomHeader;
