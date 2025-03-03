
import React from "react";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Logo: React.FC<LogoProps> = ({ size = "md", className }) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-3xl",
  };

  return (
    <div className={cn("font-semibold tracking-tight flex items-center", sizeClasses[size], className)}>
      <span className="text-primary mr-1">N</span>
      <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-primary/60">exus</span>
    </div>
  );
};
