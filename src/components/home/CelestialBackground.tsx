
import React, { useEffect, useRef } from "react";

interface Star {
  x: number;
  y: number;
  size: number;
  opacity: number;
  animationDelay: string;
}

interface CelestialBackgroundProps {
  className?: string;
  starCount?: number;
  backgroundImage?: string;
  overlayColor?: string;
}

const CelestialBackground: React.FC<CelestialBackgroundProps> = ({
  className = "",
  starCount = 80,
  backgroundImage = "/public/lovable-uploads/f61a938f-4bf8-44f0-8e79-84bbe1a177b0.png",
  overlayColor = "rgba(8, 16, 33, 0.7)"
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [stars, setStars] = React.useState<Star[]>([]);
  
  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const newStars: Star[] = [];
      
      for (let i = 0; i < starCount; i++) {
        newStars.push({
          x: Math.random() * clientWidth,
          y: Math.random() * clientHeight,
          size: Math.random() * 2 + 1,
          opacity: Math.random() * 0.7 + 0.3,
          animationDelay: `${Math.random() * 4}s`
        });
      }
      
      setStars(newStars);
    }
  }, [starCount]);
  
  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}
      style={{
        backgroundImage: `url('${backgroundImage}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      }}
    >
      <div
        className="absolute inset-0"
        style={{ backgroundColor: overlayColor }}
      ></div>
      
      {stars.map((star, index) => (
        <div
          key={index}
          className="star"
          style={{
            left: `${star.x}px`,
            top: `${star.y}px`,
            width: `${star.size}px`,
            height: `${star.size}px`,
            opacity: star.opacity,
            animationDelay: star.animationDelay
          }}
        ></div>
      ))}
      
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-celestial-dark/80"></div>
    </div>
  );
};

export default CelestialBackground;
