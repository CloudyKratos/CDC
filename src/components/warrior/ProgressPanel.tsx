
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  Coins, 
  TrendingUp, 
  Zap, 
  Calendar,
  Star,
  Trophy,
  Target,
  Flame,
  Award
} from "lucide-react";

interface ProgressPanelProps {
  stats: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    totalCoins: number;
    weeklyProgress: number;
  };
}

const ProgressPanel = ({ stats }: ProgressPanelProps) => {
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
  const levelProgress = (stats.xp / stats.nextLevelXp) * 100;

  // Calculate achievement progress
  const getAchievementProgress = () => {
    const achievements = [
      { name: "First Steps", progress: Math.min(stats.completedQuests, 1), max: 1 },
      { name: "Focus Master", progress: Math.min(stats.completedQuests, 10), max: 10 },
      { name: "Week Warrior", progress: Math.min(stats.streak, 7), max: 7 },
      { name: "XP Hunter", progress: Math.min(stats.xp + (stats.level - 1) * 100, 1000), max: 1000 }
    ];
    
    const completed = achievements.filter(a => a.progress >= a.max).length;
    return { completed, total: achievements.length };
  };

  const achievementStats = getAchievementProgress();

  return (
    <div className="space-y-6">
      {/* Main Progress Overview */}
      <Card className="bg-gradient-to-br from-slate-900/95 to-indigo-900/60 border-indigo-500/30 text-white backdrop-blur-xl shadow-2xl rounded-2xl overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
        </div>

        <CardHeader className="relative z-10">
          <CardTitle className="flex items-center gap-3 text-2xl font-bold">
            <div className="p-3 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl shadow-lg">
              <BarChart3 className="h-7 w-7 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
              Your Warrior Journey
            </span>
          </CardTitle>
          <CardDescription className="text-indigo-300 text-lg">
            Track your progress and celebrate achievements
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-8 relative z-10">
          {/* Level Progress Showcase */}
          <div className="text-center py-8 bg-gradient-to-r from-indigo-900/20 to-purple-900/20 rounded-2xl border border-indigo-500/20">
            <div className="relative">
              <div className="text-7xl font-bold text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text mb-4 drop-shadow-lg">
                {stats.level}
              </div>
              <div className="absolute -top-2 -right-2">
                <Star className="h-8 w-8 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <div className="text-xl text-indigo-300 mb-6 font-semibold">Current Level</div>
            
            <div className="max-w-md mx-auto space-y-4">
              <Progress 
                value={levelProgress} 
                className="h-4 bg-indigo-900/30"
              />
              <div className="flex justify-between text-sm">
                <span className="text-indigo-300">{stats.xp} XP</span>
                <span className="text-indigo-300">{stats.nextLevelXp} XP</span>
              </div>
              <div className="text-sm text-indigo-400">
                <Zap className="h-4 w-4 inline mr-1" />
                {stats.nextLevelXp - stats.xp} XP until Level {stats.level + 1}
              </div>
            </div>
          </div>

          {/* Enhanced Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Daily XP */}
            <div className="bg-gradient-to-br from-green-900/30 to-emerald-900/20 border border-green-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
              <Calendar className="h-8 w-8 text-green-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-green-400 mb-1">{dailyXp}</div>
              <div className="text-xs text-green-300 font-medium">Today's XP</div>
            </div>

            {/* Weekly XP */}
            <div className="bg-gradient-to-br from-blue-900/30 to-cyan-900/20 border border-blue-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
              <Zap className="h-8 w-8 text-blue-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-blue-400 mb-1">{weeklyXp}</div>
              <div className="text-xs text-blue-300 font-medium">This Week</div>
            </div>

            {/* Streak */}
            <div className="bg-gradient-to-br from-orange-900/30 to-red-900/20 border border-orange-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
              <Flame className="h-8 w-8 text-orange-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-orange-400 mb-1">{stats.streak}</div>
              <div className="text-xs text-orange-300 font-medium">Day Streak</div>
            </div>

            {/* Total Coins */}
            <div className="bg-gradient-to-br from-yellow-900/30 to-amber-900/20 border border-yellow-500/30 rounded-xl p-4 text-center hover:scale-105 transition-all duration-300">
              <Coins className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
              <div className="text-3xl font-bold text-yellow-400 mb-1">{stats.totalCoins}</div>
              <div className="text-xs text-yellow-300 font-medium">Total Coins</div>
            </div>
          </div>

          {/* Achievements Progress */}
          <div className="bg-gradient-to-r from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Award className="h-6 w-6 text-purple-400" />
                <span className="text-lg font-semibold text-purple-200">Achievements</span>
              </div>
              <Badge className="bg-purple-600/20 text-purple-300 border-purple-500/30">
                {achievementStats.completed}/{achievementStats.total}
              </Badge>
            </div>
            <Progress 
              value={(achievementStats.completed / achievementStats.total) * 100} 
              className="h-3 bg-purple-900/30 mb-2" 
            />
            <div className="text-sm text-purple-400 text-center">
              {achievementStats.total - achievementStats.completed} achievements remaining
            </div>
          </div>

          {/* Weekly Goal Progress */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-indigo-400" />
                <span className="text-lg font-semibold text-indigo-200">Weekly XP Goal</span>
              </div>
              <Badge variant="outline" className="border-indigo-500 text-indigo-400 bg-indigo-900/20">
                {weeklyXp}/500 XP
              </Badge>
            </div>
            <Progress value={Math.min((weeklyXp / 500) * 100, 100)} className="h-3 bg-indigo-900/30" />
            <div className="flex items-center justify-between text-sm">
              <span className="text-indigo-400">
                {Math.max(500 - weeklyXp, 0)} XP remaining
              </span>
              <div className="flex items-center gap-1 text-indigo-300">
                <TrendingUp className="h-4 w-4" />
                <span>{Math.round(stats.weeklyProgress)}% complete</span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-700/30 border border-slate-500/30 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <Trophy className="h-6 w-6 text-amber-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-amber-400">{stats.completedQuests}</div>
                <div className="text-xs text-amber-300">Quests Done</div>
              </div>
              <div>
                <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-400">{Math.round(levelProgress)}%</div>
                <div className="text-xs text-green-300">Level Progress</div>
              </div>
              <div>
                <Clock className="h-6 w-6 text-blue-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-400">{stats.streak > 0 ? `${stats.streak}d` : '0d'}</div>
                <div className="text-xs text-blue-300">Current Streak</div>
              </div>
              <div>
                <Star className="h-6 w-6 text-purple-400 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-400">{stats.level}</div>
                <div className="text-xs text-purple-300">Warrior Level</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProgressPanel;
