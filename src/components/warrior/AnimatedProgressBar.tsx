
import React, { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  color?: "default" | "green" | "blue" | "purple" | "yellow";
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
    }, 100);

    return () => clearTimeout(timer);
  }, [percentage]);

  const getColorClasses = () => {
    switch (color) {
      case "green":
        return "bg-green-500";
      case "blue":
        return "bg-blue-500";
      case "purple":
        return "bg-purple-500";
      case "yellow":
        return "bg-yellow-500";
      default:
        return "bg-gradient-to-r from-purple-500 to-blue-500";
    }
  };

  const getSizeClasses = () => {
    switch (size) {
      case "sm":
        return "h-2";
      case "lg":
        return "h-4";
      default:
        return "h-3";
    }
  };

  return (
    <div className={cn("w-full space-y-1", className)}>
      <div className="relative">
        <Progress 
          value={animatedValue} 
          className={cn("transition-all duration-1000 ease-out", getSizeClasses())}
          style={{
            background: "rgba(107, 114, 128, 0.2)"
          }}
        />
        <div 
          className={cn(
            "absolute top-0 left-0 h-full rounded-full transition-all duration-1000 ease-out",
            getColorClasses()
          )}
          style={{ width: `${animatedValue}%` }}
        />
        
        {/* Shine effect */}
        <div 
          className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent rounded-full animate-pulse"
          style={{ 
            left: `${Math.max(0, animatedValue - 8)}%`,
            opacity: animatedValue > 5 ? 1 : 0
          }}
        />
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
