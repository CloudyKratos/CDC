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
          <Button variant="ghost" size="icon" className="touch-target-optimal">
            <Plus className="h-5 w-5" />
          </Button>
        }
      />
      
      {/* Main content with proper mobile spacing */}
      <main className="pt-16 pb-safe px-4 space-y-4 max-w-lg mx-auto">
        {/* Enhanced Strategy Card - Mobile optimized */}
        <div className="mobile-card bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl border border-purple-500/30 p-3 shadow-xl backdrop-blur-sm">
          <EnhancedCDCMorningStrategyCard />
        </div>

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
                  <h2 className="text-lg sm:text-xl font-bold truncate">Level {progress.level}</h2>
                  <Badge variant="secondary" className="bg-primary/10 text-primary text-xs">
                    {progress.rank}
                  </Badge>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="flex items-center gap-1 text-orange-500">
                  <Flame className="h-4 w-4" />
                  <span className="font-bold text-lg">{progress.streak}</span>
                </div>
                <p className="text-xs text-muted-foreground">day streak</p>
              </div>
            </div>
            
            {/* XP Progress - optimized for mobile */}
            <div className="mt-4 space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">XP Progress</span>
                <span className="font-medium text-foreground">
                  {progress.currentXp} / {progress.nextLevelXp}
                </span>
              </div>
              <Progress value={levelProgress} className="h-3 w-full" />
            </div>
          </div>
        </div>

        {/* Enhanced Tabs - Mobile first */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-muted/60 border-purple-800/50 h-auto p-1 backdrop-blur-md rounded-xl shadow-xl">
            <TabsTrigger 
              value="daily-challenge" 
              className="text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-2 text-xs font-semibold transition-all duration-300 hover:bg-muted rounded-lg"
            >
              <Target className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">Quests</span>
            </TabsTrigger>
            <TabsTrigger 
              value="weekly-goals" 
              className="text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-2 text-xs font-semibold transition-all duration-300 hover:bg-muted rounded-lg"
            >
              <Calendar className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">Goals</span>
            </TabsTrigger>
            <TabsTrigger 
              value="achievements" 
              className="text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-2 text-xs font-semibold transition-all duration-300 hover:bg-muted rounded-lg"
            >
              <Trophy className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">Awards</span>
            </TabsTrigger>
            <TabsTrigger 
              value="progress" 
              className="text-foreground data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 px-2 text-xs font-semibold transition-all duration-300 hover:bg-muted rounded-lg"
            >
              <Sparkles className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">Stats</span>
            </TabsTrigger>
          </TabsList>

          <div className="mt-4">
            <TabsContent value="daily-challenge" className="space-y-4 m-0">
              {/* Quest Progress Overview - Mobile */}
              <div className="mobile-card bg-gradient-to-br from-slate-900/90 to-indigo-900/50 border-indigo-500/30 text-white backdrop-blur-lg shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <Target className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                      Daily Quest Progress
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div className="text-center p-3 bg-indigo-900/20 rounded-lg border border-indigo-500/30">
                      <div className="text-2xl font-bold text-indigo-400 mb-1">{stats.completed}</div>
                      <div className="text-xs text-indigo-300">Done</div>
                    </div>
                    <div className="text-center p-3 bg-purple-900/20 rounded-lg border border-purple-500/30">
                      <div className="text-2xl font-bold text-purple-400 mb-1">{stats.total}</div>
                      <div className="text-xs text-purple-300">Total</div>
                    </div>
                    <div className="text-center p-3 bg-green-900/20 rounded-lg border border-green-500/30">
                      <div className="text-2xl font-bold text-green-400 mb-1">{stats.totalXpEarned}</div>
                      <div className="text-xs text-green-300">XP</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-indigo-200">Progress</span>
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
                        className="border-indigo-500/50 text-indigo-300 hover:bg-indigo-600/20 text-xs px-3 py-1"
                      >
                        <RefreshCw className="h-3 w-3 mr-1" />
                        Refresh
                      </Button>
                      
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Zap className="h-3 w-3" />
                          <span>+{stats.totalXpEarned}</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Trophy className="h-3 w-3" />
                          <span>+{stats.totalCoinsEarned}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quest List - Mobile optimized */}
              <div className="space-y-3">
                {quests.map((quest) => (
                  <div key={quest.id} className="mobile-card rounded-lg p-3">
                    <QuestCard
                      quest={quest}
                      onComplete={handleQuestComplete}
                    />
                  </div>
                ))}
                
                {quests.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Trophy className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No quests available. Check back tomorrow!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="weekly-goals" className="space-y-4 m-0">
              <div className="space-y-3">
                {weeklyGoals.map((goal) => (
                  <div
                    key={goal.id}
                    className="mobile-card p-4 rounded-lg bg-blue-900/20 border-blue-700/30 transition-all duration-200"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-semibold text-foreground">{goal.title}</h4>
                      <Badge variant="outline" className="border-blue-500 text-blue-400 text-xs">
                        {goal.progress}/{goal.target}
                      </Badge>
                    </div>
                    <Progress value={(goal.progress / goal.target) * 100} className="h-2 mb-3" />
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-blue-400">
                          <Star className="h-3 w-3" />
                          <span>+{goal.xp} XP</span>
                        </div>
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="h-3 w-3" />
                          <span>+{goal.coins} coins</span>
                        </div>
                      </div>
                      <div className="text-xs text-purple-300">
                        {Math.round((goal.progress / goal.target) * 100)}% complete
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="achievements" className="space-y-4 m-0">
              <div className="space-y-3">
                {achievements.map((achievement, index) => (
                  <div
                    key={index}
                    className={`mobile-card p-4 rounded-lg border transition-all duration-200 ${
                      achievement.earned
                        ? "bg-yellow-900/20 border-yellow-700/30"
                        : "bg-gray-900/20 border-gray-700/30"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <achievement.icon
                        className={`h-6 w-6 transition-all duration-200 flex-shrink-0 ${
                          achievement.earned ? "text-yellow-400" : "text-gray-500"
                        }`}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className={`font-semibold text-sm ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`}>
                            {achievement.title}
                          </h4>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              achievement.rarity === 'common' ? 'border-gray-500 text-gray-400' :
                              achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                              achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                              'border-yellow-500 text-yellow-400'
                            }`}
                          >
                            {achievement.rarity}
                          </Badge>
                        </div>
                        <p className="text-xs text-purple-300">{achievement.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4 m-0">
              {/* Main Progress Overview - Mobile */}
              <div className="mobile-card bg-gradient-to-br from-slate-900/95 to-indigo-900/60 border-indigo-500/30 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
                <div className="p-4">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl">
                      <BarChart3 className="h-5 w-5 text-white" />
                    </div>
                    <span className="text-lg font-bold bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                      Your Warrior Journey
                    </span>
                  </div>

                  {/* Level Progress Showcase - Mobile */}
                  <div className="text-center py-6 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-xl border border-indigo-500/20 mb-4">
                    <div className="relative">
                      <div className="text-5xl font-bold text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-3">
                        {progress.level}
                      </div>
                      <div className="absolute -top-1 -right-1">
                        <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
                      </div>
                    </div>
                    <div className="text-sm text-indigo-300 mb-4 font-semibold">Current Level</div>
                    
                    <div className="max-w-xs mx-auto space-y-3">
                      <Progress 
                        value={levelProgress} 
                        className="h-3 bg-indigo-900/30"
                      />
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-300">{progress.currentXp} XP</span>
                        <span className="text-indigo-300">{progress.nextLevelXp} XP</span>
                      </div>
                      <div className="text-xs text-indigo-400">
                        <Zap className="h-3 w-3 inline mr-1" />
                        {progress.nextLevelXp - progress.currentXp} XP until Level {progress.level + 1}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Stats Grid - Mobile optimized */}
                  <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-lg p-3 text-center">
                      <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-green-400 mb-1">{dailyXp}</div>
                      <div className="text-xs text-green-300">Today's XP</div>
                    </div>

                    <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-lg p-3 text-center">
                      <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-blue-400 mb-1">{weeklyXp}</div>
                      <div className="text-xs text-blue-300">This Week</div>
                    </div>

                    <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30 rounded-lg p-3 text-center">
                      <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-orange-400 mb-1">{progress.streak}</div>
                      <div className="text-xs text-orange-300">Day Streak</div>
                    </div>

                    <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 rounded-lg p-3 text-center">
                      <Coins className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
                      <div className="text-2xl font-bold text-yellow-400 mb-1">{progress.totalCoins}</div>
                      <div className="text-xs text-yellow-300">Total Coins</div>
                    </div>
                  </div>

                  {/* Achievements Progress - Mobile */}
                  <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-purple-400" />
                        <span className="text-sm font-semibold text-purple-200">Achievements</span>
                      </div>
                      <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30 text-xs">
                        {achievementStats.completed}/{achievementStats.total}
                      </Badge>
                    </div>
                    <Progress 
                      value={(achievementStats.completed / achievementStats.total) * 100} 
                      className="h-2 bg-purple-900/30 mb-2" 
                    />
                    <div className="text-xs text-purple-400 text-center">
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