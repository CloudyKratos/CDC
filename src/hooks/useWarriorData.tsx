
import { useState, useEffect } from "react";
import { Target, Users, Flame, Sparkles, Trophy, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";

export const useWarriorData = () => {
  const { user } = useAuth();
  const { progress, isLoading, error, getRank } = useWarriorProgress();
  const [achievements, setAchievements] = useState<any[]>([]);
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]);

  useEffect(() => {
    const loadUserData = async () => {
      if (user && !isLoading) {
        try {
          await new Promise(resolve => setTimeout(resolve, 200));
          
          // Enhanced weekly goals with dynamic progress
          setWeeklyGoals([
            { 
              id: 1, 
              title: "Maintain 7-day streak", 
              progress: Math.min(progress.streak, 7), 
              target: 7, 
              xp: 500,
              coins: 200,
              type: "streak",
              icon: Flame,
              color: "orange"
            },
            { 
              id: 2, 
              title: "Complete 20 focus sessions", 
              progress: Math.min(progress.completedQuests, 20), 
              target: 20,
              xp: 300,
              coins: 150,
              type: "quests",
              icon: Target,
              color: "blue"
            },
            { 
              id: 3, 
              title: "Earn 500 XP this week", 
              progress: Math.min(progress.weeklyXp || 0, 500), 
              target: 500,
              xp: 200,
              coins: 100,
              type: "xp",
              icon: Sparkles,
              color: "purple"
            },
            {
              id: 4,
              title: "Level up this week",
              progress: progress.level > 1 ? 1 : 0,
              target: 1,
              xp: 750,
              coins: 300,
              type: "level",
              icon: Shield,
              color: "green"
            }
          ]);

          // Enhanced achievements with visual indicators
          const rankData = getRank(progress.totalXp);
          setAchievements([
            { 
              title: "First Steps", 
              description: "Complete your first task", 
              icon: Target, 
              earned: progress.completedQuests > 0, 
              rarity: "common",
              color: "gray",
              progress: Math.min(progress.completedQuests, 1),
              target: 1
            },
            { 
              title: "Team Player", 
              description: "Join the community", 
              icon: Users, 
              earned: true, 
              rarity: "common",
              color: "blue",
              progress: 1,
              target: 1
            },
            { 
              title: "Focus Master", 
              description: "Complete 10 focus sessions", 
              icon: Trophy, 
              earned: progress.completedQuests >= 10, 
              rarity: "rare",
              color: "purple",
              progress: Math.min(progress.completedQuests, 10),
              target: 10
            },
            { 
              title: "Week Warrior", 
              description: "Maintain 7-day streak", 
              icon: Flame, 
              earned: progress.streak >= 7, 
              rarity: "epic",
              color: "orange",
              progress: Math.min(progress.streak, 7),
              target: 7
            },
            { 
              title: "XP Hunter", 
              description: "Earn 1000+ total XP", 
              icon: Sparkles, 
              earned: progress.totalXp >= 1000, 
              rarity: "legendary",
              color: "yellow",
              progress: Math.min(progress.totalXp, 1000),
              target: 1000
            },
            {
              title: "Elite Warrior",
              description: "Reach Elite rank",
              icon: Shield,
              earned: progress.totalXp >= 700,
              rarity: "epic",
              color: "purple",
              progress: Math.min(progress.totalXp, 700),
              target: 700
            }
          ]);
        } catch (error) {
          console.error('Error loading user data:', error);
        }
      }
    };

    loadUserData();
  }, [user, progress, isLoading, getRank]);

  return {
    progress,
    isLoading,
    error,
    achievements,
    weeklyGoals,
    isNewUser: progress.completedQuests === 0
  };
};
