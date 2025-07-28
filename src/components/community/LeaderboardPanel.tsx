
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Trophy, 
  Zap, 
  Flame, 
  Target, 
  Coins, 
  Crown,
  Medal,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import { useAuth } from '@/contexts/AuthContext';

const LeaderboardPanel = () => {
  const { user } = useAuth();
  const { leaderboard, isLoading } = useLeaderboard();
  const [selectedCategory, setSelectedCategory] = useState('xp');

  const getRankIcon = (position: number) => {
    switch (position) {
      case 1: return <Crown className="h-5 w-5 text-yellow-500" />;
      case 2: return <Medal className="h-5 w-5 text-gray-400" />;
      case 3: return <Medal className="h-5 w-5 text-amber-600" />;
      default: return <Star className="h-4 w-4 text-purple-400" />;
    }
  };

  const getRankBadgeColor = (rank: string) => {
    switch (rank) {
      case 'Legendary Warrior': return 'bg-red-100 text-red-700 border-red-300';
      case 'Master Warrior': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'Elite Warrior': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'Skilled Warrior': return 'bg-green-100 text-green-700 border-green-300';
      case 'Rising Warrior': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  const sortLeaderboard = (category: string) => {
    const sorted = [...leaderboard];
    switch (category) {
      case 'xp':
        return sorted.sort((a, b) => b.total_xp - a.total_xp);
      case 'level':
        return sorted.sort((a, b) => b.level - a.level);
      case 'streak':
        return sorted.sort((a, b) => b.current_streak - a.current_streak);
      case 'quests':
        return sorted.sort((a, b) => b.completed_quests - a.completed_quests);
      case 'coins':
        return sorted.sort((a, b) => b.total_coins - a.total_coins);
      default:
        return sorted;
    }
  };

  const getCategoryValue = (entry: any, category: string) => {
    switch (category) {
      case 'xp': return entry.total_xp;
      case 'level': return entry.level;
      case 'streak': return entry.current_streak;
      case 'quests': return entry.completed_quests;
      case 'coins': return entry.total_coins;
      default: return 0;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'xp': return <Zap className="h-4 w-4" />;
      case 'level': return <TrendingUp className="h-4 w-4" />;
      case 'streak': return <Flame className="h-4 w-4" />;
      case 'quests': return <Target className="h-4 w-4" />;
      case 'coins': return <Coins className="h-4 w-4" />;
      default: return <Star className="h-4 w-4" />;
    }
  };

  if (isLoading) {
    return (
      <Card className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 border-purple-500/30 text-white">
        <CardContent className="p-8 text-center">
          <div className="animate-spin h-8 w-8 border-2 border-purple-400 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-purple-200">Loading leaderboard...</p>
        </CardContent>
      </Card>
    );
  }

  const sortedLeaderboard = sortLeaderboard(selectedCategory);
  const userPosition = sortedLeaderboard.findIndex(entry => entry.user_id === user?.id) + 1;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 border border-purple-500/30 backdrop-blur-sm">
        <CardHeader className="text-center">
          <CardTitle className="flex items-center justify-center gap-3 text-2xl font-bold text-white">
            <Trophy className="h-8 w-8 text-yellow-500" />
            Warrior Leaderboard
          </CardTitle>
          <p className="text-purple-200">Compete with fellow warriors and climb the ranks!</p>
          {userPosition > 0 && (
            <div className="mt-4 p-3 bg-purple-900/30 rounded-lg border border-purple-500/30">
              <p className="text-purple-200 text-sm">
                Your current rank: <span className="font-bold text-white">#{userPosition}</span>
              </p>
            </div>
          )}
        </CardHeader>
      </Card>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-5 bg-black/60 border-purple-800/50 backdrop-blur-md">
          <TabsTrigger value="xp" className="text-white data-[state=active]:bg-purple-600">
            <Zap className="h-4 w-4 mr-1" />
            XP
          </TabsTrigger>
          <TabsTrigger value="level" className="text-white data-[state=active]:bg-purple-600">
            <TrendingUp className="h-4 w-4 mr-1" />
            Level
          </TabsTrigger>
          <TabsTrigger value="streak" className="text-white data-[state=active]:bg-purple-600">
            <Flame className="h-4 w-4 mr-1" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="quests" className="text-white data-[state=active]:bg-purple-600">
            <Target className="h-4 w-4 mr-1" />
            Quests
          </TabsTrigger>
          <TabsTrigger value="coins" className="text-white data-[state=active]:bg-purple-600">
            <Coins className="h-4 w-4 mr-1" />
            Coins
          </TabsTrigger>
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          <Card className="bg-gradient-to-br from-slate-900/95 to-purple-900/95 border-purple-500/30 text-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getCategoryIcon(selectedCategory)}
                Top Warriors by {selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedLeaderboard.slice(0, 50).map((entry, index) => (
                  <div
                    key={entry.id}
                    className={`flex items-center justify-between p-4 rounded-xl border transition-all hover:scale-105 ${
                      entry.user_id === user?.id
                        ? 'bg-purple-600/20 border-purple-400/50 ring-1 ring-purple-400/30'
                        : 'bg-white/5 border-white/10 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 min-w-[60px]">
                        {getRankIcon(index + 1)}
                        <span className="font-bold text-lg">#{index + 1}</span>
                      </div>
                      
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={entry.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.user_id}`} />
                        <AvatarFallback>{entry.profiles?.full_name?.slice(0, 2) || 'W'}</AvatarFallback>
                      </Avatar>
                      
                      <div>
                        <h4 className="font-semibold text-white">
                          {entry.profiles?.full_name || 'Anonymous Warrior'}
                          {entry.user_id === user?.id && (
                            <span className="ml-2 text-xs text-purple-300">(You)</span>
                          )}
                        </h4>
                        <Badge className={`${getRankBadgeColor(entry.rank_name)} text-xs`}>
                          {entry.rank_name}
                        </Badge>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xl font-bold text-white flex items-center gap-2">
                        {getCategoryIcon(selectedCategory)}
                        {getCategoryValue(entry, selectedCategory).toLocaleString()}
                      </div>
                      <div className="text-xs text-purple-300">
                        Level {entry.level} • {entry.current_streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {sortedLeaderboard.length === 0 && (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-2">No Warriors Yet</h3>
                  <p className="text-purple-300">Be the first to complete quests and appear on the leaderboard!</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPanel;
