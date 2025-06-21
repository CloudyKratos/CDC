
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import EnhancedStatsCard from "./EnhancedStatsCard";
import ImprovedQuickActionsPanel from "./ImprovedQuickActionsPanel";
import OptionalAddOns from "@/components/home/OptionalAddOns";

interface CollapsedSections {
  stats: boolean;
  quickActions: boolean;
  addOns: boolean;
}

interface WarriorSpaceSidebarProps {
  progress: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    rank: string;
    weeklyProgress: number;
  };
  collapsedSections: CollapsedSections;
  onToggleSection: (section: keyof CollapsedSections) => void;
  sidebarOpen: boolean;
}

const WarriorSpaceSidebar = ({ 
  progress, 
  collapsedSections, 
  onToggleSection, 
  sidebarOpen 
}: WarriorSpaceSidebarProps) => {
  return (
    <div className={`space-y-6 transition-all duration-300 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
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
        onToggle={() => onToggleSection('stats')}
      />

      <ImprovedQuickActionsPanel 
        isCollapsed={collapsedSections.quickActions}
        onToggle={() => onToggleSection('quickActions')}
      />

      <Card className="bg-gradient-to-br from-slate-900/90 to-green-900/50 border-green-500/30 text-white backdrop-blur-lg shadow-2xl hover:shadow-green-500/20 transition-all duration-500 rounded-2xl overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute bottom-0 left-1/4 w-24 h-24 bg-green-500/30 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>

        <CardHeader className="pb-4 relative z-10">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3 text-xl font-bold">
              <div className="p-2 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl">
                <Plus className="h-6 w-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-white to-green-200 bg-clip-text text-transparent">
                Power-Ups
              </span>
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onToggleSection('addOns')}
              className="h-8 w-8 text-green-300 hover:text-white hover:bg-green-600/20 transition-all duration-200 rounded-lg"
            >
              {collapsedSections.addOns ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>
        {!collapsedSections.addOns && (
          <CardContent className="relative z-10">
            <OptionalAddOns />
          </CardContent>
        )}
      </Card>
    </div>
  );
};

export default WarriorSpaceSidebar;
