
import React from "react";

interface FeaturePointProps {
  text: string;
}

export const FeaturePoint: React.FC<FeaturePointProps> = ({ text }) => {
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
