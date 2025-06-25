
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Trophy, 
  Zap, 
  Flame, 
  Target, 
  TrendingUp, 
  Calendar,
  ChevronDown, 
  ChevronUp,
  Star,
  Award,
  Coins
} from 'lucide-react';

interface StatsCardProps {
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

const EnhancedStatsCard: React.FC<StatsCardProps> = ({ stats, isCollapsed, onToggle }) => {
  const progressPercentage = (stats.xp / stats.nextLevelXp) * 100;
  const dailyProgressPercentage = (stats.dailyQuestProgress / 7) * 100; // Assuming 7 daily quests
  
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Novice Warrior': return 'bg-gray-100 text-gray-700 border-gray-300';
      case 'Rising Warrior': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'Skilled Warrior': return 'bg-green-100 text-green-700 border-green-300';
      case 'Elite Warrior': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Master Warrior': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Legendary Warrior': return 'bg-red-100 text-red-700 border-red-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const getStreakBadge = (streak: number) => {
    if (streak >= 30) return { color: 'bg-red-100 text-red-700 border-red-300', label: '🔥 Fire' };
    if (streak >= 14) return { color: 'bg-orange-100 text-orange-700 border-orange-300', label: '⚡ Electric' };
    if (streak >= 7) return { color: 'bg-yellow-100 text-yellow-700 border-yellow-300', label: '💫 Blazing' };
    if (streak >= 3) return { color: 'bg-green-100 text-green-700 border-green-300', label: '🌟 Hot' };
    return { color: 'bg-gray-100 text-gray-700 border-gray-300', label: '🔥 Building' };
  };

  const streakBadge = getStreakBadge(stats.streak);

  return (
    <Card className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 border-purple-500/30 text-white backdrop-blur-lg shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 rounded-2xl overflow-hidden">
      {/* Animated background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-1/4 right-1/4 w-32 h-32 bg-purple-500/30 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-24 h-24 bg-blue-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
      </div>

      <CardHeader className="pb-4 relative z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-3 text-xl font-bold">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
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

        {/* Level and Rank Display */}
        <div className="flex items-center gap-4 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-300">{stats.level}</div>
            <div className="text-xs text-purple-400">Level</div>
          </div>
          <div className="flex-1">
            <Badge className={`${getRankColor(stats.rank)} font-medium`}>
              <Award className="h-3 w-3 mr-1" />
              {stats.rank}
            </Badge>
            <div className="mt-2">
              <div className="flex justify-between text-xs text-purple-300 mb-1">
                <span>{stats.xp} XP</span>
                <span>{stats.nextLevelXp} XP</span>
              </div>
              <Progress 
                value={progressPercentage} 
                className="h-2 bg-purple-900/50"
              />
            </div>
          </div>
        </div>
      </CardHeader>

      {!isCollapsed && (
        <CardContent className="relative z-10 space-y-6">
          {/* Primary Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Flame className="h-5 w-5 text-orange-400" />
                <span className="text-sm text-purple-200">Streak</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.streak}</div>
              <Badge className={`${streakBadge.color} text-xs mt-2`}>
                {streakBadge.label}
              </Badge>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-sm text-purple-200">Quests</span>
              </div>
              <div className="text-2xl font-bold text-white">{stats.completedQuests}</div>
              <div className="text-xs text-purple-300 mt-1">
                Total Completed
              </div>
            </div>
          </div>

          {/* Daily Progress */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-400" />
                <span className="text-sm text-purple-200">Today's Progress</span>
              </div>
              <span className="text-xs text-purple-300">
                {stats.dailyQuestProgress}/7 quests
              </span>
            </div>
            <Progress value={dailyProgressPercentage} className="h-2 bg-purple-900/50" />
          </div>

          {/* Weekly Progress */}
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-400" />
                <span className="text-sm text-purple-200">Weekly Goal</span>
              </div>
              <span className="text-xs text-purple-300">
                {Math.round(stats.weeklyProgress)}% complete
              </span>
            </div>
            <Progress value={stats.weeklyProgress} className="h-2 bg-purple-900/50" />
          </div>

          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-lg p-3 border border-white/10">
              <Zap className="h-4 w-4 text-yellow-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{stats.xp}</div>
              <div className="text-xs text-purple-300">Current XP</div>
            </div>
            
            <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-lg p-3 border border-white/10">
              <Star className="h-4 w-4 text-purple-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{stats.level}</div>
              <div className="text-xs text-purple-300">Level</div>
            </div>
            
            <div className="bg-gradient-to-b from-white/10 to-white/5 rounded-lg p-3 border border-white/10">
              <Trophy className="h-4 w-4 text-gold-400 mx-auto mb-1" />
              <div className="text-lg font-bold text-white">{Math.round(stats.weeklyProgress)}</div>
              <div className="text-xs text-purple-300">Weekly %</div>
            </div>
          </div>

          {/* Motivational Message */}
          <div className="text-center py-2">
            {stats.streak >= 7 ? (
              <p className="text-sm text-purple-200">
                🔥 Amazing streak! You're on fire!
              </p>
            ) : stats.completedQuests >= 10 ? (
              <p className="text-sm text-purple-200">
                ⚡ Great progress! Keep pushing forward!
              </p>
            ) : (
              <p className="text-sm text-purple-200">
                🌟 Every step counts. You've got this!
              </p>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default EnhancedStatsCard;
