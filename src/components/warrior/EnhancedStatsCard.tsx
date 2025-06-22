
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ChevronDown, 
  ChevronUp, 
  Star, 
  Flame, 
  Trophy, 
  Sparkles, 
  TrendingUp,
  Calendar,
  Target,
  Zap
} from "lucide-react";

interface EnhancedStatsCardProps {
  stats: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    rank: string;
    weeklyProgress: number;
    dailyQuestProgress: number;
    weeklyQuestTarget: number;
  };
  isCollapsed: boolean;
  onToggle: () => void;
}

const EnhancedStatsCard = ({ stats, isCollapsed, onToggle }: EnhancedStatsCardProps) => {
  const progressPercentage = (stats.xp / stats.nextLevelXp) * 100;
  const dailyProgressPercentage = (stats.dailyQuestProgress / 5) * 100; // Assuming 5 daily quests

  const getRankColor = (rank: string) => {
    switch (rank) {
      case "Novice Warrior": return "gray";
      case "Rising Warrior": return "blue";
      case "Skilled Warrior": return "green";
      case "Elite Warrior": return "purple";
      case "Master Warrior": return "orange";
      case "Legendary Warrior": return "red";
      default: return "gray";
    }
  };

  const rankColor = getRankColor(stats.rank);

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-purple-900/60 border-purple-500/30 text-white backdrop-blur-xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-500 rounded-2xl overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg">
              <Star className="h-6 w-6 text-white" />
            </div>
            <div>
              <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Warrior Stats
              </span>
              <div className="text-sm text-purple-300 font-normal mt-1">
                Level {stats.level} {stats.rank}
              </div>
            </div>
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-8 w-8 text-purple-300 hover:text-white hover:bg-purple-600/20 transition-all duration-200 rounded-lg"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="space-y-6 relative z-10">
          {/* Level Progress Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400" />
                <span className="text-lg font-semibold">Level Progress</span>
              </div>
              <Badge 
                className={`bg-${rankColor}-100 text-${rankColor}-700 dark:bg-${rankColor}-900/30 dark:text-${rankColor}-300 border-0 px-3 py-1`}
              >
                {stats.rank}
              </Badge>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-purple-300">XP Progress</span>
                <span className="text-white font-medium">{stats.xp}/{stats.nextLevelXp}</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-3 bg-purple-900/30"
              />
              <div className="text-xs text-purple-400 text-center">
                {stats.nextLevelXp - stats.xp} XP to next level
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak */}
            <div className="bg-orange-900/20 border border-orange-500/30 rounded-xl p-4 text-center transition-all duration-300 hover:bg-orange-900/30">
              <Flame className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-orange-400">{stats.streak}</div>
              <div className="text-xs text-orange-300">Day Streak</div>
            </div>

            {/* Completed Quests */}
            <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4 text-center transition-all duration-300 hover:bg-green-900/30">
              <Trophy className="h-6 w-6 text-green-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-green-400">{stats.completedQuests}</div>
              <div className="text-xs text-green-300">Total Quests</div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="space-y-3 bg-blue-900/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-blue-400" />
                <span className="text-sm font-medium text-blue-200">Daily Quests</span>
              </div>
              <span className="text-xs text-blue-300">{stats.dailyQuestProgress}/5</span>
            </div>
            <Progress value={dailyProgressPercentage} className="h-2 bg-blue-900/30" />
          </div>

          {/* Weekly Progress */}
          <div className="space-y-3 bg-purple-900/10 border border-purple-500/20 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-purple-400" />
                <span className="text-sm font-medium text-purple-200">Weekly Goal</span>
              </div>
              <span className="text-xs text-purple-300">{Math.round(stats.weeklyProgress)}%</span>
            </div>
            <Progress value={stats.weeklyProgress} className="h-2 bg-purple-900/30" />
            <div className="text-xs text-purple-400 text-center">
              {stats.weeklyQuestTarget - Math.round((stats.weeklyProgress / 100) * stats.weeklyQuestTarget)} XP remaining
            </div>
          </div>

          {/* Achievement Hints */}
          <div className="bg-gradient-to-r from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-sm font-medium text-yellow-200">Next Milestone</span>
            </div>
            <div className="text-xs text-yellow-300">
              {stats.streak < 7 
                ? `${7 - stats.streak} days until Week Warrior achievement!`
                : stats.completedQuests < 10
                ? `${10 - stats.completedQuests} quests until Focus Master!`
                : "Keep up the great work! 🌟"
              }
            </div>
          </div>

          {/* Performance Indicator */}
          <div className="flex items-center justify-center gap-2 text-green-400">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm font-medium">
              {stats.streak > 0 ? "On Fire!" : "Ready to Start!"}
            </span>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedStatsCard;
