
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
  Award
} from 'lucide-react';

const CommandRoomQuickActions: React.FC = () => {
  const quickActions = [
    {
      title: 'Start Learning',
      description: 'Continue your current course',
      icon: <BookOpen className="w-6 h-6" />,
      color: 'bg-blue-500',
      action: () => console.log('Start learning')
    },
    {
      title: 'Join Live Session',
      description: 'Active webinar in progress',
      icon: <Video className="w-6 h-6" />,
      color: 'bg-red-500',
      action: () => console.log('Join session')
    },
    {
      title: 'Schedule Study',
      description: 'Plan your learning time',
      icon: <Calendar className="w-6 h-6" />,
      color: 'bg-green-500',
      action: () => console.log('Schedule study')
    },
    {
      title: 'Study Group',
      description: 'Join collaborative learning',
      icon: <Users className="w-6 h-6" />,
      color: 'bg-purple-500',
      action: () => console.log('Study group')
    }
  ];

  const stats = [
    { label: 'Courses Completed', value: '12', icon: <Award className="w-5 h-5" />, color: 'text-yellow-400' },
    { label: 'Study Hours', value: '248', icon: <Clock className="w-5 h-5" />, color: 'text-blue-400' },
    { label: 'Current Streak', value: '15 days', icon: <TrendingUp className="w-5 h-5" />, color: 'text-green-400' },
    { label: 'Goals Achieved', value: '8/10', icon: <Target className="w-5 h-5" />, color: 'text-purple-400' }
  ];

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Quick Actions</CardTitle>
          <CardDescription className="text-white/80">
            Jump into your learning activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                className="h-auto p-4 flex flex-col items-center gap-3 bg-white/10 hover:bg-white/20 text-white border-white/20"
                variant="outline"
              >
                <div className={`p-3 rounded-full ${action.color}`}>
                  {action.icon}
                </div>
                <div className="text-center">
                  <p className="font-medium">{action.title}</p>
                  <p className="text-xs text-white/70">{action.description}</p>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Learning Stats */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Your Progress</CardTitle>
          <CardDescription className="text-white/80">
            Track your learning achievements
          </CardDescription>
        </CardHeader>
        <CardContent>
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
        </CardContent>
      </Card>
    </div>
  );
};

export default CommandRoomQuickActions;
