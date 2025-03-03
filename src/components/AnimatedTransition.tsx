
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";

interface AnimatedTransitionProps {
  children: React.ReactNode;
}

export const AnimatedTransition: React.FC<AnimatedTransitionProps> = ({ children }) => {
  const location = useLocation();
  const [displayLocation, setDisplayLocation] = useState(location);
  const [transitionStage, setTransitionStage] = useState("enter");

  useEffect(() => {
    if (location !== displayLocation) {
      setTransitionStage("exit");
    }
  }, [location, displayLocation]);

  const handleAnimationEnd = () => {
    if (transitionStage === "exit") {
      setTransitionStage("enter");
      setDisplayLocation(location);
    }
  };

  return (
    <div
      className={`w-full transition-opacity duration-300 ease-in-out ${
        transitionStage === "enter" ? "opacity-100" : "opacity-0"
      }`}
      onAnimationEnd={handleAnimationEnd}
    >
      {children}
    </div>
  );
};
