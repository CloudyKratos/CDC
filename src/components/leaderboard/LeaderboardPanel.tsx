import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { 
  Trophy, 
  Flame, 
  Target, 
  Crown, 
  Medal,
  Star,
  TrendingUp,
  Users,
  Search,
  RefreshCw,
  Filter,
  Eye,
  ArrowUp,
  ArrowDown,
  Coins
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from "@/hooks/use-toast";

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
  const [filteredData, setFilteredData] = useState<LeaderboardEntry[]>([]);
  const [userRank, setUserRank] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'total_xp' | 'level' | 'current_streak' | 'completed_quests'>('total_xp');
  const [filterBy, setFilterBy] = useState<'all' | 'top10' | 'top50' | 'friends'>('all');
  const [selectedUser, setSelectedUser] = useState<LeaderboardEntry | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    fetchLeaderboardData();
  }, []);

  useEffect(() => {
    filterAndSortData();
  }, [leaderboardData, searchQuery, sortBy, filterBy]);

  const filterAndSortData = () => {
    let filtered = [...leaderboardData];

    // Apply search filter
    if (searchQuery) {
      filtered = filtered.filter(entry => 
        entry.profiles?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.rank_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Apply additional filters
    switch (filterBy) {
      case 'top10':
        filtered = filtered.slice(0, 10);
        break;
      case 'top50':
        filtered = filtered.slice(0, 50);
        break;
      case 'friends':
        // Could implement friends logic here
        break;
    }

    // Sort data
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'total_xp':
          return b.total_xp - a.total_xp;
        case 'level':
          return b.level - a.level;
        case 'current_streak':
          return b.current_streak - a.current_streak;
        case 'completed_quests':
          return b.completed_quests - a.completed_quests;
        default:
          return b.total_xp - a.total_xp;
      }
    });

    setFilteredData(filtered);
  };

  const fetchLeaderboardData = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true);
    try {
      // First get the leaderboard data using type assertion
      const { data: leaderboard, error: leaderboardError } = await supabase
        .from('warrior_leaderboard' as any)
        .select('*')
        .order('total_xp', { ascending: false })
        .limit(100);

      if (leaderboardError) throw leaderboardError;

      if (leaderboard && leaderboard.length > 0) {
        // Get user IDs for profile lookup
        const userIds = (leaderboard as any[]).map((entry: any) => entry.user_id);
        
        // Fetch profiles separately
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, full_name, avatar_url')
          .in('id', userIds);

        if (profilesError) {
          console.error('Error fetching profiles:', profilesError);
        }

        // Combine leaderboard data with profiles
        const combinedData: LeaderboardEntry[] = (leaderboard as any[]).map((entry: any) => ({
          ...entry,
          profiles: profiles?.find(profile => profile.id === entry.user_id) ? {
            full_name: profiles.find(profile => profile.id === entry.user_id)?.full_name || 'Unknown Warrior',
            avatar_url: profiles.find(profile => profile.id === entry.user_id)?.avatar_url
          } : {
            full_name: 'Unknown Warrior'
          }
        }));

        setLeaderboardData(combinedData);
        
        // Find current user's rank
        if (user) {
          const userIndex = combinedData.findIndex(entry => entry.user_id === user.id);
          if (userIndex !== -1) {
            setUserRank(userIndex + 1);
          }
        }

        if (showRefreshing) {
          toast({
            title: "Leaderboard Updated",
            description: "Latest rankings have been loaded successfully!"
          });
        }
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      toast({
        title: "Error",
        description: "Failed to load leaderboard data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      if (showRefreshing) setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboardData(true);
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
    <TooltipProvider>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Trophy className="h-8 w-8 text-yellow-500 animate-pulse" />
            <h1 className="text-3xl font-bold bg-gradient-to-r from-yellow-600 via-amber-500 to-orange-500 bg-clip-text text-transparent">
              Warrior Leaderboard
            </h1>
            <Trophy className="h-8 w-8 text-yellow-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Compete with fellow warriors and climb the ranks by completing quests, maintaining streaks, and earning XP!
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            {userRank && (
              <Badge variant="outline" className="text-sm animate-scale-in">
                <TrendingUp className="h-4 w-4 mr-1" />
                Your Current Rank: #{userRank}
              </Badge>
            )}
            <Badge variant="secondary" className="text-sm">
              <Users className="h-4 w-4 mr-1" />
              {leaderboardData.length} Warriors
            </Badge>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-card p-4 rounded-lg border animate-slide-in-right">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search warriors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 transition-all duration-200 focus:ring-2 focus:ring-primary"
              />
            </div>
            
            <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="total_xp">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4" />
                    Total XP
                  </div>
                </SelectItem>
                <SelectItem value="level">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Level
                  </div>
                </SelectItem>
                <SelectItem value="current_streak">
                  <div className="flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    Streak
                  </div>
                </SelectItem>
                <SelectItem value="completed_quests">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Quests
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterBy} onValueChange={(value: any) => setFilterBy(value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Filter..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="top10">Top 10</SelectItem>
                <SelectItem value="top50">Top 50</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            size="sm"
            className="hover-scale"
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
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
          {filteredData.length === 0 ? (
            <div className="text-center py-12 animate-fade-in">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No warriors found matching your criteria</p>
            </div>
          ) : (
            filteredData.map((entry, index) => {
              const actualRank = leaderboardData.findIndex(e => e.user_id === entry.user_id) + 1;
              const isCurrentUser = user && entry.user_id === user.id;
              
              return (
                <Card 
                  key={entry.user_id} 
                  className={`transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer animate-fade-in ${
                    isCurrentUser ? 'ring-2 ring-primary bg-primary/5' : ''
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => setSelectedUser(entry)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      {/* Rank */}
                      <div className="flex-shrink-0 w-12 flex justify-center">
                        <Tooltip>
                          <TooltipTrigger>
                            {getRankIcon(actualRank)}
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Rank #{actualRank}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* Avatar and Name */}
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <Avatar className="h-12 w-12 hover-scale">
                          <AvatarImage src={entry.profiles?.avatar_url} />
                          <AvatarFallback>
                            {getUserInitials(entry.profiles?.full_name || 'Unknown')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold truncate">
                              {entry.profiles?.full_name || 'Unknown Warrior'}
                            </h3>
                            {isCurrentUser && (
                              <Badge variant="secondary" className="text-xs">
                                You
                              </Badge>
                            )}
                          </div>
                          <Badge 
                            className={`text-xs text-white ${getRankBadgeColor(actualRank)}`}
                          >
                            {entry.rank_name}
                          </Badge>
                        </div>
                      </div>

                      {/* Stats */}
                      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 text-center">
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hover-scale">
                              <div className="text-lg font-bold text-blue-600">{entry.total_xp.toLocaleString()}</div>
                              <div className="text-xs text-muted-foreground">XP</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total Experience Points</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hover-scale">
                              <div className="text-lg font-bold text-purple-600">{entry.level}</div>
                              <div className="text-xs text-muted-foreground">Level</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Current Level</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hover-scale">
                              <div className="flex items-center justify-center gap-1">
                                <Flame className="h-4 w-4 text-orange-500" />
                                <span className="text-lg font-bold text-orange-600">{entry.current_streak}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">Streak</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Daily Streak</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hover-scale">
                              <div className="text-lg font-bold text-green-600">{entry.completed_quests}</div>
                              <div className="text-xs text-muted-foreground">Quests</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Completed Quests</p>
                          </TooltipContent>
                        </Tooltip>
                        
                        <Tooltip>
                          <TooltipTrigger>
                            <div className="hover-scale">
                              <div className="flex items-center justify-center gap-1">
                                <Coins className="h-4 w-4 text-yellow-500" />
                                <span className="text-lg font-bold text-yellow-600">{entry.total_coins}</span>
                              </div>
                              <div className="text-xs text-muted-foreground">Coins</div>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Total Coins Earned</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>

                      {/* View Profile Button */}
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button variant="ghost" size="sm" className="hover-scale">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>View Profile</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </CardContent>
                </Card>
              );
            })
          )}
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
    </TooltipProvider>
  );
};

export default LeaderboardPanel;
