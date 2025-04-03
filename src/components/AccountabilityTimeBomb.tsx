
import React, { useState, useEffect, useRef } from "react";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { BellRing, Clock, CheckCircle, AlertTriangle, AlertCircle, Camera, Waves, BrainCircuit, SunMedium, Sunrise, MoonStar } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

type TimeBombSeverity = "low" | "medium" | "high" | "critical";
type TaskType = "morning" | "daily" | "weekly" | "custom";

interface AccountabilityTimeBombProps {
  title: string;
  description?: string;
  duration: number; // in minutes
  severity: TimeBombSeverity;
  taskType: TaskType;
  onComplete?: () => void;
  onTimeout?: () => void;
  className?: string;
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
}) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isPaused, setIsPaused] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showExtendDialog, setShowExtendDialog] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  
  const totalSeconds = duration * 60;
  const progressPercentage = (timeLeft / totalSeconds) * 100;
  
  // Get color based on severity
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
  
  // Get icon based on task type
  const getTaskIcon = () => {
    switch (taskType) {
      case "morning":
        return <Sunrise className="h-5 w-5" />;
      case "daily":
        return <SunMedium className="h-5 w-5" />;
      case "weekly":
        return <BrainCircuit className="h-5 w-5" />;
      case "custom":
        return <Waves className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  // Format time as mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Start timer
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
  
  // Handle task completion
  const handleComplete = () => {
    setIsCompleted(true);
    setIsActive(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    if (onComplete) onComplete();
    toast.success("Task completed!", {
      description: "Great job completing your accountability task.",
      duration: 5000,
    });
  };
  
  // Handle pause/resume
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
  
  // Add 5 minutes to the timer
  const handleExtendTime = (additionalMinutes: number) => {
    setTimeLeft((prevTime) => prevTime + (additionalMinutes * 60));
    setShowExtendDialog(false);
    toast.success(`Added ${additionalMinutes} minutes`, {
      description: "Your accountability timer has been extended.",
      duration: 3000,
    });
  };
  
  // Get progress bar color based on remaining time percentage
  const getProgressColor = () => {
    const percentage = (timeLeft / totalSeconds) * 100;
    if (percentage > 66) return "bg-green-500";
    if (percentage > 33) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  // Get severity icon
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
      </Card>
    );
  }
  
  return (
    <Card className={cn("w-full", className, isActive ? "border-yellow-200 dark:border-yellow-800" : "border-red-200 dark:border-red-800")}>
      <CardHeader className={cn("pb-2", !isActive ? "bg-red-50 dark:bg-red-900/20" : "")}>
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center">
            {getTaskIcon()}
            <span className="ml-2">{title}</span>
          </CardTitle>
          <Badge className={cn("ml-2", getSeverityColor())}>
            <span className="flex items-center">
              {getSeverityIcon()}
              <span className="ml-1 capitalize">{severity}</span>
            </span>
          </Badge>
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
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handlePauseResume}
            >
              {isPaused ? "Resume" : "Pause"}
            </Button>
            <div className="space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExtendTime(5)}
              >
                +5 Min
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleComplete}
              >
                Complete
              </Button>
            </div>
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
    </Card>
  );
};

export default AccountabilityTimeBomb;
