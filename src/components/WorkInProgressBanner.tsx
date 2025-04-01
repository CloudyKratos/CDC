
import React from "react";
import { AlertTriangle, Tool } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { cn } from "@/lib/utils";

interface WorkInProgressBannerProps {
  title?: string;
  description?: string;
  className?: string;
  variant?: "default" | "compact";
}

const WorkInProgressBanner: React.FC<WorkInProgressBannerProps> = ({
  title = "Work in Progress",
  description = "This feature is currently under development and will be available soon.",
  className,
  variant = "default"
}) => {
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

  return (
    <Alert 
      className={cn(
        "bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800/30",
        className
      )}
    >
      <div className="flex items-start">
        <Tool className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5 mr-2" />
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
