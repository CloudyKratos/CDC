
import React from "react";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
  className?: string;
}

export const FeatureCard: React.FC<FeatureCardProps> = ({ 
  icon: Icon, 
  title, 
  description, 
  delay = 0,
  className 
}) => {
  return (
    <div 
      className={cn(
        "bento-card animate-on-scroll opacity-0 transition-all duration-700 hover:shadow-lg hover:-translate-y-1 hover:bg-white/70 dark:hover:bg-gray-800/70",
        className
      )}
      style={{ transform: 'translateY(20px)', transitionDelay: `${delay}ms` }}
    >
      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-primary mb-4 group-hover:scale-110 transition-transform">
        <Icon size={24} />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400">{description}</p>
    </div>
  );
};

export default FeatureCard;
