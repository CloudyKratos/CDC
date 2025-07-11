import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BrainCircuit, Sunrise, SunMedium, Waves, MoonStar, Trophy, Sparkles, Star, Target } from "lucide-react";
import AccountabilityTimeBomb from "./AccountabilityTimeBomb";
import { TaskType } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/auth/AuthContext";

interface TickBombDemoProps {
  className?: string;
}

const TickBombDemo: React.FC<TickBombDemoProps> = ({ className }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<string>("morning");
  const [completedBombs, setCompletedBombs] = useState<Record<string, boolean>>({});
  const [streaks, setStreaks] = useState<Record<string, number>>({});
  const [totalPoints, setTotalPoints] = useState(0);
  const [showRewards, setShowRewards] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Load user's actual streak data from database
  useEffect(() => {
    const loadUserStreaks = async () => {
      if (user) {
        setIsLoading(true);
        // In a real implementation, this would fetch from your database
        // const userStreaks = await fetchUserStreaksFromDB(user.id);
        // setStreaks(userStreaks);
        // setTotalPoints(await fetchUserPointsFromDB(user.id));
        
        // For now, start with empty streaks for new users
        setStreaks({
          morning: 0,
          meditation: 0,
          workout: 0,
          evening: 0
        });
        setTotalPoints(0);
      }
      setIsLoading(false);
    };

    loadUserStreaks();
  }, [user]);
  
  // Define different bomb types
  const timeBombs = [
    {
      id: "morning",
      title: "Morning Strategy & Journal",
      description: "Start your day with intention and reflection",
      duration: 15,
      severity: "medium" as const,
      taskType: "morning" as TaskType,
      icon: <Sunrise className="h-4 w-4" />
    },
    {
      id: "meditation",
      title: "Midday Meditation",
      description: "Take a break to reset and refocus",
      duration: 10,
      severity: "low" as const,
      taskType: "meditation" as TaskType,
      icon: <BrainCircuit className="h-4 w-4" />
    },
    {
      id: "workout",
      title: "Physical Activity",
      description: "Move your body to boost energy and clarity",
      duration: 30,
      severity: "high" as const,
      taskType: "workout" as TaskType,
      icon: <Waves className="h-4 w-4" />
    },
    {
      id: "evening",
      title: "Evening Reflection",
      description: "Review your day and plan for tomorrow",
      duration: 15,
      severity: "medium" as const,
      taskType: "evening" as TaskType,
      icon: <MoonStar className="h-4 w-4" />
    }
  ];

  const calculatePoints = (bombId: string) => {
    const bomb = timeBombs.find(b => b.id === bombId);
    if (!bomb) return 0;
    
    // Base points calculation
    let points = bomb.duration * 2;
    
    // Severity multiplier
    const severityMultipliers = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3
    };
    
    points *= severityMultipliers[bomb.severity];
    
    // Streak bonus
    const streak = streaks[bombId] || 0;
    const streakMultiplier = Math.min(2, 1 + (streak * 0.1));
    
    return Math.round(points * streakMultiplier);
  };
  
  const handleBombComplete = (bombId: string) => {
    // Mark as completed
    setCompletedBombs(prev => ({
      ...prev,
      [bombId]: true
    }));
    
    // Increase streak
    setStreaks(prev => ({
      ...prev,
      [bombId]: (prev[bombId] || 0) + 1
    }));
    
    // Add points
    const pointsEarned = calculatePoints(bombId);
    setTotalPoints(prev => prev + pointsEarned);
    
    // TODO: Save to database
    
    toast.success(`${bombId.charAt(0).toUpperCase() + bombId.slice(1)} bomb completed!`, {
      description: `You earned ${pointsEarned} points and increased your streak to ${(streaks[bombId] || 0) + 1} days.`,
      duration: 5000,
    });
  };
  
  const handleBombTimeout = (bombId: string) => {
    // Reset streak
    setStreaks(prev => ({
      ...prev,
      [bombId]: 0
    }));
    
    // TODO: Update database
    
    toast.error(`${bombId.charAt(0).toUpperCase() + bombId.slice(1)} bomb detonated!`, {
      description: "Your streak has been reset. Try again tomorrow.",
      duration: 5000,
    });
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg flex items-center">
                <SunMedium className="h-5 w-5 mr-2 text-amber-500" />
                Accountability Time Bombs
              </CardTitle>
              <CardDescription>
                Loading your accountability habits...
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-700 rounded-lg animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Check if user has no streaks yet
  const hasNoStreaks = Object.values(streaks).every(streak => streak === 0);
  
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="text-lg flex items-center">
              <SunMedium className="h-5 w-5 mr-2 text-amber-500" />
              Accountability Time Bombs
            </CardTitle>
            <CardDescription>
              {hasNoStreaks 
                ? "Start building your daily habits with timed accountability sessions"
                : "Keep your momentum going with these timed activities"
              }
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center" 
              onClick={() => setShowRewards(!showRewards)}
            >
              <Star className="h-4 w-4 mr-1 text-amber-500" />
              <span className="text-amber-600 dark:text-amber-400 font-semibold">{totalPoints}</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center"
            >
              <Trophy className="h-4 w-4 mr-1 text-amber-500" />
              <span>Rewards</span>
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {hasNoStreaks && (
          <div className="text-center py-6 mb-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
            <Target className="h-12 w-12 text-amber-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-amber-800 dark:text-amber-300 mb-2">
              Ready to build your first habit?
            </h3>
            <p className="text-amber-700 dark:text-amber-400 text-sm">
              Choose a category below and start your first accountability session
            </p>
          </div>
        )}

        <Tabs defaultValue="morning" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            {timeBombs.map(bomb => (
              <TabsTrigger 
                key={bomb.id} 
                value={bomb.id}
                className="flex items-center justify-center"
              >
                {bomb.icon}
                <span className="ml-2 hidden sm:inline">{bomb.id.charAt(0).toUpperCase() + bomb.id.slice(1)}</span>
                {streaks[bomb.id] > 0 && (
                  <span className="ml-1 text-xs text-amber-500 font-bold">
                    {streaks[bomb.id]}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {timeBombs.map(bomb => (
            <TabsContent key={bomb.id} value={bomb.id} className="mt-0">
              <AccountabilityTimeBomb 
                title={bomb.title}
                description={bomb.description}
                duration={bomb.duration}
                severity={bomb.severity}
                taskType={bomb.taskType}
                onComplete={() => handleBombComplete(bomb.id)}
                onTimeout={() => handleBombTimeout(bomb.id)}
                streakCount={streaks[bomb.id] || 0}
                enableGamification={true}
              />
              
              {showRewards && (
                <div className="mt-4 space-y-3 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h3 className="text-sm font-medium flex items-center text-amber-800 dark:text-amber-300">
                    <Sparkles className="h-4 w-4 mr-2 text-amber-500" />
                    Rewards & Achievements
                  </h3>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <div className="flex items-center text-xs bg-white dark:bg-gray-800 p-2 rounded-md border border-amber-100 dark:border-amber-900">
                      <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                      <span>{streaks[bomb.id] >= 3 ? "✅" : "🔒"} 3-Day Streak</span>
                    </div>
                    <div className="flex items-center text-xs bg-white dark:bg-gray-800 p-2 rounded-md border border-amber-100 dark:border-amber-900">
                      <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                      <span>{streaks[bomb.id] >= 7 ? "✅" : "🔒"} 7-Day Streak</span>
                    </div>
                    <div className="flex items-center text-xs bg-white dark:bg-gray-800 p-2 rounded-md border border-amber-100 dark:border-amber-900">
                      <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                      <span>{streaks[bomb.id] >= 14 ? "✅" : "🔒"} 14-Day Streak</span>
                    </div>
                    <div className="flex items-center text-xs bg-white dark:bg-gray-800 p-2 rounded-md border border-amber-100 dark:border-amber-900">
                      <Trophy className="h-3 w-3 mr-1 text-amber-500" />
                      <span>{streaks[bomb.id] >= 30 ? "✅" : "🔒"} 30-Day Streak</span>
                    </div>
                  </div>
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TickBombDemo;
