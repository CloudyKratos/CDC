
import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface WarriorProgress {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  totalCoins: number;
  completedQuests: number;
  streak: number;
  lastActiveDate: string;
  weeklyXp: number;
  weeklyProgress: number;
  rank: string;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250];
const WEEKLY_XP_TARGET = 500;

const RANKS = [
  { threshold: 0, name: "Novice Warrior" },
  { threshold: 100, name: "Rising Warrior" },
  { threshold: 300, name: "Skilled Warrior" },
  { threshold: 700, name: "Elite Warrior" },
  { threshold: 1500, name: "Master Warrior" },
  { threshold: 3000, name: "Legendary Warrior" }
];

export const useWarriorProgress = () => {
  const [progress, setProgress] = useState<WarriorProgress>({
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0,
    totalCoins: 0,
    completedQuests: 0,
    streak: 0,
    lastActiveDate: '',
    weeklyXp: 0,
    weeklyProgress: 0,
    rank: "Novice Warrior"
  });

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateLevel = useCallback((totalXp: number) => {
    for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVEL_THRESHOLDS[i]) {
        return i + 1;
      }
    }
    return 1;
  }, []);

  const getRank = useCallback((totalXp: number) => {
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (totalXp >= RANKS[i].threshold) {
        return RANKS[i].name;
      }
    }
    return "Novice Warrior";
  }, []);

  const getWeekKey = useCallback(() => {
    const now = new Date();
    const year = now.getFullYear();
    const week = Math.ceil(((now.getTime() - new Date(year, 0, 1).getTime()) / 86400000 + new Date(year, 0, 1).getDay() + 1) / 7);
    return `${year}-W${week}`;
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = localStorage.getItem('warriorProgress');
      const today = new Date().toDateString();
      const thisWeek = getWeekKey();

      if (stored) {
        const savedProgress = JSON.parse(stored);
        
        // Check if it's a new day and update streak
        let newStreak = savedProgress.streak;
        if (savedProgress.lastActiveDate) {
          const lastActive = new Date(savedProgress.lastActiveDate);
          const todayDate = new Date(today);
          const daysDiff = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
          
          if (daysDiff > 1) {
            newStreak = 0; // Reset streak if more than 1 day gap
            toast.info("🔥 Streak reset! Start a new one today.");
          }
        }

        // Load weekly progress
        const weeklyData = localStorage.getItem('weeklyProgress');
        let weeklyXp = 0;
        if (weeklyData) {
          const weekly = JSON.parse(weeklyData);
          if (weekly.week === thisWeek) {
            weeklyXp = weekly.xp;
          }
        }

        const level = calculateLevel(savedProgress.totalXp);
        const currentXp = savedProgress.totalXp - (LEVEL_THRESHOLDS[level - 1] || 0);
        const nextLevelXp = (LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) - (LEVEL_THRESHOLDS[level - 1] || 0);

        setProgress({
          ...savedProgress,
          level,
          currentXp,
          nextLevelXp,
          streak: newStreak,
          weeklyXp,
          weeklyProgress: Math.min((weeklyXp / WEEKLY_XP_TARGET) * 100, 100),
          rank: getRank(savedProgress.totalXp)
        });
      }
    } catch (err) {
      console.error('Error loading warrior progress:', err);
      setError('Failed to load progress');
      toast.error('Failed to load your progress');
    } finally {
      setIsLoading(false);
    }
  }, [calculateLevel, getRank, getWeekKey]);

  const addReward = useCallback(async (xp: number, coins: number) => {
    try {
      const today = new Date().toDateString();
      const thisWeek = getWeekKey();
      
      // Update weekly progress
      const weeklyData = localStorage.getItem('weeklyProgress');
      let weeklyXp = xp;
      if (weeklyData) {
        const weekly = JSON.parse(weeklyData);
        if (weekly.week === thisWeek) {
          weeklyXp += weekly.xp;
        }
      }
      localStorage.setItem('weeklyProgress', JSON.stringify({ week: thisWeek, xp: weeklyXp }));

      const oldLevel = progress.level;
      const newTotalXp = progress.totalXp + xp;
      const newTotalCoins = progress.totalCoins + coins;
      const newCompletedQuests = progress.completedQuests + 1;
      
      // Update streak if it's a new day
      let newStreak = progress.streak;
      if (progress.lastActiveDate !== today) {
        const lastActive = progress.lastActiveDate ? new Date(progress.lastActiveDate) : null;
        const todayDate = new Date(today);
        
        if (!lastActive || Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
          newStreak = progress.streak + 1;
        }
      }

      const newLevel = calculateLevel(newTotalXp);
      const currentXp = newTotalXp - (LEVEL_THRESHOLDS[newLevel - 1] || 0);
      const nextLevelXp = (LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) - (LEVEL_THRESHOLDS[newLevel - 1] || 0);

      const updatedProgress = {
        ...progress,
        level: newLevel,
        currentXp,
        nextLevelXp,
        totalXp: newTotalXp,
        totalCoins: newTotalCoins,
        completedQuests: newCompletedQuests,
        streak: newStreak,
        lastActiveDate: today,
        weeklyXp,
        weeklyProgress: Math.min((weeklyXp / WEEKLY_XP_TARGET) * 100, 100),
        rank: getRank(newTotalXp)
      };

      setProgress(updatedProgress);
      localStorage.setItem('warriorProgress', JSON.stringify(updatedProgress));

      // Check for level up
      if (newLevel > oldLevel) {
        toast.success(`🎉 LEVEL UP! You're now Level ${newLevel}!`, {
          duration: 6000,
        });
      }

      return updatedProgress;
    } catch (err) {
      console.error('Error adding reward:', err);
      setError('Failed to update progress');
      toast.error('Failed to update your progress');
      return progress;
    }
  }, [progress, calculateLevel, getRank, getWeekKey]);

  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  return {
    progress,
    isLoading,
    error,
    addReward,
    loadProgress
  };
};
