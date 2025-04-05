
import React from "react";
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "small" | "medium" | "large";
  className?: string;
  message?: string;
}

export function Loading({ 
  size = "medium", 
  className,
  message
}: LoadingProps) {
  const sizeClass = {
    small: "w-4 h-4 border-2",
    medium: "w-8 h-8 border-3",
    large: "w-12 h-12 border-4",
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div 
        className={cn(
          "animate-spin rounded-full border-t-transparent border-primary", 
          sizeClass[size]
        )}
      />
      {message && (
        <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">{message}</p>
      )}
    </div>
  );
}

export function PageLoader() {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm z-50">
      <div className="text-center">
        <div className="loading-spinner mx-auto"></div>
        <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
      </div>
    </div>
  );
}
