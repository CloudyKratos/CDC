
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, ChevronDown, ChevronUp } from "lucide-react";
import EnhancedStatsCard from "./EnhancedStatsCard";
import ImprovedQuickActionsPanel from "./ImprovedQuickActionsPanel";
import OptionalAddOns from "@/components/home/OptionalAddOns";

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
  collapsedSections: {
    stats: boolean;
    quickActions: boolean;
    addOns: boolean;
  };
  onToggleSection: (section: keyof typeof collapsedSections) => void;
  sidebarOpen: boolean;
}

const WarriorSpaceSidebar = ({ 
  progress, 
  collapsedSections, 
  onToggleSection, 
  sidebarOpen 
}: WarriorSpaceSidebarProps) => {
  return (
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
        onToggle={() => onToggleSection('stats')}
      />

      <ImprovedQuickActionsPanel 
        isCollapsed={collapsedSections.quickActions}
        onToggle={() => onToggleSection('quickActions')}
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
              onClick={() => onToggleSection('addOns')}
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
  );
};

export default WarriorSpaceSidebar;
