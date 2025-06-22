
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
  { threshold: 0, name: "Novice Warrior", color: "gray" },
  { threshold: 100, name: "Rising Warrior", color: "blue" },
  { threshold: 300, name: "Skilled Warrior", color: "green" },
  { threshold: 700, name: "Elite Warrior", color: "purple" },
  { threshold: 1500, name: "Master Warrior", color: "orange" },
  { threshold: 3000, name: "Legendary Warrior", color: "red" }
];

// Auto-save functionality
const AUTOSAVE_INTERVAL = 30000; // 30 seconds
const BACKUP_KEY = 'warriorProgress_backup';

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
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Enhanced calculation functions
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
        return RANKS[i];
      }
    }
    return RANKS[0];
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

  // Enhanced save function with backup
  const saveProgress = useCallback((progressData: WarriorProgress) => {
    try {
      const dataToSave = {
        ...progressData,
        lastSaved: new Date().toISOString()
      };
      
      // Primary save
      localStorage.setItem('warriorProgress', JSON.stringify(dataToSave));
      
      // Backup save
      localStorage.setItem(BACKUP_KEY, JSON.stringify(dataToSave));
      
      setLastSaved(new Date());
      console.log('✅ Progress saved successfully');
    } catch (error) {
      console.error('❌ Failed to save progress:', error);
      toast.error('Failed to save progress');
    }
  }, []);

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (progress.totalXp > 0) {
        saveProgress(progress);
      }
    }, AUTOSAVE_INTERVAL);

    return () => clearInterval(autoSaveInterval);
  }, [progress, saveProgress]);

  // Enhanced load function with recovery
  const loadProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const stored = localStorage.getItem('warriorProgress');
      const backup = localStorage.getItem(BACKUP_KEY);
      const today = getDayKey();
      const thisWeek = getWeekKey();

      let savedProgress = {
        totalXp: 0,
        totalCoins: 0,
        completedQuests: 0,
        streak: 0,
        lastActiveDate: ''
      };

      // Try to load from primary storage, fallback to backup
      if (stored) {
        try {
          savedProgress = JSON.parse(stored);
        } catch (parseError) {
          console.warn('Primary storage corrupted, trying backup');
          if (backup) {
            savedProgress = JSON.parse(backup);
            toast.info('Progress restored from backup');
          }
        }
      } else if (backup) {
        savedProgress = JSON.parse(backup);
        toast.info('Progress restored from backup');
      }

      // Enhanced streak logic
      let newStreak = savedProgress.streak;
      if (savedProgress.lastActiveDate) {
        const lastActive = new Date(savedProgress.lastActiveDate);
        const todayDate = new Date(today);
        const daysDiff = Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysDiff > 1) {
          newStreak = 0;
        } else if (daysDiff === 1) {
          // Maintain streak for consecutive days
          newStreak = savedProgress.streak;
        }
      }

      // Load weekly progress with validation
      const weeklyData = localStorage.getItem('weeklyProgress');
      let weeklyXp = 0;
      if (weeklyData) {
        try {
          const weekly = JSON.parse(weeklyData);
          if (weekly.week === thisWeek && typeof weekly.xp === 'number') {
            weeklyXp = weekly.xp;
          }
        } catch (error) {
          console.warn('Weekly progress data corrupted, resetting');
        }
      }

      // Load daily quest progress with validation
      const dailyData = localStorage.getItem('dailyQuestProgress');
      let dailyQuestProgress = 0;
      if (dailyData) {
        try {
          const daily = JSON.parse(dailyData);
          if (daily.date === today && typeof daily.completed === 'number') {
            dailyQuestProgress = Math.min(daily.completed, DAILY_QUEST_TARGET);
          }
        } catch (error) {
          console.warn('Daily progress data corrupted, resetting');
        }
      }

      const level = calculateLevel(savedProgress.totalXp);
      const currentXp = savedProgress.totalXp - (LEVEL_THRESHOLDS[level - 1] || 0);
      const nextLevelXp = (LEVEL_THRESHOLDS[level] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) - (LEVEL_THRESHOLDS[level - 1] || 0);
      const rankInfo = getRank(savedProgress.totalXp);

      const newProgress = {
        ...savedProgress,
        level,
        currentXp,
        nextLevelXp,
        streak: newStreak,
        weeklyXp,
        weeklyProgress: Math.min((weeklyXp / WEEKLY_XP_TARGET) * 100, 100),
        rank: rankInfo.name,
        dailyQuestProgress,
        weeklyQuestTarget: WEEKLY_XP_TARGET
      };

      setProgress(newProgress);
      setLastSaved(new Date());
    } catch (err) {
      console.error('Error loading warrior progress:', err);
      setError('Failed to load progress');
      toast.error('Failed to load your progress');
    } finally {
      setIsLoading(false);
    }
  }, [calculateLevel, getRank, getWeekKey, getDayKey]);

  // Enhanced reward system
  const addReward = useCallback(async (xp: number, coins: number = 0) => {
    try {
      const today = getDayKey();
      const thisWeek = getWeekKey();
      
      // Validate inputs
      if (xp < 0 || coins < 0) {
        throw new Error('Invalid reward values');
      }

      // Update weekly progress with validation
      const weeklyData = localStorage.getItem('weeklyProgress');
      let weeklyXp = xp;
      if (weeklyData) {
        try {
          const weekly = JSON.parse(weeklyData);
          if (weekly.week === thisWeek && typeof weekly.xp === 'number') {
            weeklyXp += weekly.xp;
          }
        } catch (error) {
          console.warn('Weekly progress corrupted, starting fresh');
        }
      }
      localStorage.setItem('weeklyProgress', JSON.stringify({ week: thisWeek, xp: weeklyXp }));

      // Update daily quest progress with validation
      const dailyData = localStorage.getItem('dailyQuestProgress');
      let dailyQuestProgress = 1;
      if (dailyData) {
        try {
          const daily = JSON.parse(dailyData);
          if (daily.date === today && typeof daily.completed === 'number') {
            dailyQuestProgress = Math.min(daily.completed + 1, DAILY_QUEST_TARGET);
          }
        } catch (error) {
          console.warn('Daily progress corrupted, starting fresh');
        }
      }
      localStorage.setItem('dailyQuestProgress', JSON.stringify({ date: today, completed: dailyQuestProgress }));

      const oldLevel = progress.level;
      const newTotalXp = progress.totalXp + xp;
      const newTotalCoins = progress.totalCoins + coins;
      const newCompletedQuests = progress.completedQuests + 1;
      
      // Enhanced streak calculation
      let newStreak = progress.streak;
      if (progress.lastActiveDate !== today) {
        const lastActive = progress.lastActiveDate ? new Date(progress.lastActiveDate) : null;
        const todayDate = new Date(today);
        
        if (!lastActive || Math.floor((todayDate.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24)) === 1) {
          newStreak = progress.streak + 1;
          toast.success(`🔥 Streak increased to ${newStreak} days!`, {
            duration: 4000,
          });
        }
      }

      const newLevel = calculateLevel(newTotalXp);
      const currentXp = newTotalXp - (LEVEL_THRESHOLDS[newLevel - 1] || 0);
      const nextLevelXp = (LEVEL_THRESHOLDS[newLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1]) - (LEVEL_THRESHOLDS[newLevel - 1] || 0);
      const rankInfo = getRank(newTotalXp);

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
        rank: rankInfo.name,
        dailyQuestProgress,
        weeklyQuestTarget: WEEKLY_XP_TARGET
      };

      setProgress(updatedProgress);
      saveProgress(updatedProgress);

      // Enhanced notifications
      if (newLevel > oldLevel) {
        toast.success(`🎉 LEVEL UP! You're now Level ${newLevel}!`, {
          duration: 6000,
        });
      }

      if (dailyQuestProgress >= DAILY_QUEST_TARGET && dailyQuestProgress - 1 < DAILY_QUEST_TARGET) {
        toast.success('🏆 Daily quest goal completed!', { duration: 4000 });
      }

      // Milestone celebrations
      if ([100, 500, 1000, 2500, 5000].includes(newTotalXp)) {
        toast.success(`🌟 Milestone achieved! ${newTotalXp} total XP!`, {
          duration: 5000,
        });
      }

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
  }, [progress, calculateLevel, getRank, getWeekKey, getDayKey, saveProgress]);

  // Initialize on mount
  useEffect(() => {
    loadProgress();
  }, [loadProgress]);

  // Window beforeunload handler for emergency save
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (progress.totalXp > 0) {
        saveProgress(progress);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [progress, saveProgress]);

  return {
    progress,
    isLoading,
    error,
    addReward,
    loadProgress,
    lastSaved,
    getRank: (xp: number) => getRank(xp)
  };
};
