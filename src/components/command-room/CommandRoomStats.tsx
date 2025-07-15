
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BookOpen, TrendingUp, Award, Target } from 'lucide-react';
import { LearningStats } from '@/types/learning';

interface CommandRoomStatsProps {
  stats: LearningStats;
}

const CommandRoomStats: React.FC<CommandRoomStatsProps> = ({ stats }) => {
  const statCards = [
    {
      title: 'Total Courses',
      value: stats.totalVideos,
      icon: BookOpen,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: 'Completed',
      value: stats.completedVideos,
      icon: Award,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: 'In Progress',
      value: stats.inProgressVideos,
      icon: TrendingUp,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: 'Overall Progress',
      value: `${stats.totalProgress}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {statCards.map((stat, index) => (
        <Card key={index} className="bg-white border border-gray-200 hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default CommandRoomStats;
