
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Target, Calendar, Trophy, Sparkles } from "lucide-react";
import CDCMorningStrategyCard from "@/components/home/CDCMorningStrategyCard";
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
    <div className="lg:col-span-3 space-y-6">
      <div className="bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-xl border border-purple-500/30 p-1">
        <CDCMorningStrategyCard />
      </div>

      <Tabs value={activeQuest} onValueChange={onActiveQuestChange} className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 bg-black/50 border-purple-800/40 h-auto p-1 backdrop-blur-sm">
          <TabsTrigger 
            value="daily-challenge" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
          >
            <Target className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Daily Quests</span>
            <span className="sm:hidden">Quests</span>
          </TabsTrigger>
          <TabsTrigger 
            value="weekly-goals" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
          >
            <Calendar className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Weekly Goals</span>
            <span className="sm:hidden">Goals</span>
          </TabsTrigger>
          <TabsTrigger 
            value="achievements" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
          >
            <Trophy className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Achievements</span>
            <span className="sm:hidden">Awards</span>
          </TabsTrigger>
          <TabsTrigger 
            value="progress" 
            className="text-white data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-600 data-[state=active]:to-blue-600 data-[state=active]:text-white py-3 text-sm font-medium transition-all duration-200"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Progress</span>
            <span className="sm:hidden">Stats</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily-challenge" className="space-y-4 mt-6">
          <StableQuestManager />
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
  );
};

export default WarriorSpaceMainContent;
