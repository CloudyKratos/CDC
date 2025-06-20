
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Flame, Trophy, ChevronDown, ChevronUp, Star, Zap, Target } from "lucide-react";
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
  const progressPercentage = (stats.xp / stats.nextLevelXp) * 100;
  const xpToNext = stats.nextLevelXp - stats.xp;

  return (
    <Card className="bg-gradient-to-br from-black/50 to-purple-900/30 border-purple-800/40 text-white backdrop-blur-sm shadow-xl">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5 text-purple-400" />
            Warrior Stats
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 text-purple-300 hover:text-white transition-colors"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      
      {!isCollapsed && (
        <CardContent className="space-y-6">
          {/* Level and Rank */}
          <div className="text-center space-y-3">
            <div className="relative">
              <div className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                Level {stats.level}
              </div>
              <div className="absolute -top-2 -right-2">
                <Star className="h-6 w-6 text-yellow-400 animate-pulse" />
              </div>
            </div>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 shadow-lg">
              <Crown className="h-3 w-3 mr-1" />
              {stats.rank}
            </Badge>
          </div>
          
          {/* XP Progress */}
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-purple-300 font-medium">Experience Progress</span>
              <span className="text-white font-semibold">{stats.xp}/{stats.nextLevelXp}</span>
            </div>
            <AnimatedProgressBar 
              value={stats.xp} 
              max={stats.nextLevelXp} 
              color="purple"
              size="lg"
            />
            <div className="text-center">
              <span className="text-xs text-purple-400 bg-purple-900/30 px-2 py-1 rounded-full">
                {xpToNext} XP to next level
              </span>
            </div>
          </div>
          
          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl border border-orange-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-400/10 to-red-400/10 animate-pulse" />
              <div className="relative">
                <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-2 mb-1">
                  <Flame className="h-6 w-6" />
                  {stats.streak}
                </div>
                <div className="text-xs text-orange-300 font-medium">Day Streak</div>
                {stats.streak >= 7 && (
                  <div className="text-xs text-orange-200 mt-1">🔥 On Fire!</div>
                )}
              </div>
            </div>
            
            <div className="text-center p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl border border-green-500/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-green-400/10 to-emerald-400/10 animate-pulse" />
              <div className="relative">
                <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-6 w-6" />
                  {stats.completedQuests}
                </div>
                <div className="text-xs text-green-300 font-medium">Quests Done</div>
                {stats.completedQuests >= 10 && (
                  <div className="text-xs text-green-200 mt-1">⭐ Expert!</div>
                )}
              </div>
            </div>
          </div>

          {/* Weekly Progress */}
          <div className="space-y-3 pt-3 border-t border-purple-800/30">
            <div className="flex justify-between items-center">
              <span className="text-sm text-purple-300 font-medium flex items-center gap-2">
                <Target className="h-4 w-4" />
                Weekly Goal
              </span>
              <span className="text-sm text-white font-semibold">{stats.weeklyProgress}%</span>
            </div>
            <AnimatedProgressBar 
              value={stats.weeklyProgress} 
              max={100} 
              color="blue"
              size="md"
            />
            <div className="text-center">
              {stats.weeklyProgress >= 100 ? (
                <span className="text-xs text-green-400 bg-green-900/30 px-2 py-1 rounded-full">
                  🎉 Week Completed!
                </span>
              ) : (
                <span className="text-xs text-blue-400 bg-blue-900/30 px-2 py-1 rounded-full">
                  {100 - stats.weeklyProgress}% left this week
                </span>
              )}
            </div>
          </div>

          {/* Motivational message */}
          <div className="text-center p-3 bg-gradient-to-r from-purple-600/20 to-blue-600/20 rounded-lg border border-purple-500/30">
            <div className="text-sm text-purple-200">
              {stats.streak >= 7 ? "🌟 You're crushing it, Warrior!" :
               stats.completedQuests >= 5 ? "💪 Great progress today!" :
               "⚡ Ready for your next quest?"}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedStatsCard;
