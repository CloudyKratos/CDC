
import React from "react";
import { AlertCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ComingSoonBannerProps {
  title: string;
  description?: string;
  className?: string;
  showNotifyButton?: boolean;
}

const ComingSoonBanner: React.FC<ComingSoonBannerProps> = ({
  title,
  description = "We're working hard to bring this feature to you soon!",
  className = "",
  showNotifyButton = true
}) => {
  return (
    <div className={`relative overflow-hidden rounded-lg border p-4 ${className}`}>
      <div className="absolute inset-0 bg-celestial-dark/90 backdrop-blur-sm z-0"></div>
      
      <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-celestial-gold/20 flex items-center justify-center">
            <Clock className="h-5 w-5 text-celestial-gold" />
          </div>
          <div className="ml-4">
            <h3 className="text-lg font-medium text-white">{title}</h3>
            <p className="text-sm text-white/70">{description}</p>
          </div>
        </div>
        
        {showNotifyButton && (
          <Button 
            variant="outline" 
            className="border-celestial-gold/50 text-celestial-gold hover:bg-celestial-gold/10"
          >
            Notify me when available
          </Button>
        )}
      </div>
      
      <div className="absolute -top-12 -right-12 h-24 w-24 rounded-full bg-celestial-gold/10 blur-2xl"></div>
      <div className="absolute -bottom-12 -left-12 h-24 w-24 rounded-full bg-celestial-gold/10 blur-2xl"></div>
    </div>
  );
};

export default ComingSoonBanner;
