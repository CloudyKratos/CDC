
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { 
  Trophy, 
  Flame, 
  Target, 
  Crown, 
  Medal,
  Star,
  TrendingUp,
  Users
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface LeaderboardEntry {
  user_id: string;
  level: number;
  total_xp: number;
  current_streak: number;
  completed_quests: number;
  total_coins: number;
  rank_name: string;
  last_updated: string;
  profiles?: {
    full_name: string;
    avatar_url?: string;
  };
}

const LeaderboardPanel: React.FC = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  const fetchLeaderboardData = async () => {
    try {
      // First get the leaderboard data
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('warrior_leaderboard')
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(50);

      if (leaderboardError) throw leaderboardError;

      if (leaderboard && leaderboard.length > 0) {
        // Get user IDs for profile lookup
        const userIds = leaderboard.map(entry => entry.user_id);
        
        // Fetch profiles separately
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Combine leaderboard data with profiles
        const combinedData: LeaderboardEntry[] = leaderboard.map(entry => ({
          ...entry,
          profiles: profiles?.find(profile => profile.id === entry.user_id) ? {
            full_name: profiles.find(profile => profile.id === entry.user_id)?.full_name || 'Unknown Warrior',
            avatar_url: profiles.find(profile => profile.id === entry.user_id)?.avatar_url
          } : {
            full_name: 'Unknown Warrior'
          }
        }));

        setLeaderboardData(combinedData);
        
        // Find current user's rank (would need auth context)
        // For now, we'll skip this functionality
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="h-6 w-6 text-yellow-500" />;
      case 2:
        return <Medal className="h-6 w-6 text-gray-400" />;
      case 3:
        return <Medal className="h-6 w-6 text-amber-600" />;
      default:
        return <span className="text-lg font-bold text-muted-foreground">#{rank}</span>;
    }
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return "bg-gradient-to-r from-yellow-400 to-yellow-600";
    if (rank === 2) return "bg-gradient-to-r from-gray-300 to-gray-500";
    if (rank === 3) return "bg-gradient-to-r from-amber-400 to-amber-600";
    if (rank <= 10) return "bg-gradient-to-r from-purple-400 to-purple-600";
    return "bg-gradient-to-r from-gray-400 to-gray-600";
  };

  const getUserInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  if (loading) {
    return (
      <div className="space-y-6 p-6">
        <div className="text-center">
          <div className="h-8 w-48 bg-muted animate-pulse rounded mx-auto mb-4"></div>
          <div className="h-4 w-64 bg-muted animate-pulse rounded mx-auto"></div>
        </div>
        {[...Array(10)].map((_, i) => (
          <div key={i} className="h-20 bg-muted animate-pulse rounded"></div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <Trophy className="h-8 w-8 text-yellow-500" />
          <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
            Warrior Leaderboard
          </h1>
          <Trophy className="h-8 w-8 text-yellow-500" />
        </div>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Compete with fellow warriors and climb the ranks by completing quests, maintaining streaks, and earning XP!
        </p>
        {userRank && (
          <Badge variant="outline" className="text-sm">
            <TrendingUp className="h-4 w-4 mr-1" />
            Your Current Rank: #{userRank}
          </Badge>
        )}
      </div>

      <Tabs defaultValue="overall" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overall" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            Overall
          </TabsTrigger>
          <TabsTrigger value="streaks" className="flex items-center gap-2">
            <Flame className="h-4 w-4" />
            Streaks
          </TabsTrigger>
          <TabsTrigger value="quests" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            Quests
          </TabsTrigger>
          <TabsTrigger value="level" className="flex items-center gap-2">
            <Star className="h-4 w-4" />
            Level
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overall" className="space-y-4 mt-6">
          {leaderboardData.map((entry, index) => (
            <Card 
              key={entry.user_id} 
              className="transition-all duration-300 hover:shadow-lg"
            >
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  {/* Rank */}
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    {getRankIcon(index + 1)}
                  </div>

                  {/* Avatar and Name */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={entry.profiles?.avatar_url} />
                      <AvatarFallback>
                        {getUserInitials(entry.profiles?.full_name || 'Unknown')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">
                        {entry.profiles?.full_name || 'Unknown Warrior'}
                      </h3>
                      <Badge 
                        className={`text-xs text-white ${getRankBadgeColor(index + 1)}`}
                      >
                        {entry.rank_name}
                      </Badge>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                    <div>
                      <div className="text-lg font-bold text-blue-600">{entry.total_xp}</div>
                      <div className="text-xs text-muted-foreground">XP</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-purple-600">{entry.level}</div>
                      <div className="text-xs text-muted-foreground">Level</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-orange-600">{entry.current_streak}</div>
                      <div className="text-xs text-muted-foreground">Streak</div>
                    </div>
                    <div>
                      <div className="text-lg font-bold text-green-600">{entry.completed_quests}</div>
                      <div className="text-xs text-muted-foreground">Quests</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="streaks" className="space-y-4 mt-6">
          {[...leaderboardData]
            .sort((a, b) => b.current_streak - a.current_streak)
            .map((entry, index) => (
            <Card key={entry.user_id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profiles?.avatar_url} />
                    <AvatarFallback>
                      {getUserInitials(entry.profiles?.full_name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.profiles?.full_name || 'Unknown Warrior'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Flame className="h-4 w-4 text-orange-500" />
                      <span className="text-2xl font-bold text-orange-500">{entry.current_streak}</span>
                      <span className="text-sm text-muted-foreground">days</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="quests" className="space-y-4 mt-6">
          {[...leaderboardData]
            .sort((a, b) => b.completed_quests - a.completed_quests)
            .map((entry, index) => (
            <Card key={entry.user_id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profiles?.avatar_url} />
                    <AvatarFallback>
                      {getUserInitials(entry.profiles?.full_name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.profiles?.full_name || 'Unknown Warrior'}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <Target className="h-4 w-4 text-green-500" />
                      <span className="text-2xl font-bold text-green-500">{entry.completed_quests}</span>
                      <span className="text-sm text-muted-foreground">quests completed</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="level" className="space-y-4 mt-6">
          {[...leaderboardData]
            .sort((a, b) => b.level - a.level)
            .map((entry, index) => (
            <Card key={entry.user_id} className="transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="flex-shrink-0 w-12 flex justify-center">
                    <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>
                  </div>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={entry.profiles?.avatar_url} />
                    <AvatarFallback>
                      {getUserInitials(entry.profiles?.full_name || 'Unknown')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <h3 className="font-semibold">{entry.profiles?.full_name || 'Unknown Warrior'}</h3>
                    <div className="flex items-center gap-4 mt-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-purple-500" />
                        <span className="text-2xl font-bold text-purple-500">{entry.level}</span>
                        <span className="text-sm text-muted-foreground">level</span>
                      </div>
                      <Badge variant="outline">{entry.rank_name}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPanel;
