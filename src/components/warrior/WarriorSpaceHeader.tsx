
import React from "react";
import ResponsiveWarriorHeader from "./ResponsiveWarriorHeader";

interface WarriorSpaceHeaderProps {
  progress: {
    streak: number;
    level: number;
    totalCoins: number;
    completedQuests: number;
    currentXp: number;
    nextLevelXp: number;
    rank: string;
    dailyQuestProgress: number;
  };
}

const WarriorSpaceHeader = ({ progress }: WarriorSpaceHeaderProps) => {
  const progressPercentage = (progress.currentXp / progress.nextLevelXp) * 100;
  
  return (
    <div className="relative z-20">
      <ResponsiveWarriorHeader 
        stats={{
          streak: progress.streak,
          level: progress.level,
          totalCoins: progress.totalCoins,
          rank: progress.rank,
          currentXp: progress.currentXp,
          nextLevelXp: progress.nextLevelXp
        }}
        progressPercentage={progressPercentage}
        completedQuestsToday={progress.dailyQuestProgress}
        totalQuestsToday={7}
      />
    </div>
  );
};

export default WarriorSpaceHeader;
