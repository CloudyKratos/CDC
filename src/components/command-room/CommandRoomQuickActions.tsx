
import React from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BookOpen, 
  Video, 
  Calendar, 
  Users, 
  Target, 
  TrendingUp,
  Clock,
  Award,
  Play,
  Plus
} from 'lucide-react';

const CommandRoomQuickActions: React.FC = () => {
  const quickActions = [
    {
      title: 'Continue Learning',
      description: 'Resume your current course',
      icon: <Play className="w-5 h-5" />,
      color: 'bg-blue-600 hover:bg-blue-700',
      action: () => console.log('Continue learning')
    },
    {
      title: 'Join Live Session',
      description: 'Active webinar available',
      icon: <Video className="w-5 h-5" />,
      color: 'bg-red-600 hover:bg-red-700',
      action: () => console.log('Join session'),
      badge: 'Live'
    },
    {
      title: 'Schedule Study',
      description: 'Plan your learning time',
      icon: <Calendar className="w-5 h-5" />,
      color: 'bg-green-600 hover:bg-green-700',
      action: () => console.log('Schedule study')
    },
    {
      title: 'Study Group',
      description: 'Join collaborative learning',
      icon: <Users className="w-5 h-5" />,
      color: 'bg-purple-600 hover:bg-purple-700',
      action: () => console.log('Study group')
    }
  ];

  const stats = [
    { label: 'Courses Completed', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-yellow-600', bgColor: 'bg-yellow-50 dark:bg-yellow-900/20' },
    { label: 'Study Hours', value: '248', icon: <Clock className="w-5 h-5" />, color: 'text-blue-600', bgColor: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Current Streak', value: '15 days', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-600', bgColor: 'bg-green-50 dark:bg-green-900/20' },
    { label: 'Goals Achieved', value: '8/10', icon: <Target className="w-5 h-5" />, color: 'text-purple-600', bgColor: 'bg-purple-50 dark:bg-purple-900/20' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <Plus className="w-5 h-5" />
            Quick Actions
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Jump into your learning activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className={`h-auto p-4 flex flex-col items-center gap-3 ${action.color} text-white relative group transition-all duration-200 hover:scale-105 shadow-md`}
                variant="default"
              >
                {action.badge && (
                  <span className="absolute -top-1 -right-1 px-2 py-1 bg-red-500 text-white text-xs rounded-full">
                    {action.badge}
                  </span>
                )}
                <div className="p-2 bg-white/20 rounded-full group-hover:bg-white/30 transition-colors">
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs opacity-80">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Stats */}
      <Card className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 shadow-lg">
        <CardHeader>
          <CardTitle className="text-slate-900 dark:text-white flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Your Progress
          </CardTitle>
          <CardDescription className="text-slate-600 dark:text-slate-400">
            Track your learning achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CommandRoomQuickActions;
