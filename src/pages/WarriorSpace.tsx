import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Target, Users, Flame, Sparkles, Trophy, Calendar, MessageSquare, BookOpen, ArrowLeft, Sword, ChevronDown, ChevronUp } from "lucide-react";
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

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [isLoading, setIsLoading] = useState(true);
  const [questSearch, setQuestSearch] = useState("");
  const [questFilter, setQuestFilter] = useState("all");
  const [collapsedSections, setCollapsedSections] = useState({
    stats: false,
    quickActions: false,
    addOns: false
  });
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
            difficulty: "easy",
            category: "wellness",
            estimatedTime: "10 min"
          },
          { 
            id: 2, 
            title: "Focus session - 25 minutes", 
            description: "Deep work on your most important task",
            xp: 75, 
            coins: 40,
            completed: false,
            difficulty: "medium",
            category: "productivity",
            estimatedTime: "25 min"
          },
          { 
            id: 3, 
            title: "Connect with community", 
            description: "Share insights or support a fellow warrior",
            xp: 30, 
            coins: 15,
            completed: true,
            difficulty: "easy",
            category: "social",
            estimatedTime: "5 min"
          },
          { 
            id: 4, 
            title: "Evening reflection", 
            description: "Review your day and plan tomorrow",
            xp: 40, 
            coins: 20,
            completed: false,
            difficulty: "easy",
            category: "wellness",
            estimatedTime: "15 min"
          },
          { 
            id: 5, 
            title: "Skill development", 
            description: "Learn something new for 20 minutes",
            xp: 100, 
            coins: 60,
            completed: false,
            difficulty: "hard",
            category: "learning",
            estimatedTime: "20 min",
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
      toast.success(`🎉 Quest completed! +${quest.xp} XP, +${quest.coins} coins`, {
        duration: 4000,
      });
    } else if (quest && quest.completed) {
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

  const filteredQuests = dailyQuests.filter(quest => {
    const matchesSearch = quest.title.toLowerCase().includes(questSearch.toLowerCase()) ||
                         quest.description.toLowerCase().includes(questSearch.toLowerCase());
    const matchesFilter = questFilter === "all" || 
                         (questFilter === "completed" && quest.completed) ||
                         (questFilter === "pending" && !quest.completed) ||
                         (questFilter === quest.difficulty) ||
                         (questFilter === quest.category);
    return matchesSearch && matchesFilter;
  });

  const quickActions = [
    { icon: Calendar, label: "Calendar", path: "/dashboard?tab=calendar", color: "purple" },
    { icon: Users, label: "Community", path: "/dashboard?tab=community", color: "blue" },
    { icon: MessageSquare, label: "World Map", path: "/dashboard?tab=worldmap", color: "green" },
    { icon: BookOpen, label: "Learning", path: "/dashboard?tab=command-room", color: "orange" }
  ];

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
  const progressPercentage = (completedQuestsToday / totalQuestsToday) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <WarriorHeader 
        stats={stats}
        progressPercentage={progressPercentage}
        completedQuestsToday={completedQuestsToday}
        totalQuestsToday={totalQuestsToday}
      />

      <div className="container mx-auto px-4 py-8">
        {isNewUser && <WelcomeBanner />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Collapsible Sections */}
          <div className="space-y-6">
            <WarriorStatsPanel 
              stats={stats}
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
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="h-5 w-5 text-green-400" />
                    Optional Add-ons
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

          {/* Center Column - Enhanced Main Content */}
          <div className="lg:col-span-2 space-y-6">
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

              <TabsContent value="daily-challenge" className="space-y-4">
                <QuestsList 
                  quests={filteredQuests}
                  onQuestComplete={handleQuestComplete}
                  searchTerm={questSearch}
                  onSearchChange={setQuestSearch}
                  filter={questFilter}
                  onFilterChange={setQuestFilter}
                  completedCount={completedQuestsToday}
                  totalCount={totalQuestsToday}
                />
              </TabsContent>

              <TabsContent value="weekly-goals" className="space-y-4">
                <WeeklyGoalsPanel goals={weeklyGoals} />
              </TabsContent>

              <TabsContent value="achievements" className="space-y-4">
                <AchievementsPanel achievements={achievements} />
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <ProgressPanel stats={stats} />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
