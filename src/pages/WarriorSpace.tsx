import React, { useState, useEffect } from "react";
import { Target, Users, Flame, Sparkles, Trophy, Shield, Zap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import WelcomeBanner from "@/components/warrior/WelcomeBanner";
import WarriorSpaceHeader from "@/components/warrior/WarriorSpaceHeader";
import WarriorSpaceSidebar from "@/components/warrior/WarriorSpaceSidebar";
import WarriorSpaceMainContent from "@/components/warrior/WarriorSpaceMainContent";
import WarriorSpaceLoadingState from "@/components/warrior/WarriorSpaceLoadingState";
import WarriorSpaceErrorState from "@/components/warrior/WarriorSpaceErrorState";
import WarriorSpaceMobileSidebar from "@/components/warrior/WarriorSpaceMobileSidebar";
import MorningPictureUpload from "@/components/warrior/MorningPictureUpload";

const WarriorSpace = () => {
  const { user } = useAuth();
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState({
    stats: false,
    quickActions: false,
    addOns: true
  });

  const { progress, isLoading, error, getRank } = useWarriorProgress();

  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  // Enhanced data loading with better error handling
  useEffect(() => {
    const loadUserData = async () => {
      if (user && !isLoading) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Enhanced weekly goals with dynamic progress
          setWeeklyGoals([
            { 
              id: 1, 
              title: "Maintain 7-day streak", 
              progress: Math.min(progress.streak, 7), 
              target: 7, 
              xp: 500,
              coins: 200,
              type: "streak",
              icon: Flame,
              color: "orange"
            },
            { 
              id: 2, 
              title: "Complete 20 focus sessions", 
              progress: Math.min(progress.completedQuests, 20), 
              target: 20,
              xp: 300,
              coins: 150,
              type: "quests",
              icon: Target,
              color: "blue"
            },
            { 
              id: 3, 
              title: "Earn 500 XP this week", 
              progress: Math.min(progress.weeklyXp || 0, 500), 
              target: 500,
              xp: 200,
              coins: 100,
              type: "xp",
              icon: Sparkles,
              color: "purple"
            },
            {
              id: 4,
              title: "Level up this week",
              progress: progress.level > 1 ? 1 : 0,
              target: 1,
              xp: 750,
              coins: 300,
              type: "level",
              icon: Shield,
              color: "green"
            }
          ]);

          // Enhanced achievements with visual indicators
          const rankData = getRank(progress.totalXp);
          setAchievements([
            { 
              title: "First Steps", 
              description: "Complete your first task", 
              icon: Target, 
              earned: progress.completedQuests > 0, 
              rarity: "common",
              color: "gray",
              progress: Math.min(progress.completedQuests, 1),
              target: 1
            },
            { 
              title: "Team Player", 
              description: "Join the community", 
              icon: Users, 
              earned: true, 
              rarity: "common",
              color: "blue",
              progress: 1,
              target: 1
            },
            { 
              title: "Focus Master", 
              description: "Complete 10 focus sessions", 
              icon: Trophy, 
              earned: progress.completedQuests >= 10, 
              rarity: "rare",
              color: "purple",
              progress: Math.min(progress.completedQuests, 10),
              target: 10
            },
            { 
              title: "Week Warrior", 
              description: "Maintain 7-day streak", 
              icon: Flame, 
              earned: progress.streak >= 7, 
              rarity: "epic",
              color: "orange",
              progress: Math.min(progress.streak, 7),
              target: 7
            },
            { 
              title: "XP Hunter", 
              description: "Earn 1000+ total XP", 
              icon: Sparkles, 
              earned: progress.totalXp >= 1000, 
              rarity: "legendary",
              color: "yellow",
              progress: Math.min(progress.totalXp, 1000),
              target: 1000
            },
            {
              title: "Elite Warrior",
              description: "Reach Elite rank",
              icon: Shield,
              earned: progress.totalXp >= 700,
              rarity: "epic",
              color: "purple",
              progress: Math.min(progress.totalXp, 700),
              target: 700
            }
          ]);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user, progress, isLoading, getRank]);

  const toggleSection = (section: keyof typeof collapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // Enhanced responsive handler
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (isLoading) {
    return <WarriorSpaceLoadingState />;
  }

  if (error) {
    return <WarriorSpaceErrorState error={error} />;
  }

  const isNewUser = progress.completedQuests === 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
      {/* Enhanced Background Effects with better performance */}
      <div className="absolute inset-0">
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-slate-900/60 to-blue-900/20 animate-pulse"></div>
        
        {/* Enhanced grid pattern */}
        <div className="absolute inset-0 opacity-[0.05]">
          <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent bg-[size:50px_50px]"></div>
        </div>
        
        {/* Dynamic floating orbs with staggered animations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-70 transition-all duration-[3s]"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse opacity-70 transition-all duration-[4s] delay-1000"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse opacity-50 transition-all duration-[5s] delay-2000"></div>
        <div className="absolute top-1/2 right-1/2 w-48 h-48 bg-green-500/10 rounded-full blur-3xl animate-pulse opacity-60 transition-all duration-[3.5s] delay-500"></div>
        
        {/* Enhanced animated particles */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-purple-400/30 rounded-full animate-pulse"
              style={{
                top: `${10 + (i * 12)}%`,
                left: `${5 + (i * 11)}%`,
                animationDelay: `${i * 0.5}s`,
                animationDuration: `${2 + (i % 3)}s`
              }}
            />
          ))}
        </div>
        
        {/* Subtle moving gradient lines */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-purple-500 to-transparent animate-pulse"></div>
          <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent animate-pulse delay-1000"></div>
        </div>
      </div>
      
      <div className="relative z-10">
        <WarriorSpaceHeader progress={progress} />

        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {isNewUser && <WelcomeBanner />}

          {/* Morning Picture Upload - Show prominently for new feature */}
          <div className="mb-6">
            <MorningPictureUpload />
          </div>

          <WarriorSpaceMobileSidebar 
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Enhanced Sidebar with better animations */}
            <div className={`lg:col-span-4 xl:col-span-3 transition-all duration-500 ease-in-out transform ${
              sidebarOpen ? 'translate-x-0 opacity-100' : '-translate-x-full opacity-0 lg:translate-x-0 lg:opacity-100'
            } lg:block`}>
              <div className="sticky top-6 space-y-6">
                <WarriorSpaceSidebar
                  progress={progress}
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
                  sidebarOpen={sidebarOpen}
                />
              </div>
            </div>

            {/* Enhanced Main Content with better transitions */}
            <div className="lg:col-span-8 xl:col-span-9 transition-all duration-300">
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
      </div>

      {/* Enhanced Mobile overlay with better backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-md z-40 lg:hidden transition-all duration-500"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Progress save indicator */}
      <div className="fixed bottom-4 right-4 z-50">
        <div className="bg-green-600/20 border border-green-500/30 text-green-400 px-3 py-1 rounded-full text-xs backdrop-blur-sm">
          <Zap className="h-3 w-3 inline mr-1" />
          Auto-saving progress
        </div>
      </div>
    </div>
  );
};

export default WarriorSpace;
