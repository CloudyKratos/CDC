
import React from "react";
import { AlertTriangle, Clock, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface InProgressFeatureBannerProps {
  title: string;
  description?: string;
  type?: "info" | "warning" | "coming-soon";
  className?: string;
  actions?: {
    label: string;
    onClick: () => void;
  }[];
}

const InProgressFeatureBanner: React.FC<InProgressFeatureBannerProps> = ({
  title,
  description,
  type = "info",
  className = "",
  actions = []
}) => {
  const getBgColor = () => {
    switch (type) {
      case "warning":
        return "bg-amber-500/10 border-amber-500/30 dark:bg-amber-500/5";
      case "coming-soon":
        return "bg-celestial-gold/10 border-celestial-gold/30 dark:bg-celestial-gold/5";
      default:
        return "bg-blue-500/10 border-blue-500/30 dark:bg-blue-500/5";
    }
  };
  
  const getIcon = () => {
    switch (type) {
      case "warning":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "coming-soon":
        return <Clock className="h-5 w-5 text-celestial-gold" />;
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };
  
  return (
    <div className={`rounded-lg border p-4 ${getBgColor()} ${className}`}>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-3">
        <div className="flex items-start space-x-4">
          <div className="mt-0.5">{getIcon()}</div>
          <div>
            <h3 className="font-medium text-foreground">{title}</h3>
            {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
          </div>
        </div>
        
        {actions.length > 0 && (
          <div className="flex flex-wrap gap-2 ml-9 sm:ml-0">
            {actions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                onClick={action.onClick}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InProgressFeatureBanner;
