
import React from "react";
import ResponsiveWarriorHeader from "./ResponsiveWarriorHeader";

interface WarriorSpaceHeaderProps {
  progress: {
    streak: number;
    level: number;
    totalCoins: number;
    completedQuests: number;
  };
}

const WarriorSpaceHeader = ({ progress }: WarriorSpaceHeaderProps) => {
  return (
    <ResponsiveWarriorHeader 
      stats={{
        streak: progress.streak,
        level: progress.level,
        totalCoins: progress.totalCoins
      }}
      progressPercentage={Math.min((progress.completedQuests / 7) * 100, 100)}
      completedQuestsToday={progress.completedQuests}
      totalQuestsToday={7}
    />
  );
};

export default WarriorSpaceHeader;
