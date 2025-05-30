
import React from "react";
import CelestialBackground from "./CelestialBackground";

interface TopographicBackgroundProps {
  className?: string;
  variant?: "default" | "modern" | "celestial" | "whales";
}

const TopographicBackground: React.FC<TopographicBackgroundProps> = ({ 
  className,
  variant = "whales" 
}) => {
  if (variant === "whales") {
    return <CelestialBackground 
      className={className} 
      backgroundImage="/lovable-uploads/be262162-c56d-43d0-8722-602aa9fa0cba.png"
      overlayColor="rgba(8, 16, 33, 0.7)"
      showWhales={true}
    />;
  }
  
  if (variant === "celestial") {
    return <CelestialBackground className={className} />;
  }
  
  if (variant === "modern") {
    return (
      <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
        <div className="absolute inset-0 bg-[url('/lovable-uploads/17e88902-c856-44b9-9f88-8a1af08c7e00.png')] bg-repeat opacity-[0.15] dark:opacity-[0.08]"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80"></div>
      </div>
    );
  }
  
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute w-full h-full opacity-5 dark:opacity-[0.02]"
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
      >
        <defs>
          <pattern
            id="topographic-pattern"
            patternUnits="userSpaceOnUse"
            width="100"
            height="100"
            patternTransform="scale(0.5) rotate(0)"
          >
            <path
              d="M50,0 C77.6,0 100,22.4 100,50 C100,77.6 77.6,100 50,100 C22.4,100 0,77.6 0,50 C0,22.4 22.4,0 50,0 Z M50,10 C72.1,10 90,27.9 90,50 C90,72.1 72.1,90 50,90 C27.9,90 10,72.1 10,50 C10,27.9 27.9,10 50,10 Z M50,20 C66.6,20 80,33.4 80,50 C80,66.6 66.6,80 50,80 C33.4,80 20,66.6 20,50 C20,33.4 33.4,20 50,20 Z M50,30 C61.0,30 70,39.0 70,50 C70,61.0 61.0,70 50,70 C39.0,70 30,61.0 30,50 C30,39.0 39.0,30 50,30 Z M50,40 C55.5,40 60,44.5 60,50 C60,55.5 55.5,60 50,60 C44.5,60 40,55.5 40,50 C40,44.5 44.5,40 50,40 Z"
              fill="currentColor"
            />
          </pattern>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="url(#topographic-pattern)"
        />
      </svg>
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80"></div>
    </div>
  );
};

export default TopographicBackground;
