
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Coins, Lock, Unlock, Loader2 } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { toast } from 'sonner';

interface CourseUnlockButtonProps {
  courseId: string;
  courseName: string;
  cost: number;
  onUnlocked?: () => void;
  className?: string;
}

const CourseUnlockButton: React.FC<CourseUnlockButtonProps> = ({
  courseId,
  courseName,
  cost,
  onUnlocked,
  className = ''
}) => {
  const { coins, unlockCourse, isCourseUnlocked } = useCoins();
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isUnlocking, setIsUnlocking] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  // Check if course is already unlocked
  useEffect(() => {
    const checkUnlockStatus = async () => {
      setCheckingStatus(true);
      const unlocked = await isCourseUnlocked(courseId);
      setIsUnlocked(unlocked);
      setCheckingStatus(false);
    };

    checkUnlockStatus();
  }, [courseId, isCourseUnlocked]);

  const handleUnlock = async () => {
    if (coins.balance < cost) {
      toast.error('Insufficient coins!', {
        description: `You need ${cost} coins but only have ${coins.balance}. Complete more activities in Warrior Space to earn coins!`
      });
      return;
    }

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

  if (checkingStatus) {
    return (
      <Button disabled className={className}>
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
        Checking...
      </Button>
    );
  }

  if (isUnlocked) {
    return (
      <Badge variant="secondary" className={`${className} h-auto py-2 px-4`}>
        <Unlock className="w-4 h-4 mr-2 text-green-600" />
        Unlocked
      </Badge>
    );
  }

  const canAfford = coins.balance >= cost;

  return (
    <Button
      onClick={handleUnlock}
      disabled={isUnlocking || !canAfford}
      variant={canAfford ? "default" : "outline"}
      className={className}
    >
      {isUnlocking ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Unlocking...
        </>
      ) : (
        <>
          <Lock className="w-4 h-4 mr-2" />
          <Coins className="w-4 h-4 mr-1" />
          {cost} Coins
        </>
      )}
    </Button>
  );
};

export default CourseUnlockButton;
