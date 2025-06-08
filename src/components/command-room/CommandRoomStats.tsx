
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Award,
  Clock,
  TrendingUp,
  Target,
  BookOpen,
  Video,
  Users,
  Calendar
} from 'lucide-react';

const CommandRoomStats: React.FC = () => {
  const stats = [
    { label: 'Courses Completed', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Study Hours', value: '248', icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Current Streak', value: '15 days', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Goals Achieved', value: '8/10', icon: <Target className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }
  ];

  const quickStats = [
    { label: 'Videos Watched', value: '45', icon: <Video className="w-4 h-4" />, color: 'text-red-600' },
    { label: 'Articles Read', value: '32', icon: <BookOpen className="w-4 h-4" />, color: 'text-blue-600' },
    { label: 'Sessions Joined', value: '18', icon: <Users className="w-4 h-4" />, color: 'text-green-600' },
    { label: 'Events Attended', value: '26', icon: <Calendar className="w-4 h-4" />, color: 'text-purple-600' }
  ];

  return (
    <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
      <CardHeader>
        <CardTitle className="text-slate-900 dark:text-white">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className={`text-center p-4 rounded-xl ${stat.bgColor} border border-slate-200 dark:border-slate-700`}>
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${stat.bgColor} mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-sm text-slate-600 dark:text-slate-400">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className={`${stat.color}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-semibold text-slate-900 dark:text-white">{stat.value}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomStats;
