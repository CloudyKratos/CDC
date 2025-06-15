
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

interface Quest {
  id: number;
  title: string;
  description: string;
  xp: number;
  coins: number;
  completed: boolean;
  difficulty: string;
  category: string;
  estimatedTime: string;
  locked?: boolean;
}

interface QuestTemplate {
  id: number;
  title: string;
  description: string;
  xp: number;
  coins: number;
  difficulty: string;
  category: string;
  estimatedTime: string;
}

const QUEST_TEMPLATES: QuestTemplate[] = [
  { 
    id: 1, 
    title: "Complete morning routine", 
    description: "Start your day with purpose and energy",
    xp: 50, 
    coins: 25,
    difficulty: "easy",
    category: "wellness",
    estimatedTime: "10 min"
  },
  { 
    id: 2, 
    title: "Focus session - 25 minutes", 
    description: "Deep work on your most important task",
    xp: 75, 
    coins: 40,
    difficulty: "medium",
    category: "productivity",
    estimatedTime: "25 min"
  },
  { 
    id: 3, 
    title: "Connect with community", 
    description: "Share insights or support a fellow warrior",
    xp: 30, 
    coins: 15,
    difficulty: "easy",
    category: "social",
    estimatedTime: "5 min"
  },
  { 
    id: 4, 
    title: "Evening reflection", 
    description: "Review your day and plan tomorrow",
    xp: 40, 
    coins: 20,
    difficulty: "easy",
    category: "wellness",
    estimatedTime: "15 min"
  },
  { 
    id: 5, 
    title: "Skill development", 
    description: "Learn something new for 20 minutes",
    xp: 100, 
    coins: 60,
    difficulty: "hard",
    category: "learning",
    estimatedTime: "20 min"
  },
  { 
    id: 6, 
    title: "Physical activity", 
    description: "Get your body moving for 15+ minutes",
    xp: 60, 
    coins: 30,
    difficulty: "medium",
    category: "wellness",
    estimatedTime: "15 min"
  },
  { 
    id: 7, 
    title: "Reading session", 
    description: "Read for personal or professional growth",
    xp: 45, 
    coins: 25,
    difficulty: "easy",
    category: "learning",
    estimatedTime: "20 min"
  }
];

export const useDailyQuests = () => {
  const [quests, setQuests] = useState<Quest[]>([]);
  const [lastResetDate, setLastResetDate] = useState<string>('');

  // Check if it's a new day and reset quests
  const checkAndResetQuests = () => {
    const today = new Date().toDateString();
    const stored = localStorage.getItem('dailyQuests');
    const storedDate = localStorage.getItem('lastQuestReset');

    if (storedDate !== today || !stored) {
      // Reset quests for new day
      const resetQuests = QUEST_TEMPLATES.map(template => ({
        ...template,
        completed: false,
        locked: false
      }));
      
      setQuests(resetQuests);
      setLastResetDate(today);
      localStorage.setItem('dailyQuests', JSON.stringify(resetQuests));
      localStorage.setItem('lastQuestReset', today);
      
      if (storedDate && storedDate !== today) {
        toast.success("🌅 New day, new quests! Your daily challenges have been reset.", {
          duration: 4000,
        });
      }
    } else {
      // Load existing quests for today
      setQuests(JSON.parse(stored));
      setLastResetDate(storedDate);
    }
  };

  // Save quests to localStorage whenever they change
  const saveQuests = (updatedQuests: Quest[]) => {
    setQuests(updatedQuests);
    localStorage.setItem('dailyQuests', JSON.stringify(updatedQuests));
  };

  const toggleQuestCompletion = (questId: number) => {
    const updatedQuests = quests.map(quest => 
      quest.id === questId 
        ? { ...quest, completed: !quest.completed }
        : quest
    );
    saveQuests(updatedQuests);
    return updatedQuests;
  };

  const getQuestStats = () => {
    const completed = quests.filter(q => q.completed).length;
    const total = quests.length;
    const totalXpEarned = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xp, 0);
    const totalCoinsEarned = quests.filter(q => q.completed).reduce((sum, q) => sum + q.coins, 0);
    
    return {
      completed,
      total,
      totalXpEarned,
      totalCoinsEarned,
      progressPercentage: total > 0 ? (completed / total) * 100 : 0
    };
  };

  useEffect(() => {
    checkAndResetQuests();
  }, []);

  return {
    quests,
    toggleQuestCompletion,
    getQuestStats,
    checkAndResetQuests
  };
};
