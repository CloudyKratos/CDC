
import React, { useState, useEffect } from "react";
import { AlertTriangle, Construction, Clock, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface WorkInProgressBannerProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact" | "tick-bomb";
  inactivityTimeout?: number; // In seconds
  onTimeout?: () => void;
}

const WorkInProgressBanner: React.FC<WorkInProgressBannerProps> = ({
  title = "Work in Progress",
  description = "This feature is currently under development and will be available soon.",
  className,
  variant = "default",
  inactivityTimeout = 60, // Default 60 seconds
  onTimeout
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(inactivityTimeout);
  const [isTicking, setIsTicking] = useState<boolean>(false);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  useEffect(() => {
    if (variant !== "tick-bomb") return;
    
    // Start the timer
    setIsTicking(true);
    
    // Function to track user activity
    const resetTimer = () => {
      setLastActivity(Date.now());
      if (!isTicking) {
        setTimeLeft(inactivityTimeout);
        setIsTicking(true);
      }
    };
    
    // Add event listeners to track user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      window.addEventListener(event, resetTimer);
    });
    
    // Start the countdown
    const interval = setInterval(() => {
      const inactiveTime = Math.floor((Date.now() - lastActivity) / 1000);
      
      // If user has been inactive for more than inactivityTimeout seconds
      if (inactiveTime >= inactivityTimeout) {
        if (onTimeout) onTimeout();
        setIsTicking(false);
        toast.warning("Your session is at risk due to inactivity", {
          description: "Please interact with the application to continue",
          duration: 5000
        });
      } else {
        // Update the time left
        setTimeLeft(inactivityTimeout - inactiveTime);
      }
    }, 1000);
    
    return () => {
      // Clean up event listeners and interval
      events.forEach(event => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [variant, inactivityTimeout, onTimeout, lastActivity, isTicking]);

  if (variant === "compact") {
    return (
      <div className={cn(
        "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30 rounded-md p-2 mb-4",
        className
      )}>
        <div className="flex items-center space-x-2 text-yellow-800 dark:text-yellow-300">
          <AlertTriangle className="h-4 w-4" />
          <p className="text-xs font-medium">{title}</p>
        </div>
      </div>
    );
  }

  if (variant === "tick-bomb") {
    // Critical time is 25% of the timeout
    const isWarning = timeLeft <= inactivityTimeout * 0.25;
    
    return (
      <Alert 
        className={cn(
          "bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/30 transition-all",
          isWarning && "animate-pulse bg-red-100 dark:bg-red-900/40 border-red-300 dark:border-red-700/60",
          className
        )}
      >
        <div className="flex items-start">
          <Clock className={cn(
            "h-5 w-5 mt-0.5 mr-2",
            isWarning 
              ? "text-red-600 dark:text-red-400" 
              : "text-orange-600 dark:text-orange-400"
          )} />
          <div className="flex-1">
            <AlertTitle className={cn(
              isWarning 
                ? "text-red-800 dark:text-red-300" 
                : "text-orange-800 dark:text-orange-300"
            )}>
              {title || "Activity Warning"}
            </AlertTitle>
            <AlertDescription className={cn(
              "text-sm flex items-center justify-between",
              isWarning 
                ? "text-red-700 dark:text-red-400" 
                : "text-orange-700 dark:text-orange-400"
            )}>
              <span>
                {description || "Your session requires activity to prevent automatic logout."}
              </span>
              <span className={cn(
                "font-mono font-bold ml-2 px-2 py-1 rounded",
                isWarning 
                  ? "bg-red-200 dark:bg-red-800/40 text-red-900 dark:text-red-200" 
                  : "bg-orange-200 dark:bg-orange-800/40 text-orange-900 dark:text-orange-200"
              )}>
                {Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}
              </span>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    );
  }

  return (
    <Alert 
      className={cn(
        "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30",
        className
      )}
    >
      <div className="flex items-start">
        <Construction className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
        <div>
          <AlertTitle className="text-yellow-800 dark:text-yellow-300">{title}</AlertTitle>
          <AlertDescription className="text-yellow-700 dark:text-yellow-400 text-sm">
            {description}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
};

export default WorkInProgressBanner;
