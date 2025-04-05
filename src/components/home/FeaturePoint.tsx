
import React from "react";
import { LucideIcon } from "lucide-react";

interface FeaturePointProps {
  text?: string;
  title?: string;
  description?: string;
  icon?: LucideIcon;
}

export const FeaturePoint: React.FC<FeaturePointProps> = ({ text, title, description, icon: Icon }) => {
  if (title && description) {
    return (
      <div className="flex items-start">
        {Icon ? (
          <div className="flex-shrink-0 mr-3">
            <Icon className="h-5 w-5 text-primary" />
          </div>
        ) : (
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center mt-1 mr-3 shadow-sm">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
        <div>
          <h4 className="font-medium">{title}</h4>
          <p className="text-gray-700 dark:text-gray-300">{description}</p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="flex items-start">
      <div className="w-5 h-5 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center mt-1 mr-3 shadow-sm">
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 3L4.5 8.5L2 6" stroke="#10B981" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <p className="text-gray-700 dark:text-gray-300">{text}</p>
    </div>
  );
};

export default FeaturePoint;
