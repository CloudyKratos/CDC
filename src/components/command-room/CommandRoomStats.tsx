
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Play, CheckCircle, Clock, TrendingUp } from 'lucide-react';

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
      label: 'Total Courses',
      color: 'text-blue-400',
    },
    {
      icon: CheckCircle,
      value: stats.completedVideos,
      label: 'Completed',
      color: 'text-green-400',
    },
    {
      icon: Clock,
      value: stats.inProgressVideos,
      label: 'In Progress',
      color: 'text-yellow-400',
    },
    {
      icon: TrendingUp,
      value: `${stats.totalProgress}%`,
      label: 'Progress',
      color: 'text-purple-400',
    }
  ];

  return (
    <div className="grid grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className="bg-gray-800/50 border-gray-700"
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-xl font-bold ${stat.color}`}>
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-400">
                    {stat.label}
                  </div>
                </div>
                <Icon className={`h-5 w-5 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommandRoomStats;
