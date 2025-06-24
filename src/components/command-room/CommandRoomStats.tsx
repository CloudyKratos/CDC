
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, CheckCircle, Clock, TrendingUp, Target, Award } from 'lucide-react';

interface StatsProps {
  stats: {
    totalVideos: number;
    completedVideos: number;
    totalProgress: number;
    inProgressVideos: number;
  };
}

const CommandRoomStats: React.FC<StatsProps> = ({ stats }) => {
  const statCards = [
    {
      icon: Play,
      value: stats.totalVideos,
      label: 'Total Resources',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: '+12%'
    },
    {
      icon: CheckCircle,
      value: stats.completedVideos,
      label: 'Completed',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: '+8%'
    },
    {
      icon: Clock,
      value: stats.inProgressVideos,
      label: 'In Progress',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: '+3%'
    },
    {
      icon: TrendingUp,
      value: `${stats.totalProgress}%`,
      label: 'Overall Progress',
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      trend: '+15%'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-white border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </div>
                <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded">
                  {stat.trend}
                </span>
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-gray-600">
                  {stat.label}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommandRoomStats;
