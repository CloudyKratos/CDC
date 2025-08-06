import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  Calendar, 
  Users, 
  Target,
  ChevronRight,
  Sparkles,
  BarChart3,
  Clock
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';
import { useAuth } from '@/contexts/AuthContext';

const MobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const [greeting] = useState(() => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  });

  const quickStats = [
    {
      label: 'Today\'s Progress',
      value: '7/10',
      percentage: 70,
      icon: Target,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20'
    },
    {
      label: 'Current Streak',
      value: '12 days',
      icon: TrendingUp,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20'
    },
    {
      label: 'Weekly Score',
      value: '485 pts',
      icon: BarChart3,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20'
    },
    {
      label: 'Community Rank',
      value: '#247',
      icon: Users,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20'
    }
  ];

  const quickActions = [
    {
      title: 'Join Community',
      description: 'Connect with fellow warriors',
      icon: Users,
      path: '/community',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Warrior Space',
      description: 'Track your progress',
      icon: Target,
      path: '/warrior-space',
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Command Room',
      description: 'Access training content',
      icon: Calendar,
      path: '/command-room',
      color: 'from-blue-500 to-cyan-600'
    }
  ];

  const todaysTasks = [
    { id: 1, title: 'Morning workout', completed: true, time: '06:00' },
    { id: 2, title: 'Read 30 minutes', completed: true, time: '07:30' },
    { id: 3, title: 'Meditation session', completed: false, time: '20:00' },
    { id: 4, title: 'Journal writing', completed: false, time: '21:00' }
  ];

  return (
    <div className="min-h-screen bg-background lg:hidden">
      <MobileHeader 
        title={`${greeting}!`}
        subtitle={user?.email?.split('@')[0] || 'Warrior'}
      />
      
      {/* Main content with top padding for fixed header */}
      <main className="pt-20 pb-20 mobile-container space-y-6">
        {/* Hero card */}
        <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16" />
          <CardHeader className="relative">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl mb-2">Ready to Dominate Today?</CardTitle>
                <p className="text-muted-foreground text-sm">
                  You're 70% through your daily goals. Keep pushing forward!
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-primary animate-pulse" />
            </div>
            <Progress value={70} className="mt-4" />
          </CardHeader>
        </Card>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="touch-feedback hover-lift">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className={cn("p-2 rounded-lg", stat.bgColor)}>
                      <Icon className={cn("h-4 w-4", stat.color)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-lg">{stat.value}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {stat.label}
                      </p>
                    </div>
                  </div>
                  {stat.percentage && (
                    <Progress value={stat.percentage} className="mt-3 h-1.5" />
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Quick Actions</h3>
          {quickActions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant="outline"
                className={cn(
                  "w-full justify-between p-6 h-auto touch-feedback",
                  "hover:bg-gradient-to-r hover:from-background hover:to-muted/50"
                )}
                asChild
              >
                <a href={action.path}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl bg-gradient-to-br text-white",
                      action.color
                    )}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium">{action.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {action.description}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </a>
              </Button>
            );
          })}
        </div>

        {/* Today's tasks */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Focus
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {todaysTasks.map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 touch-feedback">
                <div className={cn(
                  "w-4 h-4 rounded-full border-2 flex-shrink-0",
                  task.completed 
                    ? "bg-green-500 border-green-500" 
                    : "border-muted-foreground"
                )}>
                  {task.completed && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-white rounded-full" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className={cn(
                    "font-medium",
                    task.completed && "line-through text-muted-foreground"
                  )}>
                    {task.title}
                  </p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {task.time}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MobileDashboard;