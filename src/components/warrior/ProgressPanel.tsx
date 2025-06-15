
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { BarChart3, Clock, CheckCircle2, Coins, TrendingUp, Zap, Calendar } from "lucide-react";

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
  // Get daily and weekly XP from localStorage
  const getDailyXp = () => {
    const dailyData = localStorage.getItem('dailyProgress');
    if (dailyData) {
      const daily = JSON.parse(dailyData);
      const today = new Date().toDateString();
      if (daily.date === today) {
        return daily.xp;
      }
    }
    return 0;
  };

  const getWeeklyXp = () => {
    const weeklyData = localStorage.getItem('weeklyProgress');
    if (weeklyData) {
      const weekly = JSON.parse(weeklyData);
      const now = new Date();
      const startOfYear = new Date(now.getFullYear(), 0, 1);
      const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
      const thisWeek = `${now.getFullYear()}-W${weekNumber}`;
      if (weekly.week === thisWeek) {
        return weekly.xp;
      }
    }
    return 0;
  };

  const dailyXp = getDailyXp();
  const weeklyXp = getWeeklyXp();

  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Your Journey
        </CardTitle>
        <CardDescription className="text-purple-300">
          Track your progress and see how far you've come
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Level Progress */}
        <div className="text-center py-8">
          <div className="text-6xl font-bold text-purple-400 mb-2">{stats.level}</div>
          <div className="text-purple-300 mb-4">Current Level</div>
          <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="w-full max-w-md mx-auto" />
          <div className="text-sm text-purple-300 mt-2">
            {stats.nextLevelXp - stats.xp} XP to next level
          </div>
        </div>

        {/* Daily and Weekly XP */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <Calendar className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{dailyXp}</div>
            <div className="text-xs text-green-300">Today's XP</div>
          </div>
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{weeklyXp}</div>
            <div className="text-xs text-blue-300">This Week's XP</div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{stats.streak}</div>
            <div className="text-xs text-purple-300">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{stats.completedQuests}</div>
            <div className="text-xs text-green-300">Total Quests</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
            <Coins className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{stats.totalCoins}</div>
            <div className="text-xs text-yellow-300">Total Coins</div>
          </div>
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{Math.round(stats.weeklyProgress)}%</div>
            <div className="text-xs text-blue-300">Weekly Goal</div>
          </div>
        </div>

        {/* Weekly Goal Progress */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-purple-300">Weekly XP Goal (500 XP)</span>
            <Badge variant="outline" className="border-blue-500 text-blue-400">
              {weeklyXp}/500 XP
            </Badge>
          </div>
          <Progress value={Math.min((weeklyXp / 500) * 100, 100)} className="h-2" />
          <div className="text-xs text-purple-400">
            {Math.max(500 - weeklyXp, 0)} XP remaining this week
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressPanel;
