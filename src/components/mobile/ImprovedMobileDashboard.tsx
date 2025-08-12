import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  Users, 
  Calendar, 
  Command, 
  Sword, 
  Bell,
  Plus,
  TrendingUp,
  Clock,
  Star,
  Coins,
  Target,
  Flame,
  Trophy,
  Settings,
  User,
  Zap,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useWarriorProgress } from '@/hooks/useWarriorProgress';
import { useDailyQuests } from '@/hooks/useDailyQuests';
import MobileHeader from './MobileHeader';
import MobileCalendarView from '../calendar/MobileCalendarView';
import { toast } from 'sonner';

const ImprovedMobileDashboard: React.FC = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'home';
  
  const { profile, coins, isLoading: profileLoading } = useUserProfile();
  const { progress, isLoading: progressLoading, addReward } = useWarriorProgress();
  const { quests, getQuestStats } = useDailyQuests();
  
  const [currentTime, setCurrentTime] = useState(new Date());
  const [greeting, setGreeting] = useState('');

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // Set greeting based on time
  useEffect(() => {
    const hour = currentTime.getHours();
    if (hour < 12) setGreeting('Good morning');
    else if (hour < 18) setGreeting('Good afternoon');
    else setGreeting('Good evening');
  }, [currentTime]);

  const questStats = getQuestStats();
  const isLoading = profileLoading || progressLoading;
  
  // Real user stats with actual data
  const realStats = [
    { 
      label: 'Daily Progress', 
      value: `${questStats.completed}/${questStats.total}`, 
      icon: Target,
      color: 'text-blue-500',
      progress: (questStats.completed / Math.max(questStats.total, 1)) * 100
    },
    { 
      label: 'Current Streak', 
      value: `${progress.streak} days`, 
      icon: Flame,
      color: 'text-orange-500',
      progress: Math.min((progress.streak / 30) * 100, 100) // 30-day max
    },
    { 
      label: 'Warrior Coins', 
      value: coins?.balance?.toLocaleString() || '0', 
      icon: Coins,
      color: 'text-yellow-500',
      progress: Math.min((coins?.balance || 0) / 1000 * 100, 100) // 1000 coins max display
    }
  ];

  // Real core features with dynamic data
  const coreFeatures = [
    {
      id: 'arena',
      title: "CDC's Arena",
      description: "Warrior's training ground",
      icon: Sword,
      path: '/warrior-space',
      color: 'from-purple-500 to-pink-500',
      stats: `Level ${progress.level} • ${progress.currentXp.toLocaleString()} XP`,
      isActive: true,
      urgency: progress.currentXp < progress.nextLevelXp * 0.9 ? 'high' : 'normal'
    },
    {
      id: 'command',
      title: 'Command Room',
      description: 'Mission control center',
      icon: Command,
      path: '/dashboard?tab=command-room',
      color: 'from-blue-500 to-cyan-500',
      stats: 'Active missions available',
      isActive: true,
      urgency: 'normal'
    },
    {
      id: 'calendar',
      title: 'Calendar',
      description: 'Community events',
      icon: Calendar,
      path: '/dashboard?tab=calendar',
      color: 'from-green-500 to-emerald-500',
      stats: 'Upcoming events',
      isActive: true,
      urgency: 'normal'
    },
    {
      id: 'community',
      title: 'Community',
      description: 'Connect with warriors',
      icon: Users,
      path: '/community',
      color: 'from-orange-500 to-red-500',
      stats: 'Warriors online',
      isActive: true,
      urgency: 'normal'
    }
  ];

  // Pending tasks/notifications
  const pendingTasks = [
    {
      id: 'morning-verification',
      title: 'Morning Verification',
      description: 'Upload your morning routine photo',
      icon: Clock,
      action: () => window.location.href = '/warrior-space',
      priority: 'high',
      timeLeft: '2h remaining'
    },
    {
      id: 'daily-quests',
      title: 'Complete Daily Quests',
      description: `${questStats.total - questStats.completed} quests remaining`,
      icon: Target,
      action: () => window.location.href = '/warrior-space',
      priority: questStats.completed === 0 ? 'high' : 'medium',
      timeLeft: 'Due today'
    }
  ].filter(task => {
    // Filter out completed tasks
    if (task.id === 'daily-quests' && questStats.completed === questStats.total) return false;
    return true;
  });

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
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
          <Button 
            variant="ghost" 
            size="icon" 
            className="min-h-[44px] min-w-[44px] touch-target-optimal relative"
            onClick={() => toast.info('Notifications feature coming soon!')}
          >
            <Bell className="h-5 w-5" />
            {pendingTasks.length > 0 && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>
        }
      />
      
      <main className="pt-20 pb-safe px-4 space-y-6 max-w-lg mx-auto">
        {/* Personalized Welcome Section */}
        <div className="text-center py-6 bg-gradient-to-r from-primary/10 to-purple-500/10 rounded-2xl border border-primary/20">
          <div className="flex justify-center mb-4">
            <Avatar className="w-16 h-16 ring-2 ring-primary/20">
              <AvatarImage src={profile?.avatar_url || ''} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg font-bold">
                {profile?.full_name?.charAt(0) || user?.name?.charAt(0) || 'W'}
              </AvatarFallback>
            </Avatar>
          </div>
          <h2 className="text-xl font-bold mb-1">
            {greeting}, {profile?.full_name || user?.name || 'Warrior'}!
          </h2>
          <p className="text-muted-foreground text-sm">
            {currentTime.toLocaleDateString('en-US', { 
              weekday: 'long', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
          <div className="mt-3">
            <Badge 
              variant="secondary" 
              className="bg-primary/10 text-primary border-primary/20"
            >
              {progress.rank} • Level {progress.level}
            </Badge>
          </div>
        </div>

        {/* Pending Tasks - High Priority */}
        {pendingTasks.length > 0 && (
          <Card className="border-orange-200 bg-orange-50/50 dark:border-orange-800 dark:bg-orange-950/20">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-orange-700 dark:text-orange-300">
                <AlertCircle className="h-5 w-5" />
                Pending Tasks ({pendingTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingTasks.map((task) => {
                const Icon = task.icon;
                return (
                  <div
                    key={task.id}
                    className="flex items-center gap-3 p-3 bg-background rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={task.action}
                  >
                    <div className={cn(
                      "p-2 rounded-lg",
                      task.priority === 'high' ? 'bg-red-100 text-red-600 dark:bg-red-950 dark:text-red-400' :
                      'bg-orange-100 text-orange-600 dark:bg-orange-950 dark:text-orange-400'
                    )}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{task.title}</h4>
                      <p className="text-xs text-muted-foreground">{task.description}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{task.timeLeft}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Real-time Stats with Progress */}
        <div className="space-y-3">
          <h3 className="text-lg font-semibold">Today's Progress</h3>
          <div className="grid grid-cols-1 gap-3">
            {realStats.map((stat, index) => {
              const Icon = stat.icon;
              return (
                <Card key={index} className="hover:shadow-md transition-all duration-200">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <Icon className={cn("h-5 w-5", stat.color)} />
                        <div>
                          <p className="font-semibold">{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{Math.round(stat.progress)}%</span>
                      </div>
                    </div>
                    <Progress value={stat.progress} className="h-2" />
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Core Features with Real Data */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Warrior Cores</h3>
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              All Systems Active
            </Badge>
          </div>
          
          <div className="space-y-3">
            {coreFeatures.map((feature) => {
              const Icon = feature.icon;
              return (
                <Link key={feature.id} to={feature.path}>
                  <Card className="touch-feedback hover:shadow-lg transition-all duration-200 overflow-hidden group">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "p-3 rounded-xl bg-gradient-to-br text-white shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform duration-200",
                          feature.color
                        )}>
                          <Icon className="h-6 w-6" />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-base mb-1">{feature.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {feature.description}
                          </p>
                          <p className="text-sm text-primary font-medium">
                            {feature.stats}
                          </p>
                        </div>
                        
                        <div className="flex-shrink-0 flex flex-col items-center gap-1">
                          <div className={cn(
                            "w-3 h-3 rounded-full",
                            feature.isActive ? "bg-green-500 animate-pulse" : "bg-gray-400"
                          )} />
                          <span className="text-xs text-muted-foreground">
                            {feature.isActive ? 'Active' : 'Offline'}
                          </span>
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
              <Link to="/warrior-space">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2 w-full">
                  <Sword className="h-5 w-5" />
                  <span className="text-sm">Start Training</span>
                </Button>
              </Link>
              <Link to="/profile-settings">
                <Button variant="outline" className="h-auto p-4 flex-col gap-2 w-full">
                  <User className="h-5 w-5" />
                  <span className="text-sm">Edit Profile</span>
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Achievement Teaser */}
        {progress.currentXp > 0 && (
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/20 dark:to-pink-950/20 border-purple-200 dark:border-purple-800">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Trophy className="h-6 w-6 text-purple-600" />
                <div className="flex-1">
                  <h4 className="font-semibold text-purple-900 dark:text-purple-100">
                    Level Progress
                  </h4>
                  <p className="text-sm text-purple-700 dark:text-purple-300 mb-2">
                    {progress.nextLevelXp - progress.currentXp} XP until Level {progress.level + 1}
                  </p>
                  <Progress 
                    value={(progress.currentXp / progress.nextLevelXp) * 100} 
                    className="h-2" 
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ImprovedMobileDashboard;