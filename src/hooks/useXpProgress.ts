
import { useState, useEffect } from 'react';

interface XpProgress {
  level: number;
  currentXp: number;
  nextLevelXp: number;
  totalXp: number;
  dailyXp: number;
  weeklyXp: number;
  streak: number;
  totalCoins: number;
  rank: string;
  completedQuests: number;
  weeklyProgress: number;
}

const LEVEL_XP_REQUIREMENTS = [
  0, 100, 250, 450, 700, 1000, 1350, 1750, 2200, 2700, 3250, 3850, 4500, 5200, 5950
];

const RANKS = [
  { min: 0, max: 99, name: "New Warrior" },
  { min: 100, max: 299, name: "Rising Warrior" },
  { min: 300, max: 699, name: "Skilled Warrior" },
  { min: 700, max: 1499, name: "Elite Warrior" },
  { min: 1500, max: 2999, name: "Master Warrior" },
  { min: 3000, max: 9999, name: "Legendary Warrior" }
];

export const useXpProgress = () => {
  const [progress, setProgress] = useState<XpProgress>({
    level: 1,
    currentXp: 0,
    nextLevelXp: 100,
    totalXp: 0,
    dailyXp: 0,
    weeklyXp: 0,
    streak: 0,
    totalCoins: 0,
    rank: "New Warrior",
    completedQuests: 0,
    weeklyProgress: 0
  });

  const loadProgress = () => {
    const stored = localStorage.getItem('warriorProgress');
    const dailyData = localStorage.getItem('dailyProgress');
    const weeklyData = localStorage.getItem('weeklyProgress');
    
    const today = new Date().toDateString();
    const thisWeek = getWeekKey();
    
    if (stored) {
      const storedProgress = JSON.parse(stored);
      let dailyXp = 0;
      let weeklyXp = 0;
      
      // Check daily progress
      if (dailyData) {
        const daily = JSON.parse(dailyData);
        if (daily.date === today) {
          dailyXp = daily.xp;
        }
      }
      
      // Check weekly progress
      if (weeklyData) {
        const weekly = JSON.parse(weeklyData);
        if (weekly.week === thisWeek) {
          weeklyXp = weekly.xp;
        }
      }
      
      const level = calculateLevel(storedProgress.totalXp);
      const currentXp = storedProgress.totalXp - LEVEL_XP_REQUIREMENTS[level - 1];
      const nextLevelXp = level < LEVEL_XP_REQUIREMENTS.length ? 
        LEVEL_XP_REQUIREMENTS[level] - LEVEL_XP_REQUIREMENTS[level - 1] : 1000;
      
      setProgress({
        ...storedProgress,
        level,
        currentXp,
        nextLevelXp,
        dailyXp,
        weeklyXp,
        rank: getRank(storedProgress.totalXp),
        weeklyProgress: Math.min((weeklyXp / 500) * 100, 100) // Weekly goal of 500 XP
      });
    }
  };

  const addXp = (xpAmount: number, coinsAmount: number = 0) => {
    const today = new Date().toDateString();
    const thisWeek = getWeekKey();
    
    // Update daily progress
    const dailyData = localStorage.getItem('dailyProgress');
    let dailyXp = xpAmount;
    if (dailyData) {
      const daily = JSON.parse(dailyData);
      if (daily.date === today) {
        dailyXp += daily.xp;
      }
    }
    localStorage.setItem('dailyProgress', JSON.stringify({ date: today, xp: dailyXp }));
    
    // Update weekly progress
    const weeklyData = localStorage.getItem('weeklyProgress');
    let weeklyXp = xpAmount;
    if (weeklyData) {
      const weekly = JSON.parse(weeklyData);
      if (weekly.week === thisWeek) {
        weeklyXp += weekly.xp;
      }
    }
    localStorage.setItem('weeklyProgress', JSON.stringify({ week: thisWeek, xp: weeklyXp }));
    
    // Update overall progress
    const newTotalXp = progress.totalXp + xpAmount;
    const newTotalCoins = progress.totalCoins + coinsAmount;
    const newCompletedQuests = progress.completedQuests + 1;
    
    // Check for streak (simplified - assume daily completion maintains streak)
    const newStreak = dailyXp === xpAmount ? progress.streak + 1 : progress.streak;
    
    const level = calculateLevel(newTotalXp);
    const currentXp = newTotalXp - LEVEL_XP_REQUIREMENTS[level - 1];
    const nextLevelXp = level < LEVEL_XP_REQUIREMENTS.length ? 
      LEVEL_XP_REQUIREMENTS[level] - LEVEL_XP_REQUIREMENTS[level - 1] : 1000;
    
    const newProgress = {
      ...progress,
      level,
      currentXp,
      nextLevelXp,
      totalXp: newTotalXp,
      totalCoins: newTotalCoins,
      completedQuests: newCompletedQuests,
      streak: newStreak,
      dailyXp,
      weeklyXp,
      rank: getRank(newTotalXp),
      weeklyProgress: Math.min((weeklyXp / 500) * 100, 100)
    };
    
    setProgress(newProgress);
    localStorage.setItem('warriorProgress', JSON.stringify(newProgress));
    
    return newProgress;
  };

  const calculateLevel = (totalXp: number): number => {
    for (let i = LEVEL_XP_REQUIREMENTS.length - 1; i >= 0; i--) {
      if (totalXp >= LEVEL_XP_REQUIREMENTS[i]) {
        return i + 1;
      }
    }
    return 1;
  };

  const getRank = (totalXp: number): string => {
    for (const rank of RANKS) {
      if (totalXp >= rank.min && totalXp <= rank.max) {
        return rank.name;
      }
    }
    return "Legendary Warrior";
  };

  const getWeekKey = (): string => {
    const now = new Date();
    const startOfYear = new Date(now.getFullYear(), 0, 1);
    const weekNumber = Math.ceil(((now.getTime() - startOfYear.getTime()) / 86400000 + startOfYear.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${weekNumber}`;
  };

  useEffect(() => {
    loadProgress();
  }, []);

  return {
    progress,
    addXp,
    loadProgress
  };
};
