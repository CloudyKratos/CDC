
import React from "react";
import WelcomeBanner from "@/components/warrior/WelcomeBanner";
import WarriorSpaceSidebar from "@/components/warrior/WarriorSpaceSidebar";
import WarriorSpaceMainContent from "@/components/warrior/WarriorSpaceMainContent";
import WarriorSpaceLoadingState from "@/components/warrior/WarriorSpaceLoadingState";
import WarriorSpaceErrorState from "@/components/warrior/WarriorSpaceErrorState";
import WarriorSpaceMobileSidebar from "@/components/warrior/WarriorSpaceMobileSidebar";
import WarriorSpaceLayout from "@/components/warrior/WarriorSpaceLayout";
import MorningPictureUpload from "@/components/warrior/MorningPictureUpload";
import { useWarriorData } from "@/hooks/useWarriorData";
import { useWarriorUIState } from "@/hooks/useWarriorUIState";

const WarriorSpace = () => {
  const { progress, isLoading, error, achievements, weeklyGoals, isNewUser } = useWarriorData();
  const { 
    activeQuest, 
    setActiveQuest, 
    sidebarOpen, 
    setSidebarOpen, 
    collapsedSections, 
    toggleSection 
  } = useWarriorUIState();

  if (isLoading) {
    return <WarriorSpaceLoadingState />;
  }

  if (error) {
    return <WarriorSpaceErrorState error={error} />;
  }

  return (
    <WarriorSpaceLayout progress={progress}>
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
          {/* Enhanced Sidebar - Fixed mobile overlay issue */}
          <div className={`lg:col-span-4 xl:col-span-3 ${
            sidebarOpen 
              ? 'fixed inset-0 z-50 lg:relative lg:inset-auto lg:z-auto' 
              : 'hidden lg:block'
          }`}>
            {/* Mobile backdrop - only show on mobile */}
            {sidebarOpen && (
              <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm lg:hidden animate-fade-in"
                onClick={() => setSidebarOpen(false)}
              >
                {/* Subtle animated elements */}
                <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-2xl animate-pulse"></div>
                <div className="absolute bottom-1/3 right-1/3 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
                
                {/* Tap to close instruction */}
                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white/70 text-sm">Tap anywhere to close</p>
                </div>
              </div>
            )}
            
            {/* Sidebar content container - Enhanced slide animation */}
            <div className={`
              ${sidebarOpen 
                ? 'absolute left-0 top-0 bottom-0 w-80 max-w-[85vw] bg-gradient-to-br from-slate-900/95 to-purple-900/95 backdrop-blur-xl border-r border-purple-500/30 overflow-y-auto transform translate-x-0 transition-transform duration-300 ease-out animate-slide-in-right lg:relative lg:w-full lg:max-w-none lg:bg-transparent lg:backdrop-blur-none lg:border-r-0 lg:transform-none lg:animate-none' 
                : 'lg:block transform -translate-x-full lg:transform-none'
              }
            `}>
              <div className="sticky top-6 space-y-6 p-4 lg:p-0">
                <WarriorSpaceSidebar
                  progress={progress}
                  collapsedSections={collapsedSections}
                  onToggleSection={toggleSection}
                  sidebarOpen={sidebarOpen}
                />
              </div>
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
    </WarriorSpaceLayout>
  );
};

export default WarriorSpace;
