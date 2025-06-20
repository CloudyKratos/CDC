
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Users, Flame, Sparkles, Trophy, Calendar, MessageSquare, BookOpen, ArrowLeft, Sword, ChevronDown, ChevronUp, Menu, X } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import CDCMorningStrategyCard from "@/components/home/CDCMorningStrategyCard";
import OptionalAddOns from "@/components/home/OptionalAddOns";
import WarriorHeader from "@/components/warrior/WarriorHeader";
import WarriorStatsPanel from "@/components/warrior/WarriorStatsPanel";
import QuickActionsPanel from "@/components/warrior/QuickActionsPanel";
import QuestsList from "@/components/warrior/QuestsList";
import WeeklyGoalsPanel from "@/components/warrior/WeeklyGoalsPanel";
import AchievementsPanel from "@/components/warrior/AchievementsPanel";
import ProgressPanel from "@/components/warrior/ProgressPanel";
import WelcomeBanner from "@/components/warrior/WelcomeBanner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDailyQuests } from "@/hooks/useDailyQuests";
import { useXpProgress } from "@/hooks/useXpProgress";

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [isLoading, setIsLoading] = useState(true);
  const [questSearch, setQuestSearch] = useState("");
  const [questFilter, setQuestFilter] = useState("all");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    stats: false,
    quickActions: false,
    addOns: true // Start with add-ons collapsed to save space
  });

  // Use the new hooks
  const { quests, toggleQuestCompletion, getQuestStats } = useDailyQuests();
  const { progress, addXp } = useXpProgress();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  // Load initial data
  useEffect(() => {
    const loadUserData = async () => {
      if (user) {
        setIsLoading(true);
        
        // Simulate loading
        await new Promise(resolve => setTimeout(resolve, 800));
        
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
      setIsLoading(false);
    };

    loadUserData();
  }, [user, progress]);

  const handleQuestComplete = (questId: number) => {
    const updatedQuests = toggleQuestCompletion(questId);
    const quest = updatedQuests.find(q => q.id === questId);
    
    if (quest && quest.completed) {
      // Add XP and coins
      const newProgress = addXp(quest.xp, quest.coins);
      
      // Check for level up
      if (newProgress.level > progress.level) {
        toast.success(`🎉 LEVEL UP! You're now Level ${newProgress.level}!`, {
          duration: 6000,
        });
      } else {
        toast.success(`🎉 Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
          duration: 4000,
        });
      }
    } else if (quest && !quest.completed) {
      toast.info("Quest marked as incomplete", {
        duration: 2000,
      });
    }
  };

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const filteredQuests = quests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(questSearch.toLowerCase()) ||
                         quest.description.toLowerCase().includes(questSearch.toLowerCase());
    const matchesFilter = questFilter === "all" || 
                         (questFilter === "completed" && quest.completed) ||
                         (questFilter === "pending" && !quest.completed) ||
                         (questFilter === quest.difficulty) ||
                         (questFilter === quest.category);
    return matchesSearch && matchesFilter;
  });

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

  const isNewUser = progress.completedQuests === 0;
  const questStats = getQuestStats();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <WarriorHeader 
        stats={{
          streak: progress.streak,
          level: progress.level,
          totalCoins: progress.totalCoins
        }}
        progressPercentage={questStats.progressPercentage}
        completedQuestsToday={questStats.completed}
        totalQuestsToday={questStats.total}
      />

      <div className="container mx-auto px-4 py-8">
        {isNewUser && <WelcomeBanner />}

        {/* Mobile Sidebar Toggle */}
        <div className="lg:hidden mb-6">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white flex items-center justify-center gap-2"
          >
            {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            {sidebarOpen ? "Close Menu" : "Open Menu"}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Sidebar */}
          <div className={`space-y-6 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <WarriorStatsPanel 
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

            <QuickActionsPanel 
              isCollapsed={collapsedSections.quickActions}
              onToggle={() => toggleSection('quickActions')}
            />

            {/* Optional Add-ons */}
            <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Plus className="h-5 w-5 text-green-400" />
                    Enhancements
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => toggleSection('addOns')}
                    className="h-6 w-6 text-purple-300 hover:text-white"
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

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            <CDCMorningStrategyCard />

            <Tabs value={activeQuest} onValueChange={setActiveQuest} className="w-full">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-black/40 border-purple-800/30 h-auto p-1">
                <TabsTrigger 
                  value="daily-challenge" 
                  className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 text-sm"
                >
                  <Target className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Daily Quests</span>
                  <span className="sm:hidden">Quests</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="weekly-goals" 
                  className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 text-sm"
                >
                  <Calendar className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Weekly Goals</span>
                  <span className="sm:hidden">Goals</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="achievements" 
                  className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 text-sm"
                >
                  <Trophy className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Achievements</span>
                  <span className="sm:hidden">Awards</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className="text-white data-[state=active]:bg-purple-600 data-[state=active]:text-white py-3 text-sm"
                >
                  <Sparkles className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Progress</span>
                  <span className="sm:hidden">Stats</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="daily-challenge" className="space-y-4 mt-6">
                <QuestsList 
                  quests={filteredQuests}
                  onQuestComplete={handleQuestComplete}
                  searchTerm={questSearch}
                  onSearchChange={setQuestSearch}
                  filter={questFilter}
                  onFilterChange={setQuestFilter}
                  completedCount={questStats.completed}
                  totalCount={questStats.total}
                />
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
