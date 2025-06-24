
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
      label: 'Epic Courses Available',
      description: 'Ready for mastery',
      gradient: 'from-cyan-500/10 via-cyan-600/10 to-blue-700/10',
      border: 'border-cyan-300/30',
      iconBg: 'bg-cyan-400/20',
      iconColor: 'text-cyan-300',
      textColor: 'text-cyan-300',
      descColor: 'text-cyan-200/80'
    },
    {
      icon: CheckCircle,
      value: stats.completedVideos,
      label: 'Courses Conquered',
      description: 'Victory achieved!',
      gradient: 'from-emerald-500/10 via-emerald-600/10 to-green-700/10',
      border: 'border-emerald-300/30',
      iconBg: 'bg-emerald-400/20',
      iconColor: 'text-emerald-300',
      textColor: 'text-emerald-300',
      descColor: 'text-emerald-200/80'
    },
    {
      icon: Clock,
      value: stats.inProgressVideos,
      label: 'Active Learning',
      description: 'In progress now',
      gradient: 'from-amber-500/10 via-amber-600/10 to-orange-700/10',
      border: 'border-amber-300/30',
      iconBg: 'bg-amber-400/20',
      iconColor: 'text-amber-300',
      textColor: 'text-amber-300',
      descColor: 'text-amber-200/80'
    },
    {
      icon: TrendingUp,
      value: `${stats.totalProgress}%`,
      label: 'Mastery Level',
      description: 'Total progress',
      gradient: 'from-purple-500/10 via-purple-600/10 to-pink-700/10',
      border: 'border-purple-300/30',
      iconBg: 'bg-purple-400/20',
      iconColor: 'text-purple-300',
      textColor: 'text-purple-300',
      descColor: 'text-purple-200/80'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className={`bg-gradient-to-br ${stat.gradient} backdrop-blur-xl border ${stat.border} text-white shadow-xl overflow-hidden relative`}
          >
            <CardContent className="p-4 lg:p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <div className={`p-3 ${stat.iconBg} rounded-xl`}>
                  <Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${stat.iconColor}`} />
                </div>
                <span className={`text-2xl lg:text-3xl font-bold ${stat.textColor}`}>
                  {stat.value}
                </span>
              </div>
              <p className={`${stat.textColor} font-semibold text-sm lg:text-base mb-1`}>
                {stat.label}
              </p>
              <div className={`text-xs ${stat.descColor}`}>{stat.description}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommandRoomStats;
