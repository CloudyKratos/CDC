
import React, { useState } from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import WarriorSpaceHeader from "./WarriorSpaceHeader";
import WarriorSpaceMainContent from "./WarriorSpaceMainContent";
import WarriorSpaceSidebar from "./WarriorSpaceSidebar";
import WarriorSpaceMobileSidebar from "./WarriorSpaceMobileSidebar";

interface CollapsedSections {
  stats: boolean;
  quickActions: boolean;
  addOns: boolean;
}

interface WarriorSpaceLayoutProps {
  progress: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    rank: string;
    weeklyProgress: number;
    dailyQuestProgress: number;
    weeklyQuestTarget: number;
    totalCoins: number;
  };
  weeklyGoals: any[];
  achievements: any[];
}

const WarriorSpaceLayout = ({ progress, weeklyGoals, achievements }: WarriorSpaceLayoutProps) => {
  const [activeQuest, setActiveQuest] = useState("daily-challenge");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [collapsedSections, setCollapsedSections] = useState<CollapsedSections>({
    stats: false,
    quickActions: false,
    addOns: false,
  });

  const isMobile = useIsMobile();

  const handleToggleSection = (section: keyof CollapsedSections) => {
    setCollapsedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleToggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  // Close sidebar when clicking outside on mobile
  const handleBackdropClick = () => {
    if (isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 md:w-64 md:h-64 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 md:w-48 md:h-48 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 right-1/3 w-16 h-16 md:w-32 md:h-32 bg-indigo-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header */}
      <WarriorSpaceHeader progress={progress} />

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6 relative z-10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile Sidebar Toggle */}
          <div className="lg:hidden">
            <WarriorSpaceMobileSidebar 
              sidebarOpen={sidebarOpen}
              onToggleSidebar={handleToggleSidebar}
            />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <WarriorSpaceMainContent
              activeQuest={activeQuest}
              onActiveQuestChange={setActiveQuest}
              weeklyGoals={weeklyGoals}
              achievements={achievements}
              progress={progress}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block lg:w-80">
            <WarriorSpaceSidebar
              progress={progress}
              collapsedSections={collapsedSections}
              onToggleSection={handleToggleSection}
              sidebarOpen={true}
            />
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobile && sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
          />
          <div className="absolute inset-y-0 right-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-l border-purple-500/30 shadow-2xl overflow-y-auto">
            <div className="p-4">
              <WarriorSpaceSidebar
                progress={progress}
                collapsedSections={collapsedSections}
                onToggleSection={handleToggleSection}
                sidebarOpen={sidebarOpen}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WarriorSpaceLayout;
