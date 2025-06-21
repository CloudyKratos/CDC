
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Flame, Trophy, ChevronDown, ChevronUp, Star, Zap, Target, TrendingUp } from "lucide-react";
import AnimatedProgressBar from "./AnimatedProgressBar";

interface EnhancedStatsCardProps {
  stats: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    rank: string;
    weeklyProgress: number;
  };
  isCollapsed: boolean;
  onToggle: () => void;
}

const EnhancedStatsCard = ({ stats, isCollapsed, onToggle }: EnhancedStatsCardProps) => {
  const progressPercentage = Math.min((stats.xp / stats.nextLevelXp) * 100, 100);
  const xpToNext = Math.max(stats.nextLevelXp - stats.xp, 0);

  const getStreakMessage = () => {
    if (stats.streak >= 30) return "🔥 Legendary Streak!";
    if (stats.streak >= 14) return "💪 Strong Momentum!";
    if (stats.streak >= 7) return "⭐ Weekly Champion!";
    if (stats.streak >= 3) return "🚀 Building Steam!";
    return "💫 Just Getting Started!";
  };

  const getRankColor = () => {
    if (stats.rank.includes("Legendary")) return "from-yellow-400 to-orange-500";
    if (stats.rank.includes("Master")) return "from-purple-400 to-pink-500";
    if (stats.rank.includes("Elite")) return "from-blue-400 to-cyan-500";
    if (stats.rank.includes("Skilled")) return "from-green-400 to-emerald-500";
    return "from-gray-400 to-gray-600";
  };

  return (
    <Card className="bg-gradient-to-br from-slate-900/90 to-purple-900/50 border-purple-500/30 text-white backdrop-blur-lg shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 rounded-2xl overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-0 left-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-24 h-24 bg-blue-500/30 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl">
              <Shield className="h-6 w-6 text-white" />
            </div>
            <span className="bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
              Warrior Stats
            </span>
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
        <CardContent className="space-y-8 relative z-10">
          {/* Level and Rank Section */}
          <div className="text-center space-y-4 p-6 bg-black/20 rounded-2xl border border-purple-500/20">
            <div className="relative inline-block">
              <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 animate-pulse">
                {stats.level}
              </div>
              <div className="absolute -top-3 -right-3 animate-bounce">
                <Star className="h-8 w-8 text-yellow-400 drop-shadow-lg" />
              </div>
              <div className="text-sm text-purple-300 font-semibold mt-2">LEVEL</div>
            </div>
            
            <Badge className={`bg-gradient-to-r ${getRankColor()} text-black border-0 shadow-lg px-4 py-2 text-sm font-bold`}>
              <Crown className="h-4 w-4 mr-2" />
              {stats.rank}
            </Badge>
          </div>
          
          {/* XP Progress Section */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-2xl border border-purple-500/30">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-400" />
                Experience Progress
              </span>
              <span className="text-xl font-bold text-white">{stats.xp}/{stats.nextLevelXp}</span>
            </div>
            
            <AnimatedProgressBar 
              value={stats.xp} 
              max={stats.nextLevelXp} 
              color="purple"
              size="lg"
              className="my-4"
            />
            
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-300">
                {xpToNext} XP to Level {stats.level + 1}
              </span>
              <span className="text-sm text-green-400 font-semibold">
                {Math.round(progressPercentage)}% Complete
              </span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Streak Card */}
            <div className="p-6 bg-gradient-to-br from-orange-600/20 to-red-600/20 rounded-2xl border border-orange-500/40 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-center mb-3">
                  <Flame className="h-8 w-8 text-orange-400 mx-auto mb-2 animate-pulse" />
                  <div className="text-3xl font-bold text-orange-400 mb-1">{stats.streak}</div>
                  <div className="text-xs text-orange-300 font-medium">Day Streak</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-orange-200 bg-orange-900/30 px-2 py-1 rounded-full">
                    {getStreakMessage()}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Quests Card */}
            <div className="p-6 bg-gradient-to-br from-green-600/20 to-emerald-600/20 rounded-2xl border border-green-500/40 relative overflow-hidden group hover:scale-105 transition-transform duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="text-center mb-3">
                  <Trophy className="h-8 w-8 text-green-400 mx-auto mb-2 animate-bounce" />
                  <div className="text-3xl font-bold text-green-400 mb-1">{stats.completedQuests}</div>
                  <div className="text-xs text-green-300 font-medium">Quests</div>
                </div>
                <div className="text-center">
                  <div className="text-xs text-green-200 bg-green-900/30 px-2 py-1 rounded-full">
                    {stats.completedQuests >= 50 ? "🏆 Master" : stats.completedQuests >= 20 ? "⭐ Expert" : stats.completedQuests >= 10 ? "💪 Skilled" : "🌟 Rising"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="space-y-4 p-6 bg-gradient-to-r from-blue-900/30 to-cyan-900/30 rounded-2xl border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold text-blue-200 flex items-center gap-2">
                <Target className="h-5 w-5 text-cyan-400" />
                Weekly Goal
              </span>
              <span className="text-xl font-bold text-white">{Math.round(stats.weeklyProgress)}%</span>
            </div>
            
            <AnimatedProgressBar 
              value={stats.weeklyProgress} 
              max={100} 
              color="blue"
              size="md"
            />
            
            <div className="text-center">
              {stats.weeklyProgress >= 100 ? (
                <div className="flex items-center justify-center gap-2 text-green-400 bg-green-900/30 px-4 py-2 rounded-full">
                  <TrendingUp className="h-4 w-4" />
                  <span className="text-sm font-semibold">🎉 Week Completed!</span>
                </div>
              ) : (
                <span className="text-sm text-blue-300 bg-blue-900/30 px-3 py-1 rounded-full">
                  {Math.round(100 - stats.weeklyProgress)}% remaining this week
                </span>
              )}
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center p-6 bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-2xl border border-purple-500/30 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 animate-pulse" />
            <div className="relative z-10">
              <div className="text-lg font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                {stats.streak >= 14 ? "🌟 You're absolutely crushing it, Warrior!" :
                 stats.streak >= 7 ? "💪 Incredible momentum this week!" :
                 stats.completedQuests >= 10 ? "🚀 Great progress on your journey!" :
                 stats.completedQuests >= 5 ? "⭐ You're building great habits!" :
                 "⚡ Ready to level up your game?"}
              </div>
              <div className="text-sm text-purple-300 mt-2">
                Keep pushing forward - every quest matters!
              </div>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedStatsCard;
