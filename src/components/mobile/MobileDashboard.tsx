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
  Clock,
  Compass,
  Phone
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
      title: "CDC's Arena",
      description: 'Elite training ground',
      icon: Target,
      path: '/warrior-space',
      color: 'from-orange-500 to-red-600'
    },
    {
      title: 'Command Room',
      description: 'Main workspace',
      icon: Compass,
      path: '/dashboard?tab=command-room',
      color: 'from-blue-500 to-cyan-600'
    },
    {
      title: 'Calendar',
      description: 'Schedule and events',
      icon: Calendar,
      path: '/dashboard?tab=calendar',
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Community',
      description: 'Connect with warriors',
      icon: Users,
      path: '/community',
      color: 'from-purple-500 to-violet-600'
    },
    {
      title: 'Stage Rooms',
      description: 'Live sessions',
      icon: Phone,
      path: '/dashboard?tab=stage',
      color: 'from-red-500 to-pink-600'
    }
  ];

  const todaysTasks = [
    { id: 1, title: 'Morning workout', completed: true, time: '06:00' },
    { id: 2, title: 'Read 30 minutes', completed: true, time: '07:30' },
    { id: 3, title: 'Meditation session', completed: false, time: '20:00' },
    { id: 4, title: 'Journal writing', completed: false, time: '21:00' }
  ];

  return (
    <div className="mobile-smooth-scroll mobile-gpu-boost min-h-screen bg-gradient-to-br from-background via-muted/10 to-background lg:hidden">
      <MobileHeader 
        title={`${greeting}!`}
        subtitle={user?.email?.split('@')[0] || 'Warrior'}
      />
      
      {/* Main content with top padding for fixed header */}
      <main className="pt-20 pb-20 mobile-container space-y-6">
        {/* Hero card */}
        <div className="mobile-card bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border-primary/20 relative overflow-hidden rounded-2xl p-6">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 mobile-gpu-boost" />
          <div className="relative">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold mb-2">Ready to Dominate Today?</h2>
                <p className="text-muted-foreground text-sm">
                  You're 70% through your daily goals. Keep pushing forward!
                </p>
              </div>
              <Sparkles className="h-8 w-8 text-primary animate-pulse mobile-gpu-boost" />
            </div>
            <Progress value={70} className="mt-4 h-2" />
          </div>
        </div>

        {/* Quick stats grid */}
        <div className="grid grid-cols-2 gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div key={index} className="mobile-card touch-feedback mobile-hover:scale-105 rounded-2xl p-4 animate-mobile-fade-in" 
                   style={{ animationDelay: `${index * 100}ms` }}>
                <div className="flex items-center gap-3">
                  <div className={cn("p-2 rounded-xl mobile-gpu-boost", stat.bgColor)}>
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
              </div>
            );
          })}
        </div>

        {/* Quick actions */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold px-2">Five Core Features</h3>
          <div className="mobile-dashboard-grid">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <div key={index} className="mobile-core-feature touch-feedback animate-mobile-fade-in" 
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <a href={action.path} className="block">
                    <div className="flex flex-col items-center text-center gap-3">
                      <div className={cn(
                        "mobile-feature-icon mobile-gpu-boost",
                        action.color
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <p className="font-semibold text-base">{action.title}</p>
                        <p className="text-sm text-muted-foreground mt-1">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
              );
            })}
          </div>
        </div>

        {/* Today's tasks */}
        <div className="mobile-card rounded-2xl">
          <div className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Today's Focus</h3>
            </div>
            <div className="space-y-3">
              {todaysTasks.map((task) => (
                <div key={task.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-muted/50 touch-feedback -mx-3">
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
                      "font-medium text-sm",
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
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default MobileDashboard;