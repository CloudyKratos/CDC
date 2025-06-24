
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
      gradient: 'from-cyan-500/15 to-blue-600/15',
      border: 'border-cyan-400/30',
      iconColor: 'text-cyan-400',
      textColor: 'text-cyan-300',
    },
    {
      icon: CheckCircle,
      value: stats.completedVideos,
      label: 'Completed',
      gradient: 'from-emerald-500/15 to-green-600/15',
      border: 'border-emerald-400/30',
      iconColor: 'text-emerald-400',
      textColor: 'text-emerald-300',
    },
    {
      icon: Clock,
      value: stats.inProgressVideos,
      label: 'In Progress',
      gradient: 'from-amber-500/15 to-orange-600/15',
      border: 'border-amber-400/30',
      iconColor: 'text-amber-400',
      textColor: 'text-amber-300',
    },
    {
      icon: TrendingUp,
      value: `${stats.totalProgress}%`,
      label: 'Overall Progress',
      gradient: 'from-purple-500/15 to-pink-600/15',
      border: 'border-purple-400/30',
      iconColor: 'text-purple-400',
      textColor: 'text-purple-300',
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-sm border ${stat.border} shadow-lg`}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${stat.textColor}`}>
                    {stat.value}
                  </div>
                  <div className={`text-xs ${stat.textColor}/80 font-medium`}>
                    {stat.label}
                  </div>
                </div>
                <Icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommandRoomStats;
