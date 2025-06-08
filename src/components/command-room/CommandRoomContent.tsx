
import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Youtube, Search, Filter, BookOpen, Upload } from 'lucide-react';
import AddYouTubeModal from './AddYouTubeModal';
import YouTubeEmbed from './YouTubeEmbed';

interface VideoData {
  id: string;
  title: string;
  description: string;
  youtubeUrl: string;
  category: string;
  level: string;
  coach: string;
  duration: string;
}

const CommandRoomContent: React.FC = () => {
  const [videos, setVideos] = useState<VideoData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');

  const handleAddVideo = (video: VideoData) => {
    setVideos(prev => [...prev, video]);
  };

  const extractVideoId = (url: string): string | null => {
    const patterns = [
      /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
      /youtube\.com\/watch\?.*v=([^&\n?#]+)/
    ];
    
    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }
    return null;
  };

  const filteredVideos = videos.filter(video => {
    const searchMatch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       video.coach.toLowerCase().includes(searchTerm.toLowerCase());
    const categoryMatch = selectedCategory === 'all' || video.category === selectedCategory;
    const levelMatch = selectedLevel === 'all' || video.level === selectedLevel;
    
    return searchMatch && categoryMatch && levelMatch;
  });

  return (
    <>
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between mb-6">
        <div className="flex flex-1 gap-4 items-center">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="mindset">Mindset</SelectItem>
              <SelectItem value="productivity">Productivity</SelectItem>
              <SelectItem value="wellness">Wellness</SelectItem>
              <SelectItem value="strategy">Strategy</SelectItem>
              <SelectItem value="rituals">Rituals</SelectItem>
              <SelectItem value="wisdom">Wisdom</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="beginner">Beginner</SelectItem>
              <SelectItem value="intermediate">Intermediate</SelectItem>
              <SelectItem value="advanced">Advanced</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <AddYouTubeModal onAdd={handleAddVideo} />
      </div>

      <TabsContent value="resources" className="space-y-6">
        {videos.length === 0 ? (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-12 text-center">
              <Youtube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No Videos Added Yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
                Start building your course by adding YouTube videos. Create comprehensive learning experiences with embedded videos.
              </p>
              <AddYouTubeModal onAdd={handleAddVideo} />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filteredVideos.map((video) => {
              const videoId = extractVideoId(video.youtubeUrl);
              return (
                <div key={video.id}>
                  {videoId && (
                    <YouTubeEmbed
                      videoId={videoId}
                      title={video.title}
                      description={video.description}
                      duration={video.duration}
                    />
                  )}
                  <Card className="mt-4 bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
                    <CardContent className="p-4">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <Badge className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-0 text-xs">
                          {video.category}
                        </Badge>
                        <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-0 text-xs">
                          {video.level}
                        </Badge>
                      </div>
                      
                      {video.coach && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          <strong>Coach:</strong> {video.coach}
                        </p>
                      )}
                      
                      {video.duration && (
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          <strong>Duration:</strong> {video.duration}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })}
          </div>
        )}

        {videos.length > 0 && filteredVideos.length === 0 && (
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
            <CardContent className="p-8 text-center">
              <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                No Videos Found
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your search terms or filters to find videos.
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>

      <TabsContent value="bookmarks" className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No Bookmarks Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Bookmark your favorite videos to access them quickly later.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="progress" className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
          <CardContent className="p-12 text-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 dark:bg-gray-700 mx-auto mb-4 flex items-center justify-center">
              <div className="h-8 w-8 rounded-full bg-gray-300 dark:bg-gray-600"></div>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Track Your Progress
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Your learning progress and achievements will appear here.
            </p>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="upload" className="space-y-6">
        <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-purple-200/30 dark:border-purple-800/30">
          <CardHeader>
            <CardTitle className="text-gray-900 dark:text-white flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Upload Content
            </CardTitle>
          </CardHeader>
          <CardContent className="p-12 text-center">
            <Upload className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Upload Learning Materials
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Upload documents, PDFs, or other learning materials to complement your video courses.
            </p>
            <Button variant="outline" disabled>
              Coming Soon
            </Button>
          </CardContent>
        </Card>
      </TabsContent>
    </>
  );
};

export default CommandRoomContent;
