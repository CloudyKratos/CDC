
import React, { useState, useEffect } from "react";
import { Target, Users, Flame, Sparkles, Trophy } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import WelcomeBanner from "@/components/warrior/WelcomeBanner";
import WarriorSpaceHeader from "@/components/warrior/WarriorSpaceHeader";
import WarriorSpaceSidebar from "@/components/warrior/WarriorSpaceSidebar";
import WarriorSpaceMainContent from "@/components/warrior/WarriorSpaceMainContent";
import WarriorSpaceLoadingState from "@/components/warrior/WarriorSpaceLoadingState";
import WarriorSpaceErrorState from "@/components/warrior/WarriorSpaceErrorState";
import WarriorSpaceMobileSidebar from "@/components/warrior/WarriorSpaceMobileSidebar";

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
    return <WarriorSpaceLoadingState />;
  }

  if (error) {
    return <WarriorSpaceErrorState error={error} />;
  }

  const isNewUser = progress.completedQuests === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <WarriorSpaceHeader progress={progress} />

      <div className="container mx-auto px-4 py-8">
        {isNewUser && <WelcomeBanner />}

        <WarriorSpaceMobileSidebar 
          sidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <WarriorSpaceSidebar
            progress={progress}
            collapsedSections={collapsedSections}
            onToggleSection={toggleSection}
            sidebarOpen={sidebarOpen}
          />

          <WarriorSpaceMainContent
            activeQuest={activeQuest}
            onActiveQuestChange={setActiveQuest}
            weeklyGoals={weeklyGoals}
            achievements={achievements}
            progress={progress}
          />
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
