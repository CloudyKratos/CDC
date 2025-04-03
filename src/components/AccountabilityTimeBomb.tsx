
import React, { useState, useEffect, useContext } from "react";
import { AlertTriangle, Clock, CheckCircle2, BellRing, Shield, X } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { AuthContext } from "@/App";
import { cn } from "@/lib/utils";

interface AccountabilityTimeBombProps {
  title?: string;
  description?: string;
  duration?: number; // In minutes
  severity?: 'low' | 'medium' | 'high' | 'critical';
  taskType?: 'morning' | 'evening' | 'workout' | 'meditation' | 'custom';
  className?: string;
  onComplete?: () => void;
  onTimeout?: () => void;
  dismissable?: boolean;
}

const AccountabilityTimeBomb: React.FC<AccountabilityTimeBombProps> = ({
  title = "Accountability Time Bomb",
  description = "Complete your task before the timer runs out to maintain your streak and accountability",
  duration = 60,
  severity = 'medium',
  taskType = 'morning',
  className,
  onComplete,
  onTimeout,
  dismissable = false
}) => {
  const { user } = useContext(AuthContext);
  const [remainingTime, setRemainingTime] = useState<number>(duration * 60); // Convert to seconds
  const [lastActivity, setLastActivity] = useState<number>(Date.now());
  const [progress, setProgress] = useState<number>(100);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [isComplete, setIsComplete] = useState<boolean>(false);
  const [warningTriggered, setWarningTriggered] = useState<boolean>(false);
  
  // Update time and check for activity
  useEffect(() => {
    if (isDismissed || isComplete) return;
    
    // Reset activity tracker on user interaction
    const resetActivity = () => {
      setLastActivity(Date.now());
    };
    
    // Track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetActivity);
    });
    
    // Timer countdown
    const timer = setInterval(() => {
      const inactiveTime = Math.floor((Date.now() - lastActivity) / 1000);
      
      // If user has been inactive for more than 30 seconds, time runs out faster
      const timeDeduction = inactiveTime > 30 ? 2 : 1; // 2 seconds deducted when inactive
      
      // Update remaining time
      setRemainingTime(prev => {
        const newTime = Math.max(0, prev - timeDeduction);
        
        // Calculate progress percentage
        const newProgress = (newTime / (duration * 60)) * 100;
        setProgress(newProgress);
        
        // Warning at 25% remaining
        if (newProgress <= 25 && !warningTriggered) {
          toast.warning("Time is running out!", {
            description: "Complete your task soon to maintain accountability",
            duration: 5000,
          });
          setWarningTriggered(true);
        }
        
        // Time's up
        if (newTime === 0 && onTimeout) {
          toast.error("Accountability breach!", {
            description: "Your time has run out without completing the required task",
            duration: 8000,
          });
          onTimeout();
        }
        
        return newTime;
      });
    }, 1000);
    
    return () => {
      clearInterval(timer);
      events.forEach(event => {
        window.removeEventListener(event, resetActivity);
      });
    };
  }, [duration, lastActivity, onTimeout, isDismissed, isComplete, warningTriggered]);
  
  const handleComplete = () => {
    setIsComplete(true);
    toast.success("Task completed!", {
      description: "You've successfully completed your accountability task",
    });
    if (onComplete) onComplete();
  };
  
  const handleDismiss = () => {
    if (dismissable) {
      setIsDismissed(true);
      toast.info("Time bomb dismissed", {
        description: "You've dismissed this reminder, but remember your commitment"
      });
    } else {
      toast.error("Cannot dismiss", {
        description: "This accountability timer cannot be dismissed"
      });
    }
  };
  
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Don't render if dismissed or complete
  if (isDismissed || isComplete) return null;
  
  // Determine severity styles
  const getSeverityStyles = () => {
    switch (severity) {
      case 'low':
        return {
          bg: "bg-blue-50 dark:bg-blue-900/20",
          border: "border-blue-200 dark:border-blue-800/30",
          text: "text-blue-800 dark:text-blue-300",
          icon: <Clock className="h-5 w-5 text-blue-600 dark:text-blue-400" />,
          progress: "bg-blue-600 dark:bg-blue-400"
        };
      case 'medium':
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800/30",
          text: "text-yellow-800 dark:text-yellow-300",
          icon: <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
          progress: "bg-yellow-600 dark:bg-yellow-400"
        };
      case 'high':
        return {
          bg: "bg-orange-50 dark:bg-orange-900/20",
          border: "border-orange-200 dark:border-orange-800/30",
          text: "text-orange-800 dark:text-orange-300",
          icon: <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />,
          progress: "bg-orange-600 dark:bg-orange-400"
        };
      case 'critical':
        return {
          bg: "bg-red-50 dark:bg-red-900/20",
          border: "border-red-200 dark:border-red-800/30", 
          text: "text-red-800 dark:text-red-300",
          icon: <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />,
          progress: "bg-red-600 dark:bg-red-400"
        };
      default:
        return {
          bg: "bg-yellow-50 dark:bg-yellow-900/20",
          border: "border-yellow-200 dark:border-yellow-800/30",
          text: "text-yellow-800 dark:text-yellow-300",
          icon: <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />,
          progress: "bg-yellow-600 dark:bg-yellow-400"
        };
    }
  };
  
  // Get task type icon
  const getTaskIcon = () => {
    switch (taskType) {
      case 'morning':
        return <Clock className="h-5 w-5" />;
      case 'evening':
        return <BellRing className="h-5 w-5" />;
      case 'workout':
        return <Shield className="h-5 w-5" />;
      case 'meditation':
        return <CheckCircle2 className="h-5 w-5" />;
      default:
        return <Clock className="h-5 w-5" />;
    }
  };
  
  const styles = getSeverityStyles();
  const isUrgent = progress <= 25;
  
  // Compact version - alert style
  if (duration <= 15 || progress <= 15) {
    return (
      <Alert 
        className={cn(
          styles.bg,
          styles.border,
          isUrgent && "animate-pulse",
          className
        )}
      >
        <div className="flex items-start space-x-3">
          {styles.icon}
          <div className="flex-1">
            <AlertTitle className={styles.text}>{title}</AlertTitle>
            <AlertDescription className="text-sm flex items-center justify-between">
              <span className={isUrgent ? "text-red-700 dark:text-red-400" : undefined}>
                {description}
              </span>
              <Badge 
                variant="outline" 
                className={cn(
                  "ml-2 font-mono text-sm",
                  isUrgent ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300" : styles.text
                )}
              >
                {formatTime(remainingTime)}
              </Badge>
            </AlertDescription>
            <Progress 
              value={progress} 
              className={cn("h-1 mt-2", isUrgent ? "bg-red-200 dark:bg-red-950" : "bg-gray-200 dark:bg-gray-800")}
              indicatorClassName={isUrgent ? "bg-red-600 dark:bg-red-400" : styles.progress}
            />
          </div>
          <div className="flex items-center gap-2">
            <Button 
              size="sm" 
              className={cn(
                "bg-green-600 hover:bg-green-700 text-white",
                isUrgent && "animate-pulse"
              )}
              onClick={handleComplete}
            >
              Complete
            </Button>
            {dismissable && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-gray-500" 
                onClick={handleDismiss}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Alert>
    );
  }
  
  // Standard version - card style
  return (
    <Card className={cn(
      styles.bg, 
      styles.border,
      isUrgent && "shadow-lg shadow-red-500/10",
      className
    )}>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className={styles.text}>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <div className="h-10 w-10 rounded-full bg-white/80 dark:bg-gray-800/80 flex items-center justify-center">
            {getTaskIcon()}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <Badge variant="outline" className={cn(
              "text-sm font-normal",
              isUrgent ? "border-red-200 dark:border-red-800" : ""
            )}>
              Time Remaining
            </Badge>
            <Badge 
              variant={isUrgent ? "destructive" : "outline"} 
              className={cn(
                "text-xl px-3 py-1 font-mono",
                isUrgent ? "animate-pulse" : ""
              )}
            >
              {formatTime(remainingTime)}
            </Badge>
          </div>
          
          <Progress 
            value={progress} 
            className={cn("h-2", isUrgent ? "bg-red-200 dark:bg-red-950" : "bg-gray-200 dark:bg-gray-800")}
            indicatorClassName={isUrgent ? "bg-red-600 dark:bg-red-400" : styles.progress}
          />
          
          <div className="flex justify-between text-sm">
            <span className={styles.text}>
              {progress <= 25 
                ? "Critical - Act now!" 
                : progress <= 50 
                  ? "Urgent - Time is limited" 
                  : "Time remaining"}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {Math.floor(progress)}% remaining
            </span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t border-gray-100 dark:border-gray-800">
        {dismissable && (
          <Button 
            variant="outline" 
            className="bg-white dark:bg-gray-800"
            onClick={handleDismiss}
          >
            Dismiss
          </Button>
        )}
        <Button 
          className={cn(
            "ml-auto bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600",
            isUrgent && "animate-pulse from-green-600 to-emerald-600"
          )}
          onClick={handleComplete}
        >
          <CheckCircle2 className="mr-2 h-4 w-4" />
          Complete Task
        </Button>
      </CardFooter>
    </Card>
  );
};

export default AccountabilityTimeBomb;
