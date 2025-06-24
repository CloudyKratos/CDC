
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Star, Clock, CheckCircle } from 'lucide-react';

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

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'from-green-500/80 to-emerald-500/80';
      case 'intermediate': return 'from-yellow-500/80 to-orange-500/80';
      case 'advanced': return 'from-red-500/80 to-pink-500/80';
      default: return 'from-gray-500/80 to-gray-600/80';
    }
  };

  const ProgressCard: React.FC<{ video: LearningVideo & { progress: number } }> = ({ video }) => (
    <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
      <CardContent className="p-4 lg:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="text-white font-semibold text-base mb-2 line-clamp-2">{video.title}</h3>
            <p className="text-blue-100/80 text-sm line-clamp-2 mb-3">{video.description}</p>
            <div className="flex items-center gap-2 mb-3">
              <Badge className={`bg-gradient-to-r ${getDifficultyColor(video.difficulty)} text-white border-0 text-xs`}>
                {video.difficulty}
              </Badge>
              <Badge className="bg-gradient-to-r from-blue-500/80 to-cyan-500/80 text-white border-0 text-xs">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {video.progress === 100 && <Star className="h-4 w-4 text-yellow-400" />}
            <span className="text-white font-bold text-base">{video.progress}%</span>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-cyan-200 font-medium text-sm">Progress</span>
            {video.progress === 100 && (
              <CheckCircle className="h-4 w-4 text-green-400" />
            )}
          </div>
          <Progress value={video.progress} className="h-2 bg-gray-700/50" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-8">
      {/* Completed Courses */}
      {completedVideos.length > 0 && (
        <Card className="bg-gradient-to-br from-green-500/10 to-emerald-600/10 backdrop-blur-xl border border-green-300/30 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl flex items-center gap-3">
              <Trophy className="h-6 w-6 text-green-400" />
              Mastered Courses ({completedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {completedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Courses */}
      {inProgressVideos.length > 0 && (
        <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-600/10 backdrop-blur-xl border border-yellow-300/30 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl flex items-center gap-3">
              <Clock className="h-6 w-6 text-yellow-400" />
              Active Learning ({inProgressVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {inProgressVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Started Courses */}
      {notStartedVideos.length > 0 && (
        <Card className="bg-gradient-to-br from-gray-500/10 to-gray-600/10 backdrop-blur-xl border border-gray-300/30 rounded-2xl overflow-hidden">
          <CardHeader className="pb-4">
            <CardTitle className="text-white text-xl flex items-center gap-3">
              <Star className="h-6 w-6 text-gray-400" />
              Ready to Start ({notStartedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 lg:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {notStartedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <Card className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-xl border border-gray-600/30 rounded-2xl overflow-hidden">
          <CardContent className="p-12 text-center">
            <Trophy className="h-20 w-20 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-bold text-white mb-4">No Progress to Track Yet</h3>
            <p className="text-gray-300 text-lg leading-relaxed max-w-md mx-auto">
              Start your learning journey by exploring the available courses!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTab;
