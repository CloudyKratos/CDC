
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Youtube, Clock, Star } from 'lucide-react';
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
  searchTerm: string;
  selectedCategory: string;
  viewMode: 'grid' | 'list';
}

const CoursesTab: React.FC<CoursesTabProps> = ({
  videos,
  userProgress,
  onProgressUpdate,
  searchTerm,
  selectedCategory,
  viewMode
}) => {
  const filteredVideos = videos.filter(video => {
    const matchesSearch = searchTerm === '' || 
      video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === 'all' || video.category === selectedCategory;
    
    return matchesSearch && matchesCategory;
  });

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-700 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  if (filteredVideos.length === 0) {
    return (
      <Card className="bg-gray-50 border border-gray-200">
        <CardContent className="p-12 text-center">
          <Youtube className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-700 mb-2">No Content Found</h3>
          <p className="text-gray-500">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Try adjusting your search or filters.' 
              : 'No learning content available yet in the vault.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  if (viewMode === 'list') {
    return (
      <div className="space-y-4">
        {filteredVideos.map((video) => (
          <Card key={video.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-6">
                <div className="w-48 h-28 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Youtube className="h-8 w-8 text-gray-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1">{video.title}</h3>
                    <Badge className={getDifficultyColor(video.difficulty)}>
                      {video.difficulty}
                    </Badge>
                  </div>
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{video.description}</p>
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {video.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="h-4 w-4" />
                      {video.category}
                    </div>
                    <div>Progress: {userProgress[video.id] || 0}%</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {filteredVideos.map((video) => (
        <YouTubeEmbed
          key={video.id}
          videoId={video.videoId}
          title={video.title}
          description={video.description}
          duration={video.duration}
          difficulty={video.difficulty}
          category={video.category}
          progress={userProgress[video.id] || 0}
          onProgressUpdate={(progress) => onProgressUpdate(video.id, progress)}
          className="w-full"
        />
      ))}
    </div>
  );
};

export default CoursesTab;
