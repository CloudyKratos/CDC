
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
  dailyQuestProgress: number;
  weeklyQuestTarget: number;
}

const LEVEL_THRESHOLDS = [0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 6000];
const WEEKLY_XP_TARGET = 500;
const DAILY_QUEST_TARGET = 5;

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
    rank: "Novice Warrior",
    dailyQuestProgress: 0,
    weeklyQuestTarget: WEEKLY_XP_TARGET
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

  const getDayKey = useCallback(() => {
    return new Date().toDateString();
  }, []);

  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = localStorage.getItem('warriorProgress');
      const today = getDayKey();
      const thisWeek = getWeekKey();

      // Initialize default progress if none exists
      let savedProgress = {
        totalXp: 0,
        totalCoins: 0,
        completedQuests: 0,
        streak: 0,
        lastActiveDate: ''
      };

      if (stored) {
        savedProgress = JSON.parse(stored);
      }

      // Check streak logic
      let newStreak = savedProgress.streak;
      if (savedProgress.lastActiveDate) {
        const lastActive = new Date(savedProgress.lastActiveDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
          newStreak = 0;
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

      // Load daily quest progress
      const dailyData = localStorage.getItem('dailyQuestProgress');
      let dailyQuestProgress = 0;
      if (dailyData) {
        const daily = JSON.parse(dailyData);
        if (daily.date === today) {
          dailyQuestProgress = daily.completed;
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
        rank: getRank(savedProgress.totalXp),
        dailyQuestProgress,
        weeklyQuestTarget: WEEKLY_XP_TARGET
      });
    } catch (err) {
      console.error('Error loading warrior progress:', err);
      setError('Failed to load progress');
      toast.error('Failed to load your progress');
    } finally {
      setIsLoading(false);
    }
  }, [calculateLevel, getRank, getWeekKey, getDayKey]);

  const addReward = useCallback(async (xp: number, coins: number = 0) => {
    try {
      const today = getDayKey();
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

      // Update daily quest progress
      const dailyData = localStorage.getItem('dailyQuestProgress');
      let dailyQuestProgress = 1;
      if (dailyData) {
        const daily = JSON.parse(dailyData);
        if (daily.date === today) {
          dailyQuestProgress = Math.min(daily.completed + 1, DAILY_QUEST_TARGET);
        }
      }
      localStorage.setItem('dailyQuestProgress', JSON.stringify({ date: today, completed: dailyQuestProgress }));

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
          toast.success(`🔥 Streak increased to ${newStreak} days!`);
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
        rank: getRank(newTotalXp),
        dailyQuestProgress,
        weeklyQuestTarget: WEEKLY_XP_TARGET
      };

      setProgress(updatedProgress);
      localStorage.setItem('warriorProgress', JSON.stringify(updatedProgress));

      // Check for level up
      if (newLevel > oldLevel) {
        toast.success(`🎉 LEVEL UP! You're now Level ${newLevel}!`, {
          duration: 6000,
        });
      }

      // Check for daily goal completion
      if (dailyQuestProgress >= DAILY_QUEST_TARGET && dailyQuestProgress - 1 < DAILY_QUEST_TARGET) {
        toast.success('🏆 Daily quest goal completed!', { duration: 4000 });
      }

      // XP reward notification
      toast.success(`+${xp} XP ${coins > 0 ? `+${coins} coins` : ''}`, {
        duration: 2000,
      });

      return updatedProgress;
    } catch (err) {
      console.error('Error adding reward:', err);
      setError('Failed to update progress');
      toast.error('Failed to update your progress');
      return progress;
    }
  }, [progress, calculateLevel, getRank, getWeekKey, getDayKey]);

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
