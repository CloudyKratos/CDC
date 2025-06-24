
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Youtube } from 'lucide-react';
import YouTubeEmbed from './YouTubeEmbed';

interface LearningVideo {
  id: string;
  title: string;
  description: string;
  videoId: string;
  duration: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  addedBy: string;
  addedAt: Date;
  progress?: number;
}

interface CoursesTabProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
  onProgressUpdate: (videoId: string, progress: number) => void;
}

const CoursesTab: React.FC<CoursesTabProps> = ({
  videos,
  userProgress,
  onProgressUpdate
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredVideos = videos.filter(video => {
    const matchesSearch = video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesSearch;
  });

  return (
    <div className="space-y-4">
      {/* Simple Search */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search courses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/50 border-gray-600 text-white placeholder:text-gray-400"
            />
          </div>
        </CardContent>
      </Card>

      {/* Video Grid */}
      {filteredVideos.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredVideos.map((video) => (
            <YouTubeEmbed
              key={video.id}
              videoId={video.videoId}
              title={video.title}
              description={video.description}
              duration={video.duration}
              progress={userProgress[video.id] || 0}
              onProgressUpdate={(progress) => onProgressUpdate(video.id, progress)}
              className="w-full"
            />
          ))}
        </div>
      ) : (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <Youtube className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Courses Found</h3>
            <p className="text-gray-400">
              {searchTerm ? 'Try adjusting your search.' : 'No learning content available yet.'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CoursesTab;
