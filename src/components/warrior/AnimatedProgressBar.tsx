
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "default" | "green" | "blue" | "purple" | "yellow" | "orange";
  size?: "sm" | "md" | "lg";
}

const AnimatedProgressBar = ({ 
  value, 
  max = 100, 
  className, 
  showPercentage = false,
  color = "default",
  size = "md"
}: AnimatedProgressBarProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min((value / max) * 100, 100);

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedValue(percentage);
    }, 200);

    return () => clearTimeout(timer);
  }, [percentage]);

  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "from-green-500 to-emerald-500";
      case "blue":
        return "from-blue-500 to-cyan-500";
      case "purple":
        return "from-purple-500 to-pink-500";
      case "yellow":
        return "from-yellow-500 to-orange-500";
      case "orange":
        return "from-orange-500 to-red-500";
      default:
        return "from-purple-500 to-blue-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-2";
      case "lg":
        return "h-6";
      default:
        return "h-4";
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="relative overflow-hidden">
        <div className={cn(
          "w-full bg-gray-800/60 rounded-full border border-gray-700/50",
          getSizeClasses()
        )}>
          <div 
            className={cn(
              "h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r relative overflow-hidden",
              getColorClasses()
            )}
            style={{ width: `${animatedValue}%` }}
          >
            {/* Animated shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            
            {/* Moving highlight */}
            <div 
              className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"
              style={{ 
                left: `${Math.max(0, animatedValue - 8)}%`,
                opacity: animatedValue > 10 ? 1 : 0,
                animationDelay: '0.5s'
              }}
            />
          </div>
        </div>
      </div>
      
      {showPercentage && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;
