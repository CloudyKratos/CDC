
import React from "react";
import { LucideIcon } from "lucide-react";

interface FeatureBadgeProps {
  icon?: LucideIcon;
  text: string;
}

export const FeatureBadge: React.FC<FeatureBadgeProps> = ({ icon: Icon, text }) => {
  return (
    <div className="flex items-center bg-white/80 dark:bg-gray-800/80 rounded-full px-3 py-1.5 text-sm border border-gray-100/20 dark:border-gray-700/20 shadow-sm transition-all hover:shadow-md hover:-translate-y-0.5">
      {Icon && <Icon size={14} className="mr-1.5 text-primary" />}
      <span>{text}</span>
    </div>
  );
};

export default FeatureBadge;
