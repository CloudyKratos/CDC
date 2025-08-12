import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Plus,
  Sparkles,
  Zap,
  RefreshCw,
  BarChart3,
  CheckCircle2,
  Coins,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import MobileHeader from './MobileHeader';
import { useAuth } from "@/contexts/AuthContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { toast } from "sonner";
import EnhancedCDCMorningStrategyCard from "@/components/home/EnhancedCDCMorningStrategyCard";
import QuestCard from "../warrior/QuestCard";
import AnimatedProgressBar from "../warrior/AnimatedProgressBar";
import MorningPictureUpload from "../warrior/MorningPictureUpload";

const MobileWarriorSpace: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'daily-challenge' | 'weekly-goals' | 'achievements' | 'progress'>('daily-challenge');
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  const { progress, isLoading, error, getRank, addReward } = useWarriorProgress();
  const { quests, toggleQuestCompletion, getQuestStats, checkAndResetQuests } = useDailyQuests();
  const stats = getQuestStats();

  // Enhanced data loading with better error handling
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !isLoading) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Enhanced weekly goals with dynamic progress
          setWeeklyGoals([
            { 
              id: 1, 
              title: "Maintain 7-day streak", 
              progress: Math.min(progress.streak, 7), 
              target: 7, 
              xp: 500,
              coins: 200,
              type: "streak",
              icon: Flame,
              color: "orange"
            },
            { 
              id: 2, 
              title: "Complete 20 focus sessions", 
              progress: Math.min(progress.completedQuests, 20), 
              target: 20,
              xp: 300,
              coins: 150,
              type: "quests",
              icon: Target,
              color: "blue"
            },
            { 
              id: 3, 
              title: "Earn 500 XP this week", 
              progress: Math.min(progress.weeklyXp || 0, 500), 
              target: 500,
              xp: 200,
              coins: 100,
              type: "xp",
              icon: Sparkles,
              color: "purple"
            }
          ]);

          // Enhanced achievements with visual indicators
          const rankData = getRank(progress.totalXp);
          setAchievements([
            { 
              title: "First Steps", 
              description: "Complete your first task", 
              icon: Target, 
              earned: progress.completedQuests > 0, 
              rarity: "common",
              color: "gray",
              progress: Math.min(progress.completedQuests, 1),
              target: 1
            },
            { 
              title: "Team Player", 
              description: "Join the community", 
              icon: Users, 
              earned: true, 
              rarity: "common",
              color: "blue",
              progress: 1,
              target: 1
            },
            { 
              title: "Focus Master", 
              description: "Complete 10 focus sessions", 
              icon: Trophy, 
              earned: progress.completedQuests >= 10, 
              rarity: "rare",
              color: "purple",
              progress: Math.min(progress.completedQuests, 10),
              target: 10
            },
            { 
              title: "Week Warrior", 
              description: "Maintain 7-day streak", 
              icon: Flame, 
              earned: progress.streak >= 7, 
              rarity: "epic",
              color: "orange",
              progress: Math.min(progress.streak, 7),
              target: 7
            },
            { 
              title: "XP Hunter", 
              description: "Earn 1000+ total XP", 
              icon: Sparkles, 
              earned: progress.totalXp >= 1000, 
              rarity: "legendary",
              color: "yellow",
              progress: Math.min(progress.totalXp, 1000),
              target: 1000
            }
          ]);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user, progress, isLoading, getRank]);

  const handleQuestComplete = async (questId: number) => {
    const quest = quests.find(q => q.id === questId);
    if (!quest || quest.completed || quest.locked) return;

    // Complete the quest
    const updatedQuests = toggleQuestCompletion(questId);
    const updatedStats = getQuestStats();
    
    // Add rewards
    await addReward(quest.xp, quest.coins);
    
    // Success message
    toast.success(`Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
      duration: 3000,
    });

    // Check if all quests are completed
    if (updatedStats.completed === updatedStats.total) {
      toast.success("🎉 All daily quests completed! Bonus XP awarded!", {
        duration: 5000,
      });
      await addReward(100, 50); // Bonus rewards
    }
  };

  const handleRefreshQuests = () => {
    checkAndResetQuests();
    toast.info("Daily quests refreshed!");
  };

  // Get daily and weekly XP from localStorage with validation
  const getDailyXp = () => {
    try {
      const dailyData = localStorage.getItem('dailyProgress');
      if (dailyData) {
        const daily = JSON.parse(dailyData);
        const today = new Date().toDateString();
        if (daily.date === today && typeof daily.xp === 'number') {
          return daily.xp;
        }
      }
    } catch (error) {
      console.warn('Error reading daily XP:', error);
    }
    return 0;
  };

  const getWeeklyXp = () => {
    try {
      const weeklyData = localStorage.getItem('weeklyProgress');
      if (weeklyData) {
        const weekly = JSON.parse(weeklyData);
        const now = new Date();
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
        const thisWeek = `${now.getFullYear()}-W${weekNumber}`;
        if (weekly.week === thisWeek && typeof weekly.xp === 'number') {
          return weekly.xp;
        }
      }
    } catch (error) {
      console.warn('Error reading weekly XP:', error);
    }
    return 0;
  };

  const dailyXp = getDailyXp();
  const weeklyXp = getWeeklyXp();
  const levelProgress = (progress.currentXp / progress.nextLevelXp) * 100;

  // Calculate achievement progress
  const getAchievementProgress = () => {
    const completed = achievements.filter(a => a.earned).length;
    return { completed, total: achievements.length };
  };

  const achievementStats = getAchievementProgress();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your warrior space...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-primary/5 to-purple-500/10">
        <div className="text-center">
          <p className="text-destructive mb-4">Error loading warrior space: {error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mobile-smooth-scroll mobile-gpu-boost min-h-screen bg-gradient-to-br from-background via-primary/5 to-purple-500/10 lg:hidden">
      <MobileHeader 
        title="Warrior Space"
        subtitle="Transform your potential into power"
        showBack={true}
        backPath="/dashboard"
        actions={
          <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] touch-target-optimal">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />
      
      {/* Main content with consistent mobile spacing and safe areas */}
      <main className="pt-16 pb-safe px-4 space-y-5 max-w-lg mx-auto">
        {/* Morning Verification - Priority placement */}
        <div className="mobile-card bg-gradient-to-r from-orange-600/10 to-red-600/10 rounded-2xl border border-orange-500/30 p-4 shadow-xl backdrop-blur-sm">
          <MorningPictureUpload />
        </div>

        {/* Enhanced Strategy Card - Mobile optimized */}
        <div className="mobile-card bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl border border-purple-500/30 p-4 shadow-xl backdrop-blur-sm">
          <EnhancedCDCMorningStrategyCard />
        </div>

        {/* Warrior profile card - Fully responsive with consistent spacing */}
        <div className="mobile-card bg-gradient-to-br from-primary/10 via-purple-500/5 to-transparent border-primary/20 relative overflow-hidden rounded-2xl p-5 w-full">
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 mobile-gpu-boost" />
          <div className="relative">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4 min-w-0 flex-1">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center mobile-gpu-boost flex-shrink-0 ring-2 ring-primary/20">
                  <Sword className="h-7 w-7 sm:h-8 sm:w-8 text-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold truncate text-foreground">Level {progress.level}</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-sm border-primary/20">
                    {progress.rank}
                  </Badge>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-2 text-orange-500">
                  <Flame className="h-5 w-5" />
                  <span className="font-bold text-xl">{progress.streak}</span>
                </div>
                <p className="text-sm text-muted-foreground">day streak</p>
              </div>
            </div>
            
            {/* XP Progress - Enhanced mobile design */}
            <div className="mt-5 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground font-medium">XP Progress</span>
                <span className="font-semibold text-foreground">
                  {progress.currentXp} / {progress.nextLevelXp}
                </span>
              </div>
              <Progress value={levelProgress} className="h-4 w-full bg-muted/50" />
              <div className="text-center">
                <span className="text-xs text-muted-foreground">
                  {progress.nextLevelXp - progress.currentXp} XP to next level
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Tabs - Mobile-first with proper touch targets */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/80 border border-muted-foreground/20 h-auto p-2 backdrop-blur-md rounded-2xl shadow-lg">
            <TabsTrigger 
              value="daily-challenge" 
              className="min-h-[44px] text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-3 text-sm font-semibold transition-all duration-300 hover:bg-muted rounded-xl flex items-center gap-2"
            >
              <Target className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Daily Quests</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly-goals" 
              className="min-h-[44px] text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-3 text-sm font-semibold transition-all duration-300 hover:bg-muted rounded-xl flex items-center gap-2"
            >
              <Calendar className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">Weekly Goals</span>
            </TabsTrigger>
          </TabsList>
          
          {/* Secondary tabs for smaller content */}
          <div className="mt-3">
            <TabsList className="grid w-full grid-cols-2 bg-muted/60 border border-muted-foreground/10 h-auto p-1.5 backdrop-blur-md rounded-xl">
              <TabsTrigger 
                value="achievements" 
                className="min-h-[40px] text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-2.5 px-2 text-xs font-medium transition-all duration-300 hover:bg-muted rounded-lg flex items-center gap-1.5"
              >
                <Trophy className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Achievements</span>
              </TabsTrigger>
              <TabsTrigger 
                value="progress" 
                className="min-h-[40px] text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-2.5 px-2 text-xs font-medium transition-all duration-300 hover:bg-muted rounded-lg flex items-center gap-1.5"
              >
                <Sparkles className="h-3.5 w-3.5 flex-shrink-0" />
                <span className="truncate">Progress</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="mt-5">
            <TabsContent value="daily-challenge" className="space-y-5 m-0">
              {/* Quest Progress Overview - Mobile optimized */}
              <div className="mobile-card bg-gradient-to-br from-slate-900/95 to-indigo-900/60 border-indigo-500/30 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-5">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                      <Target className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        Daily Quest Progress
                      </h3>
                      <p className="text-xs text-indigo-300">Complete tasks to earn XP and coins</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-5">
                    <div className="text-center p-4 bg-indigo-900/30 rounded-xl border border-indigo-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.completed}</div>
                      <div className="text-xs text-indigo-300 font-medium">Completed</div>
                    </div>
                    <div className="text-center p-4 bg-purple-900/30 rounded-xl border border-purple-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{stats.total}</div>
                      <div className="text-xs text-purple-300 font-medium">Total</div>
                    </div>
                    <div className="text-center p-4 bg-green-900/30 rounded-xl border border-green-500/30 backdrop-blur-sm">
                      <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalXpEarned}</div>
                      <div className="text-xs text-green-300 font-medium">XP Earned</div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-indigo-200">Overall Progress</span>
                      <span className="text-sm font-bold text-white">{Math.round(stats.progressPercentage)}%</span>
                    </div>
                    
                    <AnimatedProgressBar 
                      value={stats.completed}
                      max={stats.total}
                      color="purple"
                      size="lg"
                      showPercentage={false}
                      label=""
                    />

                    <div className="flex justify-between items-center">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleRefreshQuests}
                        className="min-h-[44px] border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20 text-sm px-4 py-2"
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh Quests
                      </Button>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <Zap className="h-4 w-4" />
                          <span>+{stats.totalXpEarned}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-400">
                          <Trophy className="h-4 w-4" />
                          <span>+{stats.totalCoinsEarned}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quest List - Mobile optimized with proper spacing */}
              <div className="space-y-4">
                {quests.map((quest) => (
                  <div key={quest.id} className="mobile-card rounded-xl p-4 bg-background/50 backdrop-blur-sm border border-border/50">
                    <QuestCard
                      quest={quest}
                      onComplete={handleQuestComplete}
                    />
                  </div>
                ))}
                
                {quests.length === 0 && (
                  <div className="text-center py-12 text-muted-foreground">
                    <Trophy className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-semibold mb-2">No Quests Available</h3>
                    <p className="text-sm">Check back tomorrow for new challenges!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weekly-goals" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Weekly Goals</h3>
                  <p className="text-sm text-muted-foreground">Long-term objectives for bigger rewards</p>
                </div>
                
                {weeklyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="mobile-card p-5 rounded-xl bg-gradient-to-br from-blue-900/20 to-blue-800/10 border border-blue-700/30 backdrop-blur-sm transition-all duration-200 hover:scale-[1.02]"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h4 className="font-semibold text-foreground text-base mb-1">{goal.title}</h4>
                        <p className="text-xs text-muted-foreground">Weekly challenge</p>
                      </div>
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-sm px-3 py-1">
                        {goal.progress}/{goal.target}
                      </Badge>
                    </div>
                    <Progress value={(goal.progress / goal.target) * 100} className="h-3 mb-4 bg-blue-900/30" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1.5 text-blue-400">
                          <Star className="h-4 w-4" />
                          <span>+{goal.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-yellow-400">
                          <Coins className="h-4 w-4" />
                          <span>+{goal.coins} coins</span>
                        </div>
                      </div>
                      <div className="text-sm text-blue-300 font-medium">
                        {Math.round((goal.progress / goal.target) * 100)}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 m-0">
              <div className="space-y-4">
                <div className="text-center mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">Achievements</h3>
                  <p className="text-sm text-muted-foreground">Unlock badges for your accomplishments</p>
                </div>
                
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`mobile-card p-5 rounded-xl border transition-all duration-200 hover:scale-[1.02] ${
                      achievement.earned
                        ? "bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border-yellow-700/30"
                        : "bg-gradient-to-br from-gray-900/30 to-slate-900/20 border-gray-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <achievement.icon
                        className={`h-8 w-8 transition-all duration-200 flex-shrink-0 ${
                          achievement.earned ? "text-yellow-400" : "text-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className={`font-semibold text-base ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`}>
                            {achievement.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs px-2 py-1 ${
                              achievement.rarity === 'common' ? 'border-gray-500 text-gray-400' :
                              achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                              achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                              'border-yellow-500 text-yellow-400'
                            }`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{achievement.description}</p>
                        {achievement.progress !== undefined && (
                          <div className="mt-3">
                            <Progress 
                              value={(achievement.progress / achievement.target) * 100} 
                              className="h-2" 
                            />
                            <div className="flex justify-between mt-1 text-xs text-muted-foreground">
                              <span>{achievement.progress}/{achievement.target}</span>
                              <span>{Math.round((achievement.progress / achievement.target) * 100)}%</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-5 m-0">
              {/* Main Progress Overview - Mobile optimized */}
              <div className="mobile-card bg-gradient-to-br from-slate-900/95 to-indigo-900/60 border-indigo-500/30 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-5">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
                      <BarChart3 className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                        Your Warrior Journey
                      </h3>
                      <p className="text-xs text-indigo-300">Track your progress and achievements</p>
                    </div>
                  </div>

                  {/* Level Progress Showcase - Mobile */}
                  <div className="text-center py-8 bg-gradient-to-r from-indigo-900/30 to-purple-900/30 rounded-2xl border border-indigo-500/20 mb-6">
                    <div className="relative inline-block">
                      <div className="text-6xl font-bold text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-3">
                        {progress.level}
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Star className="h-8 w-8 text-yellow-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-base text-indigo-300 mb-6 font-semibold">Current Level</div>
                    
                    <div className="max-w-sm mx-auto space-y-4">
                      <Progress 
                        value={levelProgress} 
                        className="h-4 bg-indigo-900/30"
                      />
                      <div className="flex justify-between text-sm">
                        <span className="text-indigo-300">{progress.currentXp} XP</span>
                        <span className="text-indigo-300">{progress.nextLevelXp} XP</span>
                      </div>
                      <div className="text-sm text-indigo-400 flex items-center justify-center gap-2">
                        <Zap className="h-4 w-4" />
                        <span>{progress.nextLevelXp - progress.currentXp} XP until Level {progress.level + 1}</span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid - Mobile optimized */}
                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/30 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
                      <Calendar className="h-8 w-8 text-green-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-green-400 mb-1">{dailyXp}</div>
                      <div className="text-xs text-green-300 font-medium">Today's XP</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/40 to-cyan-900/30 border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
                      <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-blue-400 mb-1">{weeklyXp}</div>
                      <div className="text-xs text-blue-300 font-medium">This Week</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/40 to-red-900/30 border border-orange-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
                      <Flame className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-orange-400 mb-1">{progress.streak}</div>
                      <div className="text-xs text-orange-300 font-medium">Day Streak</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/40 to-amber-900/30 border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
                      <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{progress.totalCoins}</div>
                      <div className="text-xs text-yellow-300 font-medium">Total Coins</div>
                    </div>
                  </div>

                  {/* Achievements Progress - Mobile */}
                  <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Award className="h-6 w-6 text-purple-400" />
                        <span className="text-base font-semibold text-purple-200">Achievements</span>
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-sm px-3 py-1">
                        {achievementStats.completed}/{achievementStats.total}
                      </Badge>
                    </div>
                    <Progress 
                      value={(achievementStats.completed / achievementStats.total) * 100} 
                      className="h-3 bg-purple-900/30 mb-3" 
                    />
                    <div className="text-sm text-purple-400 text-center">
                      {achievementStats.total - achievementStats.completed} achievements remaining
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
};

export default MobileWarriorSpace;