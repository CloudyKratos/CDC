
import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  showValues?: boolean;
  color?: "default" | "green" | "blue" | "purple" | "yellow" | "orange" | "red";
  size?: "sm" | "md" | "lg";
  animated?: boolean;
  label?: string;
}

const AnimatedProgressBar = ({ 
  value, 
  max = 100, 
  className, 
  showPercentage = false,
  showValues = false,
  color = "default",
  size = "md",
  animated = true,
  label
}: AnimatedProgressBarProps) => {
  const [animatedValue, setAnimatedValue] = useState(0);
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setAnimatedValue(percentage);
      }, 200);
      return () => clearTimeout(timer);
    } else {
      setAnimatedValue(percentage);
    }
  }, [percentage, animated]);

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
      case "red":
        return "from-red-500 to-pink-500";
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
    <div className={cn("w-full space-y-2", className)}>
      {label && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-gray-300">{label}</span>
          {showPercentage && (
            <span className="text-sm text-gray-400">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      
      <div className="relative overflow-hidden">
        <div className={cn(
          "w-full bg-gray-800/60 rounded-full border border-gray-700/50 relative overflow-hidden",
          getSizeClasses()
        )}>
          {/* Background pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-gray-700/20 to-gray-600/20" />
          
          {/* Progress fill */}
          <div 
            className={cn(
              "h-full rounded-full relative overflow-hidden transition-all duration-1000 ease-out bg-gradient-to-r",
              getColorClasses(),
              animated ? "transition-all duration-1000 ease-out" : ""
            )}
            style={{ width: `${animatedValue}%` }}
          >
            {/* Animated shine effect */}
            {animated && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse" />
            )}
            
            {/* Moving highlight */}
            {animated && animatedValue > 10 && (
              <div 
                className="absolute top-0 h-full w-8 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                style={{ 
                  left: `${Math.max(0, animatedValue - 8)}%`,
                  animation: 'pulse 2s infinite'
                }}
              />
            )}
          </div>
        </div>
      </div>
      
      {showValues && (
        <div className="flex justify-between text-xs text-gray-400">
          <span>{value}</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
};

export default AnimatedProgressBar;
