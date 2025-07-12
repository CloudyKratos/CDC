
import React from 'react';
import { Button } from '@/components/ui/button';
import { Lock, Unlock, Coins } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';

interface CourseUnlockButtonProps {
  courseId: string;
  courseName: string;
  cost: number;
  className?: string;
  onUnlocked?: () => void;
}

const CourseUnlockButton: React.FC<CourseUnlockButtonProps> = ({
  courseId,
  courseName,
  cost,
  className,
  onUnlocked
}) => {
  const { coins, unlockCourse } = useCoins();
  const [isUnlocking, setIsUnlocking] = React.useState(false);
  const [isUnlocked, setIsUnlocked] = React.useState(false);

  const canAfford = coins.balance >= cost;

  const handleUnlock = async () => {
    setIsUnlocking(true);
    try {
      const success = await unlockCourse(courseId, cost);
      if (success) {
        setIsUnlocked(true);
        onUnlocked?.();
      }
    } finally {
      setIsUnlocking(false);
    }
  };

  if (isUnlocked) {
    return (
      <Button variant="outline" className={className} disabled>
        <Unlock className="w-4 h-4 mr-2" />
        Unlocked
      </Button>
    );
  }

  return (
    <Button
      onClick={handleUnlock}
      disabled={!canAfford || isUnlocking}
      variant={canAfford ? "default" : "outline"}
      className={className}
    >
      <Lock className="w-4 h-4 mr-2" />
      {isUnlocking ? 'Unlocking...' : (
        <>
          <Coins className="w-4 h-4 mr-1" />
          {cost} Coins
        </>
      )}
    </Button>
  );
};

export default CourseUnlockButton;
