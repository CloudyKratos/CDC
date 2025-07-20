
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import WarriorSpaceLayout from "@/components/warrior/WarriorSpaceLayout";

const WarriorSpace = () => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Mock data - in a real app, this would come from your backend
  const progress = {
    level: 12,
    currentXp: 2840,
    nextLevelXp: 3200,
    streak: 7,
    completedQuests: 145,
    rank: "Elite Warrior",
    weeklyProgress: 75,
    dailyQuestProgress: 3,
    weeklyQuestTarget: 5,
    totalCoins: 1250
  };

  const weeklyGoals = [
    { id: 1, title: "Complete 5 daily challenges", progress: 60, target: 5 },
    { id: 2, title: "Earn 500 XP", progress: 80, target: 500 },
    { id: 3, title: "Maintain 7-day streak", progress: 100, target: 7 }
  ];

  const achievements = [
    { id: 1, title: "First Steps", description: "Complete your first quest", unlocked: true },
    { id: 2, title: "Streak Master", description: "Maintain a 30-day streak", unlocked: false },
    { id: 3, title: "Elite Status", description: "Reach level 10", unlocked: true }
  ];

  return (
    <WarriorSpaceLayout 
      progress={progress}
      weeklyGoals={weeklyGoals}
      achievements={achievements}
    />
  );
};

export default WarriorSpace;
