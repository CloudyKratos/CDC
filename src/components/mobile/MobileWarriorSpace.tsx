import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { 
  Sword, 
  Target, 
  TrendingUp, 
  Calendar,
  Trophy,
  Star,
  Flame,
  Clock,
  Users,
  ChevronRight,
  Plus
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';

const MobileWarriorSpace: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'quests' | 'stats'>('overview');

  const warriorStats = {
    level: 12,
    currentXp: 1240,
    nextLevelXp: 1500,
    rank: 'Silver Warrior',
    streak: 15,
    totalCoins: 2850,
    completedQuests: 47,
    dailyQuestProgress: 7,
    totalDailyQuests: 10
  };

  const quickActions = [
    {
      title: 'Daily Challenge',
      description: 'Complete today\'s warrior mission',
      icon: Target,
      color: 'from-blue-500 to-blue-600',
      action: () => {},
      status: 'active'
    },
    {
      title: 'Log Workout',
      description: 'Record your training session',
      icon: Sword,
      color: 'from-green-500 to-green-600',
      action: () => {},
      status: 'pending'
    },
    {
      title: 'Weekly Goal',
      description: 'Set your next milestone',
      icon: Trophy,
      color: 'from-purple-500 to-purple-600',
      action: () => {},
      status: 'completed'
    }
  ];

  const todayQuests = [
    { id: 1, title: 'Morning Workout', xp: 50, completed: true, category: 'Fitness' },
    { id: 2, title: 'Read 30 Minutes', xp: 30, completed: true, category: 'Learning' },
    { id: 3, title: 'Meditation', xp: 25, completed: false, category: 'Mindfulness' },
    { id: 4, title: 'Healthy Meal Prep', xp: 40, completed: false, category: 'Nutrition' },
    { id: 5, title: 'Connect with Team', xp: 35, completed: true, category: 'Social' }
  ];

  const xpProgress = (warriorStats.currentXp / warriorStats.nextLevelXp) * 100;
  const dailyProgress = (warriorStats.dailyQuestProgress / warriorStats.totalDailyQuests) * 100;

  return (
    <div className="mobile-smooth-scroll mobile-gpu-boost min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10 lg:hidden">
      <MobileHeader 
        title="Warrior Space"
        subtitle="Transform your potential into power"
        showBack={true}
        backPath="/dashboard"
        actions={
          <Button variant="ghost" size="icon" className="touch-target-optimal">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />
      
      {/* Main content with proper mobile spacing */}
      <main className="pt-16 pb-safe px-4 space-y-4 max-w-md mx-auto">
        {/* Warrior profile card - optimized for mobile */}
        <div className="mobile-card bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border-primary/20 relative overflow-hidden rounded-xl p-4 w-full">
          <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10 mobile-gpu-boost" />
          <div className="relative">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mobile-gpu-boost flex-shrink-0">
                  <Sword className="h-6 w-6 sm:h-7 sm:w-7 text-white" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-lg sm:text-xl font-bold truncate">Level {warriorStats.level}</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {warriorStats.rank}
                  </Badge>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold text-lg">{warriorStats.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            </div>
            
            {/* XP Progress - optimized for mobile */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium text-foreground">
                  {warriorStats.currentXp} / {warriorStats.nextLevelXp}
                </span>
              </div>
              <Progress value={xpProgress} className="h-3 w-full" />
            </div>
          </div>
        </div>

        {/* Tab navigation - mobile optimized */}
        <div className="flex bg-muted/30 rounded-xl p-1 mobile-gpu-boost w-full">
          {[
            { id: 'overview', label: 'Overview', icon: Target },
            { id: 'quests', label: 'Quests', icon: Sword },
            { id: 'stats', label: 'Stats', icon: TrendingUp }
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? "secondary" : "ghost"}
                className={cn(
                  "flex-1 touch-target-optimal gap-1 sm:gap-2 rounded-lg text-xs sm:text-sm font-medium px-2 py-2.5",
                  activeTab === tab.id && "bg-background shadow-md mobile-shadow-sm"
                )}
                onClick={() => setActiveTab(tab.id as any)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{tab.label}</span>
              </Button>
            );
          })}
        </div>

        {/* Tab content */}
        {activeTab === 'overview' && (
          <div className="space-y-4 animate-mobile-fade-in w-full">
            {/* Daily progress - mobile optimized */}
            <div className="mobile-card rounded-xl p-4 w-full">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
                <h3 className="text-lg font-semibold truncate">Today's Progress</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Daily Quests</span>
                  <span className="font-medium text-foreground">
                    {warriorStats.dailyQuestProgress}/{warriorStats.totalDailyQuests}
                  </span>
                </div>
                <Progress value={dailyProgress} className="h-3 w-full" />
                <p className="text-xs text-muted-foreground text-center">
                  {warriorStats.totalDailyQuests - warriorStats.dailyQuestProgress} quests remaining
                </p>
              </div>
            </div>

            {/* Quick actions - mobile optimized */}
            <div className="space-y-3 w-full">
              <h3 className="text-lg font-semibold px-1">Quick Actions</h3>
              {quickActions.map((action, index) => {
                const Icon = action.icon;
                return (
                  <div
                    key={index}
                    className="mobile-card rounded-xl p-4 touch-feedback cursor-pointer w-full"
                    onClick={action.action}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className={cn(
                          "p-2.5 rounded-lg bg-gradient-to-br text-white mobile-gpu-boost flex-shrink-0",
                          action.color
                        )}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="text-left min-w-0 flex-1">
                          <p className="font-medium text-foreground truncate">{action.title}</p>
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {action.description}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {action.status === 'completed' && (
                          <div className="w-2 h-2 bg-green-500 rounded-full" />
                        )}
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'quests' && (
          <div className="space-y-4 animate-mobile-fade-in w-full">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-lg font-semibold">Today's Quests</h3>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 text-xs">
                {todayQuests.filter(q => q.completed).length}/{todayQuests.length}
              </Badge>
            </div>
            
            {todayQuests.map((quest) => (
              <div key={quest.id} className={cn(
                "mobile-card rounded-xl p-4 touch-feedback transition-all duration-200 w-full",
                quest.completed && "bg-muted/30 opacity-75"
              )}>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center mobile-gpu-boost flex-shrink-0",
                    quest.completed 
                      ? "bg-green-500 border-green-500" 
                      : "border-muted-foreground"
                  )}>
                    {quest.completed && (
                      <div className="w-3 h-3 bg-white rounded-full" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className={cn(
                      "font-medium text-foreground truncate",
                      quest.completed && "line-through text-muted-foreground"
                    )}>
                      {quest.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="outline" className="text-xs flex-shrink-0">
                        {quest.category}
                      </Badge>
                      <span className="text-xs text-primary font-medium flex-shrink-0">
                        +{quest.xp} XP
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="grid grid-cols-2 gap-3 animate-mobile-fade-in w-full">
            {[
              { label: 'Total Coins', value: warriorStats.totalCoins.toLocaleString(), icon: Star, color: 'text-yellow-600' },
              { label: 'Completed Quests', value: warriorStats.completedQuests, icon: Trophy, color: 'text-green-600' },
              { label: 'Current Level', value: warriorStats.level, icon: TrendingUp, color: 'text-blue-600' },
              { label: 'Community Rank', value: '#247', icon: Users, color: 'text-purple-600' }
            ].map((stat, index) => {
              const Icon = stat.icon;
              return (
                <div key={index} className="mobile-card touch-feedback mobile-hover:scale-105 rounded-xl p-4 text-center animate-mobile-fade-in w-full"
                     style={{ animationDelay: `${index * 100}ms` }}>
                  <Icon className={cn("h-6 w-6 mx-auto mb-2 mobile-gpu-boost flex-shrink-0", stat.color)} />
                  <p className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground line-clamp-2">{stat.label}</p>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MobileWarriorSpace;