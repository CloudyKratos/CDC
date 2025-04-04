
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
      
      {/* Cosmic elements */}
      <div className="absolute -right-8 top-4 w-16 h-16 opacity-20">
        <div className="w-full h-full animate-float">
          <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#d4af37" strokeWidth="1.5">
            <path d="M50,10 C70,10 85,30 85,50 C85,70 70,90 50,90 C30,90 15,70 15,50 C15,30 30,10 50,10 Z" />
            <path d="M50,20 C65,20 75,35 75,50 C75,65 65,80 50,80 C35,80 25,65 25,50 C25,35 35,20 50,20 Z" />
            <line x1="50" y1="0" x2="50" y2="20" />
            <line x1="50" y1="80" x2="50" y2="100" />
          </svg>
        </div>
      </div>
      
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
