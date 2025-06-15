
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sword, 
  Shield, 
  Target, 
  Trophy, 
  Calendar, 
  Users, 
  MessageSquare, 
  ChevronRight,
  Star,
  Flame,
  Zap,
  ArrowLeft,
  Sparkles,
  Crown,
  Coins,
  TrendingUp,
  Clock,
  CheckCircle2,
  Lock
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CDCMorningStrategyCard from "@/components/home/CDCMorningStrategyCard";
import OptionalAddOns from "@/components/home/OptionalAddOns";

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    level: 1,
    xp: 0,
    nextLevelXp: 100,
    streak: 0,
    completedQuests: 0,
    rank: "New Warrior",
    totalCoins: 0,
    weeklyProgress: 0
  });
  const [dailyQuests, setDailyQuests] = useState<any[]>([]);
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  // Load user's actual data from database
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setIsLoading(true);
        
        // Simulate loading with realistic data
        await new Promise(resolve => setTimeout(resolve, 800));
        
        setStats({
          level: 3,
          xp: 150,
          nextLevelXp: 200,
          streak: 5,
          completedQuests: 12,
          rank: "Rising Warrior",
          totalCoins: 450,
          weeklyProgress: 65
        });
        
        setDailyQuests([
          { 
            id: 1, 
            title: "Complete morning routine", 
            description: "Start your day with purpose and energy",
            xp: 50, 
            coins: 25,
            completed: true,
            difficulty: "easy"
          },
          { 
            id: 2, 
            title: "Focus session - 25 minutes", 
            description: "Deep work on your most important task",
            xp: 75, 
            coins: 40,
            completed: false,
            difficulty: "medium"
          },
          { 
            id: 3, 
            title: "Connect with community", 
            description: "Share insights or support a fellow warrior",
            xp: 30, 
            coins: 15,
            completed: true,
            difficulty: "easy"
          },
          { 
            id: 4, 
            title: "Evening reflection", 
            description: "Review your day and plan tomorrow",
            xp: 40, 
            coins: 20,
            completed: false,
            difficulty: "easy"
          },
          { 
            id: 5, 
            title: "Skill development", 
            description: "Learn something new for 20 minutes",
            xp: 100, 
            coins: 60,
            completed: false,
            difficulty: "hard",
            locked: false
          }
        ]);

        setWeeklyGoals([
          { 
            id: 1, 
            title: "Maintain 7-day streak", 
            progress: 5, 
            target: 7, 
            xp: 500,
            coins: 200
          },
          { 
            id: 2, 
            title: "Complete 20 focus sessions", 
            progress: 12, 
            target: 20,
            xp: 300,
            coins: 150
          },
          { 
            id: 3, 
            title: "Engage with 10 community posts", 
            progress: 7, 
            target: 10,
            xp: 200,
            coins: 100
          }
        ]);

        setAchievements([
          { title: "First Steps", description: "Complete your first task", icon: Target, earned: true, rarity: "common" },
          { title: "Team Player", description: "Make first community post", icon: Users, earned: true, rarity: "common" },
          { title: "Focus Master", description: "Complete 10 focus sessions", icon: Trophy, earned: false, rarity: "rare" },
          { title: "Week Warrior", description: "Maintain 7-day streak", icon: Flame, earned: false, rarity: "epic" },
          { title: "Wisdom Seeker", description: "Complete 5 learning sessions", icon: Sparkles, earned: false, rarity: "legendary" }
        ]);
      }
      setIsLoading(false);
    };

    loadUserData();
  }, [user]);

  const handleQuestComplete = (questId: number) => {
    setDailyQuests(prev => prev.map(quest => 
      quest.id === questId 
        ? { ...quest, completed: !quest.completed }
        : quest
    ));
    
    const quest = dailyQuests.find(q => q.id === questId);
    if (quest && !quest.completed) {
      setStats(prev => ({
        ...prev,
        xp: prev.xp + quest.xp,
        totalCoins: prev.totalCoins + quest.coins,
        completedQuests: prev.completedQuests + 1
      }));
      toast.success(`Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
        duration: 3000,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Link to="/dashboard">
                  <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                </Link>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                    <Sword className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">Warrior's Space</h1>
                    <p className="text-purple-300 text-sm">Loading your command center...</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-2 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isNewUser = stats.completedQuests === 0;
  const completedQuestsToday = dailyQuests.filter(q => q.completed).length;
  const totalQuestsToday = dailyQuests.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Enhanced Header */}
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Warrior's Space</h1>
                  <p className="text-purple-300 text-sm flex items-center gap-2">
                    <Flame className="h-4 w-4" />
                    {stats.streak} day streak • {completedQuestsToday}/{totalQuestsToday} quests today
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{stats.totalCoins}</span>
              </div>
              <Badge className="bg-purple-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Level {stats.level}
              </Badge>
              <Avatar>
                <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior"} />
                <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "W"}</AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Message for New Users */}
        {isNewUser && (
          <div className="mb-8">
            <Card className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 border-purple-700/30 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-6 w-6 text-yellow-400" />
                  Welcome to Your Warrior Journey!
                </CardTitle>
                <CardDescription className="text-purple-200">
                  You're about to embark on a transformative journey. Complete your first quest below to begin building your legacy.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Enhanced Stats & Features */}
          <div className="space-y-6">
            {/* Enhanced Warrior Stats */}
            <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-purple-400" />
                  Warrior Stats
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">Rank</span>
                  <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
                    <Crown className="h-3 w-3 mr-1" />
                    {stats.rank}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-300">XP Progress</span>
                    <span>{stats.xp}/{stats.nextLevelXp}</span>
                  </div>
                  <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2" />
                  <div className="text-xs text-purple-400 mt-1">
                    {stats.nextLevelXp - stats.xp} XP to next level
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
                    <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                      <Flame className="h-5 w-5" />
                      {stats.streak}
                    </div>
                    <div className="text-xs text-orange-300">Day Streak</div>
                  </div>
                  <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                    <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                      <Trophy className="h-5 w-5" />
                      {stats.completedQuests}
                    </div>
                    <div className="text-xs text-green-300">Total Quests</div>
                  </div>
                </div>

                {/* Weekly Progress */}
                <div className="pt-2 border-t border-purple-800/30">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-300">Weekly Progress</span>
                    <span>{stats.weeklyProgress}%</span>
                  </div>
                  <Progress value={stats.weeklyProgress} className="h-2" />
                </div>
              </CardContent>
            </Card>

            {/* Optional Add-ons */}
            <OptionalAddOns />

            {/* Enhanced Quick Actions */}
            <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-yellow-400" />
                  Quick Actions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Link to="/dashboard?tab=calendar">
                  <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-white border-purple-600/30 transition-all duration-200 hover:scale-105">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Calendar
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/dashboard?tab=community">
                  <Button className="w-full justify-start bg-blue-600/20 hover:bg-blue-600/30 text-white border-blue-600/30 transition-all duration-200 hover:scale-105">
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/dashboard?tab=worldmap">
                  <Button className="w-full justify-start bg-green-600/20 hover:bg-green-600/30 text-white border-green-600/30 transition-all duration-200 hover:scale-105">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    World Map
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CDC Morning Strategy Card */}
            <CDCMorningStrategyCard />

            <Tabs value={activeQuest} onValueChange={setActiveQuest} className="w-full">
              <TabsList className="grid w-full grid-cols-4 bg-black/40 border-purple-800/30">
                <TabsTrigger value="daily-challenge" className="text-white data-[state=active]:bg-purple-600">
                  Daily Quests
                </TabsTrigger>
                <TabsTrigger value="weekly-goals" className="text-white data-[state=active]:bg-purple-600">
                  Weekly Goals
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-purple-600">
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-white data-[state=active]:bg-purple-600">
                  Progress
                </TabsTrigger>
              </TabsList>

              {/* Enhanced Daily Quests */}
              <TabsContent value="daily-challenge" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-400" />
                      Today's Quests
                      <Badge variant="secondary" className="ml-auto">
                        {completedQuestsToday}/{totalQuestsToday}
                      </Badge>
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Complete your daily challenges to earn XP, coins, and maintain your streak
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dailyQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className={`group relative p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
                          quest.completed
                            ? "bg-green-900/20 border-green-700/30"
                            : quest.locked
                            ? "bg-gray-900/20 border-gray-700/30 opacity-50"
                            : "bg-purple-900/20 border-purple-700/30 hover:border-purple-600/50"
                        }`}
                        onClick={() => !quest.locked && handleQuestComplete(quest.id)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div
                              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
                                quest.completed
                                  ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                                  : quest.locked
                                  ? "border-gray-500"
                                  : "border-purple-400 group-hover:border-purple-300"
                              }`}
                            >
                              {quest.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
                              {quest.locked && <Lock className="h-4 w-4 text-gray-400" />}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-semibold ${quest.completed ? "line-through text-green-300" : ""}`}>
                                  {quest.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    quest.difficulty === 'easy' ? 'border-green-500 text-green-400' :
                                    quest.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                                    'border-red-500 text-red-400'
                                  }`}
                                >
                                  {quest.difficulty}
                                </Badge>
                              </div>
                              <p className="text-sm text-purple-300 mb-2">{quest.description}</p>
                              <div className="flex items-center gap-4">
                                <div className="flex items-center gap-1 text-blue-400">
                                  <Star className="h-3 w-3" />
                                  <span className="text-xs">+{quest.xp} XP</span>
                                </div>
                                <div className="flex items-center gap-1 text-yellow-400">
                                  <Coins className="h-3 w-3" />
                                  <span className="text-xs">+{quest.coins} coins</span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* New Weekly Goals Tab */}
              <TabsContent value="weekly-goals" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-blue-400" />
                      Weekly Goals
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Long-term objectives to build lasting habits and earn bigger rewards
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {weeklyGoals.map((goal) => (
                      <div
                        key={goal.id}
                        className="p-4 rounded-lg border bg-blue-900/20 border-blue-700/30 transition-all duration-200 hover:scale-[1.02]"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-semibold">{goal.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="border-blue-500 text-blue-400">
                              {goal.progress}/{goal.target}
                            </Badge>
                          </div>
                        </div>
                        <Progress value={(goal.progress / goal.target) * 100} className="h-2 mb-3" />
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1 text-blue-400">
                              <Star className="h-3 w-3" />
                              <span>+{goal.xp} XP</span>
                            </div>
                            <div className="flex items-center gap-1 text-yellow-400">
                              <Coins className="h-3 w-3" />
                              <span>+{goal.coins} coins</span>
                            </div>
                          </div>
                          <div className="text-sm text-purple-300">
                            {Math.round((goal.progress / goal.target) * 100)}% complete
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Achievements */}
              <TabsContent value="achievements" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Unlock badges and earn recognition for your accomplishments
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {achievements.map((achievement, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                            achievement.earned
                              ? "bg-yellow-900/20 border-yellow-700/30"
                              : "bg-gray-900/20 border-gray-700/30"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <achievement.icon
                              className={`h-8 w-8 transition-all duration-200 ${
                                achievement.earned ? "text-yellow-400" : "text-gray-500"
                              }`}
                            />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className={`font-semibold ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`}>
                                  {achievement.title}
                                </h4>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${
                                    achievement.rarity === 'common' ? 'border-gray-500 text-gray-400' :
                                    achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                                    achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                                    'border-yellow-500 text-yellow-400'
                                  }`}
                                >
                                  {achievement.rarity}
                                </Badge>
                              </div>
                              <p className="text-sm text-purple-300">{achievement.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Enhanced Progress Tab */}
              <TabsContent value="progress" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Star className="h-5 w-5 text-purple-400" />
                      Your Journey
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Track your progress and see how far you've come
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="text-center py-8">
                      <div className="text-6xl font-bold text-purple-400 mb-2">{stats.level}</div>
                      <div className="text-purple-300 mb-4">Current Level</div>
                      <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="w-full max-w-md mx-auto" />
                      <div className="text-sm text-purple-300 mt-2">
                        {stats.nextLevelXp - stats.xp} XP to next level
                      </div>
                    </div>

                    {/* Progress Statistics */}
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
                        <div className="text-2xl font-bold text-blue-400">{stats.weeklyProgress}%</div>
                        <div className="text-xs text-blue-300">Weekly Progress</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
