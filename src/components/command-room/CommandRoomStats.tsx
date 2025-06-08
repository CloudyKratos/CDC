
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
    { label: 'Courses Completed', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Study Hours', value: '248', icon: <Clock className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Current Streak', value: '15 days', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Goals Achieved', value: '8/10', icon: <Target className="w-5 h-5" />, color: 'text-purple-400' }
  ];

  const quickStats = [
    { label: 'Videos Watched', value: '45', icon: <Video className="w-4 h-4" /> },
    { label: 'Articles Read', value: '32', icon: <BookOpen className="w-4 h-4" /> },
    { label: 'Sessions Joined', value: '18', icon: <Users className="w-4 h-4" /> },
    { label: 'Events Attended', value: '26', icon: <Calendar className="w-4 h-4" /> }
  ];

  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-white">Your Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Main Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center p-4 rounded-lg bg-white/5">
              <div className={`inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/10 mb-2 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
              <p className="text-sm text-white/70">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStats.map((stat, index) => (
            <div key={index} className="flex items-center gap-2 p-3 rounded-lg bg-white/5">
              <div className="text-white/70">
                {stat.icon}
              </div>
              <div>
                <p className="text-lg font-semibold text-white">{stat.value}</p>
                <p className="text-xs text-white/60">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default CommandRoomStats;
