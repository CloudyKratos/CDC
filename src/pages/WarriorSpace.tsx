
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Users, Flame, Sparkles, Trophy, Calendar, ArrowLeft, Sword, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CDCMorningStrategyCard from "@/components/home/CDCMorningStrategyCard";
import OptionalAddOns from "@/components/home/OptionalAddOns";
import ResponsiveWarriorHeader from "@/components/warrior/ResponsiveWarriorHeader";
import EnhancedStatsCard from "@/components/warrior/EnhancedStatsCard";
import ImprovedQuickActionsPanel from "@/components/warrior/ImprovedQuickActionsPanel";
import WeeklyGoalsPanel from "@/components/warrior/WeeklyGoalsPanel";
import AchievementsPanel from "@/components/warrior/AchievementsPanel";
import ProgressPanel from "@/components/warrior/ProgressPanel";
import WelcomeBanner from "@/components/warrior/WelcomeBanner";
import StableQuestManager from "@/components/warrior/StableQuestManager";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    stats: false,
    quickActions: false,
    addOns: true
  });

  const { progress, isLoading, error } = useWarriorProgress();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !isLoading) {
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 500));
        
        setWeeklyGoals([
          { 
            id: 1, 
            title: "Maintain 7-day streak", 
            progress: progress.streak, 
            target: 7, 
            xp: 500,
            coins: 200
          },
          { 
            id: 2, 
            title: "Complete 20 focus sessions", 
            progress: Math.min(progress.completedQuests, 20), 
            target: 20,
            xp: 300,
            coins: 150
          },
          { 
            id: 3, 
            title: "Earn 500 XP this week", 
            progress: progress.weeklyXp, 
            target: 500,
            xp: 200,
            coins: 100
          }
        ]);

        setAchievements([
          { title: "First Steps", description: "Complete your first task", icon: Target, earned: progress.completedQuests > 0, rarity: "common" },
          { title: "Team Player", description: "Make first community post", icon: Users, earned: true, rarity: "common" },
          { title: "Focus Master", description: "Complete 10 focus sessions", icon: Trophy, earned: progress.completedQuests >= 10, rarity: "rare" },
          { title: "Week Warrior", description: "Maintain 7-day streak", icon: Flame, earned: progress.streak >= 7, rarity: "epic" },
          { title: "XP Hunter", description: "Earn 1000+ total XP", icon: Sparkles, earned: progress.totalXp >= 1000, rarity: "legendary" }
        ]);
      }
    };

    loadUserData();
  }, [user, progress, isLoading]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
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
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="space-y-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-48 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
            <div className="lg:col-span-3 space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-64 bg-black/40 border-purple-800/30 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Card className="bg-red-900/30 border-red-800/40 text-white backdrop-blur-sm shadow-xl max-w-md mx-4">
          <CardHeader>
            <CardTitle className="text-red-400">Error Loading Warrior Space</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-300 mb-4">{error}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="w-full bg-red-600 hover:bg-red-700"
            >
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isNewUser = progress.completedQuests === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <ResponsiveWarriorHeader 
        stats={{
          streak: progress.streak,
          level: progress.level,
          totalCoins: progress.totalCoins
        }}
        progressPercentage={Math.min((progress.completedQuests / 7) * 100, 100)}
        completedQuestsToday={progress.completedQuests}
        totalQuestsToday={7}
      />

      <div className="container mx-auto px-4 py-8">
        {isNewUser && <WelcomeBanner />}

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white flex items-center justify-center gap-2 shadow-lg"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen ? "Close Menu" : "Open Dashboard"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Enhanced Left Sidebar */}
          <div className={`space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <EnhancedStatsCard 
              stats={{
                level: progress.level,
                xp: progress.currentXp,
                nextLevelXp: progress.nextLevelXp,
                streak: progress.streak,
                completedQuests: progress.completedQuests,
                rank: progress.rank,
                weeklyProgress: progress.weeklyProgress
              }}
              isCollapsed={collapsedSections.stats}
              onToggle={() => toggleSection('stats')}
            />

            <ImprovedQuickActionsPanel 
              isCollapsed={collapsedSections.quickActions}
              onToggle={() => toggleSection('quickActions')}
            />

            <Card className="bg-gradient-to-br from-black/50 to-green-900/30 border-green-800/40 text-white backdrop-blur-sm shadow-xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5 text-green-400" />
                    Power-Ups
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSection('addOns')}
                    className="h-6 w-6 text-green-300 hover:text-white transition-colors"
                  >
                    {collapsedSections.addOns ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
                  </Button>
                </div>
              </CardHeader>
              {!collapsedSections.addOns && (
                <CardContent>
                  <OptionalAddOns />
                </CardContent>
              )}
            </Card>
          </div>

          {/* Enhanced Main Content */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/30 p-1">
              <CDCMorningStrategyCard />
            </div>

            <Tabs value={activeQuest} onValueChange={setActiveQuest} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-black/50 border-purple-800/40 h-auto p-1 backdrop-blur-sm">
                <TabsTrigger 
                  value="daily-challenge" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Daily Quests</span>
                  <span className="sm:hidden">Quests</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly-goals" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Weekly Goals</span>
                  <span className="sm:hidden">Goals</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Achievements</span>
                  <span className="sm:hidden">Awards</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Progress</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily-challenge" className="space-y-4 mt-6">
                <StableQuestManager />
              </TabsContent>

              <TabsContent value="weekly-goals" className="space-y-4 mt-6">
                <WeeklyGoalsPanel goals={weeklyGoals} />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4 mt-6">
                <AchievementsPanel achievements={achievements} />
              </TabsContent>

              <TabsContent value="progress" className="space-y-4 mt-6">
                <ProgressPanel stats={{
                  level: progress.level,
                  xp: progress.currentXp,
                  nextLevelXp: progress.nextLevelXp,
                  streak: progress.streak,
                  completedQuests: progress.completedQuests,
                  totalCoins: progress.totalCoins,
                  weeklyProgress: progress.weeklyProgress
                }} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
