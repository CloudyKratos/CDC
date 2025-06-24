
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
      iconBg: 'bg-cyan-400/20 group-hover:bg-cyan-400/30',
      iconColor: 'text-cyan-300',
      textColor: 'text-cyan-300 group-hover:text-cyan-200',
      descColor: 'text-cyan-200/80',
      shadow: 'hover:shadow-cyan-500/25'
    },
    {
      icon: CheckCircle,
      value: stats.completedVideos,
      label: 'Courses Conquered',
      description: 'Victory achieved!',
      gradient: 'from-emerald-500/10 via-emerald-600/10 to-green-700/10',
      border: 'border-emerald-300/30',
      iconBg: 'bg-emerald-400/20 group-hover:bg-emerald-400/30',
      iconColor: 'text-emerald-300',
      textColor: 'text-emerald-300 group-hover:text-emerald-200',
      descColor: 'text-emerald-200/80',
      shadow: 'hover:shadow-emerald-500/25'
    },
    {
      icon: Clock,
      value: stats.inProgressVideos,
      label: 'Active Learning',
      description: 'In progress now',
      gradient: 'from-amber-500/10 via-amber-600/10 to-orange-700/10',
      border: 'border-amber-300/30',
      iconBg: 'bg-amber-400/20 group-hover:bg-amber-400/30',
      iconColor: 'text-amber-300',
      textColor: 'text-amber-300 group-hover:text-amber-200',
      descColor: 'text-amber-200/80',
      shadow: 'hover:shadow-amber-500/25'
    },
    {
      icon: TrendingUp,
      value: `${stats.totalProgress}%`,
      label: 'Mastery Level',
      description: 'Total progress',
      gradient: 'from-purple-500/10 via-purple-600/10 to-pink-700/10',
      border: 'border-purple-300/30',
      iconBg: 'bg-purple-400/20 group-hover:bg-purple-400/30',
      iconColor: 'text-purple-300',
      textColor: 'text-purple-300 group-hover:text-purple-200',
      descColor: 'text-purple-200/80',
      shadow: 'hover:shadow-purple-500/25'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 mb-12">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card 
            key={index}
            className={`group bg-gradient-to-br ${stat.gradient} backdrop-blur-2xl border ${stat.border} text-white hover:scale-105 hover:rotate-1 transition-all duration-500 shadow-2xl ${stat.shadow} overflow-hidden relative`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient.replace('/10', '/5')} opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
            <CardContent className="p-6 lg:p-8 text-center relative z-10">
              <div className="flex items-center justify-center gap-4 mb-4">
                <div className={`p-4 ${stat.iconBg} rounded-2xl transition-colors duration-300`}>
                  <Icon className={`h-6 w-6 lg:h-8 lg:w-8 ${stat.iconColor}`} />
                </div>
                <span className={`text-3xl lg:text-4xl font-bold ${stat.textColor} transition-colors duration-300`}>
                  {stat.value}
                </span>
              </div>
              <p className={`${stat.textColor.replace('group-hover:', '')} font-semibold text-base lg:text-lg mb-2`}>
                {stat.label}
              </p>
              <div className={`text-sm ${stat.descColor}`}>{stat.description}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default CommandRoomStats;
