
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, Clock, CheckCircle, Target, Award } from 'lucide-react';

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

  const overallProgress = videos.length > 0 
    ? Math.round(Object.values(userProgress).reduce((sum, p) => sum + p, 0) / videos.length)
    : 0;

  const ProgressCard: React.FC<{ video: LearningVideo & { progress: number } }> = ({ video }) => (
    <Card className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-gray-900 font-medium text-sm mb-2 line-clamp-2">{video.title}</h3>
            <div className="flex items-center gap-2 mb-3">
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 bg-gray-50">
                {video.difficulty}
              </Badge>
              <Badge variant="outline" className="text-xs border-gray-300 text-gray-600 bg-gray-50">
                <Clock className="h-3 w-3 mr-1" />
                {video.duration}
              </Badge>
            </div>
          </div>
          <div className="flex items-center gap-2 ml-3">
            {video.progress === 100 && <CheckCircle className="h-4 w-4 text-green-500" />}
            <span className="text-gray-900 font-semibold text-sm">{video.progress}%</span>
          </div>
        </div>
        <Progress value={video.progress} className="h-2 bg-gray-100" />
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-blue-900 mb-1">Learning Progress Overview</h3>
              <p className="text-blue-700 text-sm">Track your knowledge vault journey</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-900 mb-1">{overallProgress}%</div>
              <div className="text-blue-600 text-sm">Overall Progress</div>
            </div>
          </div>
          <div className="mt-4">
            <Progress value={overallProgress} className="h-3 bg-blue-100" />
          </div>
        </CardContent>
      </Card>

      {/* Completed Courses */}
      {completedVideos.length > 0 && (
        <Card className="bg-green-50 border border-green-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-green-800 text-lg flex items-center gap-2">
              <Award className="h-5 w-5 text-green-600" />
              Mastered Content ({completedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {completedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* In Progress Courses */}
      {inProgressVideos.length > 0 && (
        <Card className="bg-orange-50 border border-orange-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-orange-800 text-lg flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Currently Learning ({inProgressVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {inProgressVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Not Started Courses */}
      {notStartedVideos.length > 0 && (
        <Card className="bg-gray-50 border border-gray-200">
          <CardHeader className="pb-4">
            <CardTitle className="text-gray-700 text-lg flex items-center gap-2">
              <Clock className="h-5 w-5 text-gray-500" />
              Ready to Explore ({notStartedVideos.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {notStartedVideos.map(video => (
                <ProgressCard key={video.id} video={video} />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {videos.length === 0 && (
        <Card className="bg-white border border-gray-200">
          <CardContent className="p-12 text-center">
            <Trophy className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">No Progress to Track</h3>
            <p className="text-gray-500">
              Start exploring the vault to see your learning progress here!
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ProgressTab;
