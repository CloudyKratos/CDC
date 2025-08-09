import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Users, 
  Calendar, 
  Command, 
  Sword, 
  Bell,
  Plus,
  TrendingUp,
  Clock,
  Star
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';
import MobileCalendarView from '../calendar/MobileCalendarView';

const MobileDashboard: React.FC = () => {
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';

  const coreFeatures = [
    {
      id: 'arena',
      title: "CDC's Arena",
      description: "Warrior's training ground",
      icon: Sword,
      path: '/warrior-space',
      color: 'from-purple-500 to-pink-500',
      stats: 'Level 12 • 1,240 XP'
    },
    {
      id: 'command',
      title: 'Command Room',
      description: 'Mission control center',
      icon: Command,
      path: '/command-room',
      color: 'from-blue-500 to-cyan-500',
      stats: '5 Active Missions'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Community events',
      icon: Calendar,
      path: '/dashboard?tab=calendar',
      color: 'from-green-500 to-emerald-500',
      stats: '3 Events Today'
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Connect with warriors',
      icon: Users,
      path: '/community',
      color: 'from-orange-500 to-red-500',
      stats: '247 Members Online'
    },
    {
      id: 'stage',
      title: 'Stage Rooms',
      description: 'Live sessions',
      icon: Star,
      path: '/stage-rooms',
      color: 'from-indigo-500 to-purple-500',
      stats: '2 Live Sessions'
    }
  ];

  const quickStats = [
    { label: 'Today\'s Focus', value: '2h 45m', icon: Clock },
    { label: 'Streak', value: '15 days', icon: TrendingUp },
    { label: 'Rank', value: '#247', icon: Star }
  ];

  // Show calendar tab content
  if (activeTab === 'calendar') {
    return (
      <div className="min-h-screen bg-background">
        <MobileHeader 
          title="Community Calendar"
          subtitle="Stay connected with events"
          showBack={true}
          backPath="/dashboard"
        />
        
        <div className="pt-20 pb-20 p-4">
          <MobileCalendarView />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
      <MobileHeader 
        title="Command Center"
        subtitle="Your warrior dashboard"
        actions={
          <Button variant="ghost" size="icon" className="touch-target">
            <Bell className="h-5 w-5" />
          </Button>
        }
      />
      
      <main className="pt-20 pb-20 p-4 space-y-6">
        {/* Welcome Section */}
        <div className="text-center py-4">
          <h2 className="text-2xl font-bold mb-2">Welcome back, Warrior!</h2>
          <p className="text-muted-foreground">Ready to conquer today's challenges?</p>
        </div>

        {/* Quick Stats - Enhanced mobile design */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4">
          {quickStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card key={index} className="text-center hover:shadow-md transition-all duration-200">
                <CardContent className="p-3 sm:p-4">
                  <Icon className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
                  <p className="text-sm sm:text-lg font-bold truncate">{stat.value}</p>
                  <p className="text-xs text-muted-foreground truncate">{stat.label}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Core Features */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Five Main Cores</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              All Active
            </Badge>
          </div>
          
          <div className="space-y-3">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.id} to={feature.path}>
                  <Card className="touch-feedback hover:shadow-lg transition-all duration-200 overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3 sm:gap-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-br text-white shadow-sm flex-shrink-0",
                          feature.color
                        )}>
                          <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-sm sm:text-base truncate">{feature.title}</h4>
                          <p className="text-xs sm:text-sm text-muted-foreground mb-1 line-clamp-2">
                            {feature.description}
                          </p>
                          <p className="text-xs text-primary font-medium truncate">
                            {feature.stats}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                          <div className="w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
                          <span className="text-xs text-muted-foreground">Active</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Start Focus</span>
              </Button>
              <Button variant="outline" className="h-auto p-4 flex-col gap-2">
                <Sword className="h-5 w-5" />
                <span className="text-sm">Log Workout</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default MobileDashboard;