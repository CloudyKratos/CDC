
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, Clock, Users } from 'lucide-react';

interface VideoLibraryProps {
  isAdmin?: boolean;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({ isAdmin }) => {
  // Sample data - in real app this would come from your backend
  const videos = [
    {
      id: 1,
      title: "Getting Started with the Platform",
      description: "Learn the basics of navigating and using our platform effectively.",
      duration: "5:30",
      views: 142,
      thumbnail: "/placeholder.svg"
    },
    {
      id: 2,
      title: "Advanced Features Overview",
      description: "Discover advanced features that will boost your productivity.",
      duration: "8:45",
      views: 89,
      thumbnail: "/placeholder.svg"
    },
    {
      id: 3,
      title: "Best Practices Guide",
      description: "Learn from experts about the best practices and tips.",
      duration: "12:20",
      views: 67,
      thumbnail: "/placeholder.svg"
    }
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-6">
        {/* Featured Video */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20 rounded-xl p-6 border border-blue-100 dark:border-blue-800/30">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="lg:w-1/2">
              <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg flex items-center justify-center">
                <Play className="h-12 w-12 text-gray-400" />
              </div>
            </div>
            <div className="lg:w-1/2 flex flex-col justify-center">
              <h3 className="text-2xl font-bold mb-2">Welcome to Value from the Vault</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Get started with our comprehensive introduction video that covers everything you need to know.
              </p>
              <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400 mb-4">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  15:30
                </div>
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  1.2k views
                </div>
              </div>
              <Button className="w-fit">
                <Play className="h-4 w-4 mr-2" />
                Watch Now
              </Button>
            </div>
          </div>
        </div>

        {/* Video Grid */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Video Library</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Card key={video.id} className="hover:shadow-md transition-shadow cursor-pointer">
                <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-t-lg flex items-center justify-center">
                  <Play className="h-8 w-8 text-gray-400" />
                </div>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg line-clamp-2">{video.title}</CardTitle>
                  <CardDescription className="line-clamp-2">
                    {video.description}
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {video.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {video.views} views
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Empty State for No Videos */}
        {videos.length === 0 && (
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <Play className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No videos available yet.</p>
              {isAdmin && (
                <p className="text-sm mt-2">Use the "Add Content" button to upload your first video.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
