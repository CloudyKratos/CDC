
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, CheckCircle } from 'lucide-react';

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

interface ProgressTabProps {
  videos: LearningVideo[];
  userProgress: Record<string, number>;
}

const ProgressTab: React.FC<ProgressTabProps> = ({ videos, userProgress }) => {
  const videosWithProgress = videos.map(video => ({
    ...video,
    progress: userProgress[video.id] || 0
  })).sort((a, b) => b.progress - a.progress);

  const completedVideos = videosWithProgress.filter(v => v.progress === 100);
  const inProgressVideos = videosWithProgress.filter(v => v.progress > 0 && v.progress < 100);
  const notStartedVideos = videosWithProgress.filter(v => v.progress === 0);

  const ProgressCard: React.FC<{ video: LearningVideo & { progress: number } }> = ({ video }) => (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1">
            <h3 className="text-white font-medium text-sm mb-1 line-clamp-2">{video.title}</h3>
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                {video.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs border-gray-600 text-gray-300">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-1 ml-2">
            {video.progress === 100 && <CheckCircle className="h-4 w-4 text-green-400" />}
            <span className="text-white font-semibold text-sm">{video.progress}%</span>
          </div>
        </div>
        <Progress value={video.progress} className="h-2 bg-gray-700" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Completed Courses */}
      {completedVideos.length > 0 && (
        <Card className="bg-green-900/20 border-green-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Trophy className="h-5 w-5 text-green-400" />
              Completed ({completedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {completedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Courses */}
      {inProgressVideos.length > 0 && (
        <Card className="bg-yellow-900/20 border-yellow-800/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-400" />
              In Progress ({inProgressVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {inProgressVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Started Courses */}
      {notStartedVideos.length > 0 && (
        <Card className="bg-gray-800/30 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-white text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-400" />
              Not Started ({notStartedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
              {notStartedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-8 text-center">
            <Trophy className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Progress to Track</h3>
            <p className="text-gray-400">
              Start learning to see your progress here!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTab;
