
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, Trophy, Sparkles } from "lucide-react";
import EnhancedCDCMorningStrategyCard from "@/components/home/EnhancedCDCMorningStrategyCard";
import StableQuestManager from "./StableQuestManager";
import WeeklyGoalsPanel from "./WeeklyGoalsPanel";
import AchievementsPanel from "./AchievementsPanel";
import ProgressPanel from "./ProgressPanel";

interface WarriorSpaceMainContentProps {
  activeQuest: string;
  onActiveQuestChange: (value: string) => void;
  weeklyGoals: any[];
  achievements: any[];
  progress: {
    level: number;
    currentXp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    totalCoins: number;  
    weeklyProgress: number;
  };
}

const WarriorSpaceMainContent = ({
  activeQuest,
  onActiveQuestChange,
  weeklyGoals,
  achievements,
  progress
}: WarriorSpaceMainContentProps) => {
  return (
    <div className="space-y-6">
      {/* Enhanced Strategy Card */}
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-2xl border border-purple-500/30 p-1 shadow-xl backdrop-blur-sm">
        <EnhancedCDCMorningStrategyCard />
      </div>

      {/* Enhanced Tabs */}
      <Tabs value={activeQuest} onValueChange={onActiveQuestChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-black/60 border-purple-800/50 h-auto p-2 backdrop-blur-md rounded-xl shadow-xl">
          <TabsTrigger 
            value="daily-challenge" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-4 px-4 text-sm font-semibold transition-all duration-300 hover:bg-white/10 rounded-lg"
          >
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Daily Quests</span>
            <span className="sm:hidden">Quests</span>
          </TabsTrigger>
          <TabsTrigger 
            value="weekly-goals" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-4 px-4 text-sm font-semibold transition-all duration-300 hover:bg-white/10 rounded-lg"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Weekly Goals</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-4 px-4 text-sm font-semibold transition-all duration-300 hover:bg-white/10 rounded-lg"
          >
            <Trophy className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Awards</span>
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-4 px-4 text-sm font-semibold transition-all duration-300 hover:bg-white/10 rounded-lg"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Progress</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="daily-challenge" className="space-y-6 m-0">
            <StableQuestManager />
          </TabsContent>

          <TabsContent value="weekly-goals" className="space-y-6 m-0">
            <WeeklyGoalsPanel goals={weeklyGoals} />
          </TabsContent>

          <TabsContent value="achievements" className="space-y-6 m-0">
            <AchievementsPanel achievements={achievements} />
          </TabsContent>

          <TabsContent value="progress" className="space-y-6 m-0">
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
        </div>
      </Tabs>
    </div>
  );
};

export default WarriorSpaceMainContent;
