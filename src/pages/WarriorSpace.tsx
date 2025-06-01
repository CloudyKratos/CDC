
import React, { useState } from "react";
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
  ArrowLeft
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import CDCMorningStrategyCard from "@/components/home/CDCMorningStrategyCard";
import OptionalAddOns from "@/components/home/OptionalAddOns";

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");

  const stats = {
    level: 15,
    xp: 2450,
    nextLevelXp: 3000,
    streak: 7,
    completedQuests: 42,
    rank: "Elite Warrior"
  };

  const dailyQuests = [
    { id: 1, title: "Complete Morning Routine", xp: 50, completed: true },
    { id: 2, title: "Focus Session (25 min)", xp: 75, completed: true },
    { id: 3, title: "Connect with Team", xp: 30, completed: false },
    { id: 4, title: "Evening Reflection", xp: 40, completed: false }
  ];

  const achievements = [
    { title: "Week Warrior", description: "7-day streak", icon: Flame, earned: true },
    { title: "Team Player", description: "50 team interactions", icon: Users, earned: true },
    { title: "Focus Master", description: "100 focus sessions", icon: Target, earned: false },
    { title: "Quest Crusher", description: "Complete 100 quests", icon: Trophy, earned: false }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
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
                  <p className="text-purple-300 text-sm">Your personal command center</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
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
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Stats & Optional Add-ons */}
          <div className="space-y-6">
            {/* Warrior Stats */}
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
                    {stats.rank}
                  </Badge>
                </div>
                
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-purple-300">XP Progress</span>
                    <span>{stats.xp}/{stats.nextLevelXp}</span>
                  </div>
                  <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 pt-2">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-400">{stats.streak}</div>
                    <div className="text-xs text-purple-300">Day Streak</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-400">{stats.completedQuests}</div>
                    <div className="text-xs text-purple-300">Quests Done</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Optional Add-ons */}
            <OptionalAddOns />

            {/* Quick Actions */}
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
                  <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-white border-purple-600/30 transition-all duration-200 hover:scale-105">
                    <Users className="h-4 w-4 mr-2" />
                    Join Community
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
                
                <Link to="/dashboard?tab=worldmap">
                  <Button className="w-full justify-start bg-purple-600/20 hover:bg-purple-600/30 text-white border-purple-600/30 transition-all duration-200 hover:scale-105">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    World Map
                    <ChevronRight className="h-4 w-4 ml-auto" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* Center Column - Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* CDC Morning Strategy Card */}
            <CDCMorningStrategyCard />

            <Tabs value={activeQuest} onValueChange={setActiveQuest} className="w-full">
              <TabsList className="grid w-full grid-cols-3 bg-black/40 border-purple-800/30">
                <TabsTrigger value="daily-challenge" className="text-white data-[state=active]:bg-purple-600">
                  Today's Quests
                </TabsTrigger>
                <TabsTrigger value="achievements" className="text-white data-[state=active]:bg-purple-600">
                  Achievements
                </TabsTrigger>
                <TabsTrigger value="progress" className="text-white data-[state=active]:bg-purple-600">
                  Progress
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily-challenge" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Target className="h-5 w-5 text-green-400" />
                      Today's Quests
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Complete your daily challenges to earn XP and maintain your streak
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dailyQuests.map((quest) => (
                      <div
                        key={quest.id}
                        className={`flex items-center justify-between p-3 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                          quest.completed
                            ? "bg-green-900/20 border-green-700/30"
                            : "bg-purple-900/20 border-purple-700/30"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-4 h-4 rounded-full border-2 transition-all duration-200 ${
                              quest.completed
                                ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                                : "border-purple-400"
                            }`}
                          />
                          <span className={quest.completed ? "line-through text-green-300" : ""}>
                            {quest.title}
                          </span>
                        </div>
                        <Badge variant={quest.completed ? "default" : "secondary"}>
                          +{quest.xp} XP
                        </Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-yellow-400" />
                      Achievements
                    </CardTitle>
                    <CardDescription className="text-purple-300">
                      Unlock badges and rewards for your accomplishments
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
                            <div>
                              <h4 className={`font-semibold ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`}>
                                {achievement.title}
                              </h4>
                              <p className="text-sm text-purple-300">{achievement.description}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

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
