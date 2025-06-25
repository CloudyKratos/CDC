
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Shield, 
  Flame, 
  Trophy, 
  Coins, 
  Star,
  Target,
  TrendingUp
} from 'lucide-react';

interface WarriorHeaderProps {
  stats: {
    streak: number;
    level: number;
    totalCoins: number;
    rank?: string;
    currentXp?: number;
    nextLevelXp?: number;
  };
  progressPercentage: number;
  completedQuestsToday: number;
  totalQuestsToday: number;
}

const ResponsiveWarriorHeader: React.FC<WarriorHeaderProps> = ({
  stats,
  progressPercentage,
  completedQuestsToday,
  totalQuestsToday
}) => {
  const getRankColor = (rank?: string) => {
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

  return (
    <Card className="bg-gradient-to-r from-slate-900/95 to-purple-900/95 border-purple-500/30 text-white backdrop-blur-lg shadow-xl">
      <CardContent className="p-6">
        {/* Header Row */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                Warrior Command Center
              </h1>
              <p className="text-purple-200 text-sm">
                Level {stats.level} • Transform your potential into power
              </p>
            </div>
          </div>

          {stats.rank && (
            <Badge className={`${getRankColor(stats.rank)} font-medium`}>
              <Trophy className="h-4 w-4 mr-2" />
              {stats.rank}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {/* Level */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Star className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-purple-200">Level</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.level}</div>
            {stats.currentXp !== undefined && stats.nextLevelXp !== undefined && (
              <div className="text-xs text-purple-300 mt-1">
                {stats.currentXp}/{stats.nextLevelXp} XP
              </div>
            )}
          </div>

          {/* Streak */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-purple-200">Streak</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.streak}</div>
            <div className="text-xs text-purple-300 mt-1">
              {stats.streak > 0 ? `${stats.streak} days strong!` : 'Start today!'}
            </div>
          </div>

          {/* Daily Progress */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-4 w-4 text-green-400" />
              <span className="text-sm text-purple-200">Today</span>
            </div>
            <div className="text-2xl font-bold text-white">
              {completedQuestsToday}/{totalQuestsToday}
            </div>
            <div className="text-xs text-purple-300 mt-1">Quests done</div>
          </div>

          {/* Coins */}
          <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
            <div className="flex items-center gap-2 mb-2">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-sm text-purple-200">Coins</span>
            </div>
            <div className="text-2xl font-bold text-white">{stats.totalCoins}</div>
            <div className="text-xs text-purple-300 mt-1">Total earned</div>
          </div>
        </div>

        {/* Progress Bars */}
        <div className="space-y-4">
          {/* Level Progress */}
          {stats.currentXp !== undefined && stats.nextLevelXp !== undefined && (
            <div>
              <div className="flex justify-between text-sm text-purple-200 mb-2">
                <span>Level Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-purple-900/50" />
            </div>
          )}

          {/* Daily Quest Progress */}
          <div>
            <div className="flex justify-between text-sm text-purple-200 mb-2">
              <span>Daily Quest Progress</span>
              <span>{Math.round((completedQuestsToday / totalQuestsToday) * 100)}%</span>
            </div>
            <Progress 
              value={(completedQuestsToday / totalQuestsToday) * 100} 
              className="h-2 bg-purple-900/50" 
            />
          </div>
        </div>

        {/* Motivational Quote */}
        <div className="mt-6 text-center">
          <p className="text-purple-200 text-sm italic">
            "Every expert was once a beginner. Every pro was once an amateur. Every icon was once an unknown."
          </p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ResponsiveWarriorHeader;
