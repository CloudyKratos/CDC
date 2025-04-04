
import React, { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Clock, CheckCircle, AlertTriangle, AlertCircle, Camera, Waves, BrainCircuit, SunMedium, Sunrise, MoonStar, Play, Pause, PlusCircle, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { TaskType, TimeBombSeverity } from "@/types/workspace";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

interface AccountabilityTimeBombProps {
  title: string;
  description?: string;
  duration: number; // in minutes
  severity: TimeBombSeverity;
  taskType: TaskType;
  onComplete?: () => void;
  onTimeout?: () => void;
  className?: string;
  streakCount?: number;
  enableGamification?: boolean;
}

const AccountabilityTimeBomb: React.FC<AccountabilityTimeBombProps> = ({
  title,
  description,
  duration,
  severity = "medium",
  taskType = "daily",
  onComplete,
  onTimeout,
  className,
  streakCount = 0,
  enableGamification = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isPaused, setIsPaused] = useState(true);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const [extensionMinutes, setExtensionMinutes] = useState(5);
  const [showSettings, setShowSettings] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [autoStartNext, setAutoStartNext] = useState(false);
  const [earnedPoints, setEarnedPoints] = useState(0);
  const [hasStarted, setHasStarted] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalSeconds = duration * 60;
  const progressPercentage = (timeLeft / totalSeconds) * 100;
  
  const calculatePointsForCompletion = () => {
    // Points are based on:
    // 1. Task duration (longer tasks give more points)
    // 2. Severity (higher severity gives more points)
    // 3. Streak (consecutive completions multiply points)
    
    let basePoints = Math.floor(duration / 5) * 10; // 10 points per 5 minutes
    
    // Severity multiplier
    const severityMultiplier = {
      low: 1,
      medium: 1.5,
      high: 2,
      critical: 3
    };
    
    basePoints *= severityMultiplier[severity];
    
    // Streak bonus (max 2x multiplier)
    const streakMultiplier = Math.min(2, 1 + (streakCount * 0.1));
    
    return Math.round(basePoints * streakMultiplier);
  };
  
  const getSeverityColor = () => {
    switch (severity) {
      case "low":
        return "bg-blue-500 text-blue-50";
      case "medium":
        return "bg-yellow-500 text-yellow-50";
      case "high":
        return "bg-orange-500 text-orange-50";
      case "critical":
        return "bg-red-500 text-red-50";
      default:
        return "bg-gray-500 text-gray-50";
    }
  };
  
  const getTaskIcon = () => {
    switch (taskType) {
      case "morning":
        return <Sunrise className="h-5 w-5" />;
      case "daily":
        return <SunMedium className="h-5 w-5" />;
      case "weekly":
        return <BrainCircuit className="h-5 w-5" />;
      case "meditation":
        return <BrainCircuit className="h-5 w-5" />;
      case "workout":
        return <Waves className="h-5 w-5" />;
      case "evening":
        return <MoonStar className="h-5 w-5" />;
      case "custom":
      default:
        return <Waves className="h-5 w-5" />;
    }
  };
  
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isActive && !isPaused && !isCompleted) {
      intervalRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(intervalRef.current as NodeJS.Timeout);
            setIsActive(false);
            if (onTimeout) onTimeout();
            toast.error("Time's up!", {
              description: "Your accountability activity has timed out.",
              duration: 5000,
            });
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, isCompleted, onTimeout]);
  
  const handleStart = () => {
    setIsPaused(false);
    setHasStarted(true);
    toast.info("Timer started", {
      description: "Focus on completing your task.",
      duration: 3000,
    });
  };
  
  const handleComplete = () => {
    setIsCompleted(true);
    setIsActive(false);
    
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    if (enableGamification) {
      const points = calculatePointsForCompletion();
      setEarnedPoints(points);
      setShowConfetti(true);
      
      setTimeout(() => {
        setShowConfetti(false);
      }, 3000);
    }
    
    if (onComplete) onComplete();
    
    toast.success("Task completed!", {
      description: enableGamification ? `Great job! You earned ${calculatePointsForCompletion()} points.` : "Great job completing your accountability task.",
      duration: 5000,
    });
  };
  
  const handlePauseResume = () => {
    setIsPaused((prev) => !prev);
    if (isPaused) {
      toast.info("Timer resumed", {
        description: "Your accountability timer is running again.",
        duration: 3000,
      });
    } else {
      toast.info("Timer paused", {
        description: "Your accountability timer is paused.",
        duration: 3000,
      });
    }
  };
  
  const handleExtendTime = () => {
    setTimeLeft((prevTime) => prevTime + (extensionMinutes * 60));
    setShowExtendDialog(false);
    toast.success(`Added ${extensionMinutes} minutes`, {
      description: "Your accountability timer has been extended.",
      duration: 3000,
    });
  };
  
  const getProgressColor = () => {
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 66) return "bg-green-500";
    if (percentage > 33) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const getSeverityIcon = () => {
    switch (severity) {
      case "low":
        return <CheckCircle className="h-5 w-5" />;
      case "medium":
        return <AlertTriangle className="h-5 w-5" />;
      case "high":
        return <AlertCircle className="h-5 w-5" />;
      case "critical":
        return <BellRing className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  if (isCompleted) {
    return (
      <Card className={cn("w-full bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800", className)}>
        <CardHeader className="pb-2">
          <div className="flex justify-between items-center">
            <CardTitle className="text-base text-green-800 dark:text-green-300 flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600 dark:text-green-400" />
              {title}
            </CardTitle>
            <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800">
              Completed
            </Badge>
          </div>
          <CardDescription className="text-green-700 dark:text-green-300 opacity-90">
            {description || "You've successfully completed this accountability task."}
          </CardDescription>
        </CardHeader>
        {enableGamification && (
          <CardContent className="pb-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-4 w-4 mr-2 text-yellow-500" />
                <span className="font-medium text-sm">Points earned:</span>
              </div>
              <span className="text-yellow-600 dark:text-yellow-400 font-bold">{earnedPoints}</span>
            </div>
            {streakCount > 0 && (
              <div className="flex items-center justify-between mt-2">
                <div className="flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-orange-500" />
                  <span className="font-medium text-sm">Current streak:</span>
                </div>
                <span className="text-orange-600 dark:text-orange-400 font-bold">{streakCount} days</span>
              </div>
            )}
          </CardContent>
        )}
      </Card>
    );
  }
  
  return (
    <Card className={cn("w-full relative", className, isActive ? "border-yellow-200 dark:border-yellow-800" : "border-red-200 dark:border-red-800")}>
      {showConfetti && (
        <div className="absolute inset-0 z-10 pointer-events-none">
          {/* Confetti effect would be rendered here (using a confetti library) */}
          <div className="absolute top-0 left-1/4 animate-bounce">✨</div>
          <div className="absolute top-10 left-1/2 animate-bounce delay-100">🎉</div>
          <div className="absolute top-5 right-1/4 animate-bounce delay-200">🏆</div>
          <div className="absolute top-20 left-1/3 animate-bounce delay-300">🌟</div>
        </div>
      )}
      
      <CardHeader className={cn("pb-2", !isActive ? "bg-red-50 dark:bg-red-900/20" : "")}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            {getTaskIcon()}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <div className="flex items-center">
            {streakCount > 0 && enableGamification && (
              <Badge variant="outline" className="mr-2 bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800">
                <Sparkles className="h-3 w-3 mr-1" /> {streakCount} streak
              </Badge>
            )}
            <Badge className={cn("ml-2", getSeverityColor())}>
              <span className="flex items-center">
                {getSeverityIcon()}
                <span className="ml-1 capitalize">{severity}</span>
              </span>
            </Badge>
          </div>
        </div>
        <CardDescription>
          {description || "Complete this task within the time limit to maintain your streak."}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm font-medium">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-1 text-gray-500" />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <span className="text-xs text-gray-500">
              {Math.floor((progressPercentage + 0.5))}% remaining
            </span>
          </div>
          
          <Progress 
            value={progressPercentage} 
            className="h-2 w-full bg-gray-100 dark:bg-gray-800"
          />
          
          {!isActive && !isCompleted && (
            <div className="mt-2 text-center text-sm text-red-600 dark:text-red-400 font-medium">
              Time's up! Your accountability bomb has detonated.
            </div>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        {isActive ? (
          <>
            {!hasStarted ? (
              <Button 
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                onClick={handleStart}
              >
                <Play className="h-4 w-4 mr-2" /> Start Timer
              </Button>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handlePauseResume}
                >
                  {isPaused ? <Play className="h-4 w-4 mr-1" /> : <Pause className="h-4 w-4 mr-1" />}
                  {isPaused ? "Resume" : "Pause"}
                </Button>
                <div className="space-x-2">
                  <Popover open={showExtendDialog} onOpenChange={setShowExtendDialog}>
                    <PopoverTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                      >
                        <PlusCircle className="h-4 w-4 mr-1" /> Extend
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-80">
                      <div className="space-y-4">
                        <h4 className="font-medium">Extend timer</h4>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span>Additional minutes: {extensionMinutes}</span>
                          </div>
                          <Slider
                            value={[extensionMinutes]}
                            min={1}
                            max={30}
                            step={1}
                            onValueChange={(value) => setExtensionMinutes(value[0])}
                          />
                        </div>
                        <div className="flex justify-end space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => setShowExtendDialog(false)}
                          >
                            Cancel
                          </Button>
                          <Button 
                            size="sm" 
                            onClick={handleExtendTime}
                          >
                            Add Time
                          </Button>
                        </div>
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Button 
                    variant="default" 
                    size="sm" 
                    onClick={handleComplete}
                  >
                    <CheckCircle className="h-4 w-4 mr-1" /> Complete
                  </Button>
                </div>
              </>
            )}
          </>
        ) : (
          <div className="w-full">
            <Button 
              variant="destructive" 
              size="sm" 
              className="w-full"
              onClick={handleComplete}
            >
              <Camera className="mr-2 h-4 w-4" />
              Complete Anyway
            </Button>
          </div>
        )}
      </CardFooter>
      
      {enableGamification && (
        <div className="absolute top-3 right-3">
          <Popover open={showSettings} onOpenChange={setShowSettings}>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full">
                <Sparkles className="h-4 w-4 text-yellow-500" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80" align="end">
              <div className="space-y-4">
                <h4 className="font-medium">Gamification Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="auto-start">Auto-start next bomb</Label>
                      <p className="text-xs text-muted-foreground">
                        Automatically start the next scheduled bomb
                      </p>
                    </div>
                    <Switch
                      id="auto-start"
                      checked={autoStartNext}
                      onCheckedChange={setAutoStartNext}
                    />
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      )}
    </Card>
  );
};

export default AccountabilityTimeBomb;
