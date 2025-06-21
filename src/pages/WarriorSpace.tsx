
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
        // Simulate loading with better error handling
        try {
          await new Promise(resolve => setTimeout(resolve, 300));
          
          setWeeklyGoals([
            { 
              id: 1, 
              title: "Maintain 7-day streak", 
              progress: Math.min(progress.streak, 7), 
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
              progress: Math.min(progress.weeklyXp || 0, 500), 
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
        } catch (error) {
          console.error('Error loading user data:', error);
        }
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

  // Close sidebar when clicking outside on mobile
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
      {/* Enhanced Background Effects */}
      <div className="absolute inset-0">
        {/* Main gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-900/40 via-slate-900 to-slate-900"></div>
        
        {/* Grid pattern - simplified to avoid quote escaping issues */}
        <div className="absolute inset-0 opacity-10">
          <div className="h-full w-full bg-[linear-gradient(rgba(148,163,184,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.1)_1px,transparent_1px)] bg-[size:32px_32px]"></div>
        </div>
        
        {/* Floating orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse opacity-70"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 opacity-70"></div>
        <div className="absolute top-3/4 left-1/3 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-2000 opacity-50"></div>
        
        {/* Animated particles */}
        <div className="absolute inset-0">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-purple-400/20 rounded-full animate-pulse"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>
      
      <div className="relative z-10">
        <WarriorSpaceHeader progress={progress} />

        <div className="container mx-auto px-4 py-6 lg:py-8 max-w-7xl">
          {isNewUser && <WelcomeBanner />}

          <WarriorSpaceMobileSidebar 
            sidebarOpen={sidebarOpen}
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
            {/* Enhanced Sidebar */}
            <div className={`lg:col-span-4 xl:col-span-3 transition-all duration-300 ease-in-out ${
              sidebarOpen ? 'block' : 'hidden lg:block'
            }`}>
              <div className="sticky top-6 space-y-6">
                <WarriorSpaceSidebar
                  progress={progress}
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
                  sidebarOpen={sidebarOpen}
                />
              </div>
            </div>

            {/* Enhanced Main Content */}
            <div className="lg:col-span-8 xl:col-span-9">
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

      {/* Enhanced Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden transition-all duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default WarriorSpace;
