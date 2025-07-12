
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Coins, Trophy, Target, Heart } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { toast } from 'sonner';

interface WarriorSpaceRewardsProps {
  hasCompletedMorningUpload?: boolean;
  hasCompletedTasks?: boolean;
  hasCompletedGratitude?: boolean;
}

const WarriorSpaceRewards: React.FC<WarriorSpaceRewardsProps> = ({
  hasCompletedMorningUpload = false,
  hasCompletedTasks = false,
  hasCompletedGratitude = false
}) => {
  const { awardDailyCompletion } = useCoins();

  const allActivitiesComplete = hasCompletedMorningUpload && hasCompletedTasks && hasCompletedGratitude;

  const activities = [
    {
      name: 'Morning Upload',
      completed: hasCompletedMorningUpload,
      icon: <Trophy className="w-4 h-4" />
    },
    {
      name: 'Daily Tasks',
      completed: hasCompletedTasks,
      icon: <Target className="w-4 h-4" />
    },
    {
      name: 'Gratitude List',
      completed: hasCompletedGratitude,
      icon: <Heart className="w-4 h-4" />
    }
  ];

  const handleClaimReward = async () => {
    if (!allActivitiesComplete) {
      toast.error('Complete all activities first!', {
        description: 'Finish all 3 Warrior Space activities to earn your daily reward.'
      });
      return;
    }

    const awarded = await awardDailyCompletion('warrior_space_daily');
    if (!awarded) {
      toast.info('Daily reward already claimed!', {
        description: 'You can earn coins again tomorrow by completing all activities.'
      });
    }
  };

  return (
    <Card className="border-2 border-yellow-200 dark:border-yellow-800 bg-gradient-to-br from-yellow-50/50 to-orange-50/50 dark:from-yellow-950/20 dark:to-orange-950/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-yellow-600" />
          Daily Coin Rewards
        </CardTitle>
        <CardDescription>
          Complete all 3 activities to earn 20 coins daily
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Activity Checklist */}
        <div className="space-y-2">
          {activities.map((activity, index) => (
            <div key={index} className="flex items-center gap-3 p-2 rounded-lg bg-white/50 dark:bg-black/20">
              <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                activity.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : 'border-gray-300 dark:border-gray-600'
              }`}>
                {activity.completed && '✓'}
              </div>
              <div className="flex items-center gap-2">
                {activity.icon}
                <span className={`text-sm ${activity.completed ? 'text-green-700 dark:text-green-300' : 'text-muted-foreground'}`}>
                  {activity.name}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Claim Button */}
        <Button
          onClick={handleClaimReward}
          disabled={!allActivitiesComplete}
          className="w-full"
          variant={allActivitiesComplete ? "default" : "outline"}
        >
          <Coins className="w-4 h-4 mr-2" />
          {allActivitiesComplete ? 'Claim 20 Coins' : 'Complete All Activities'}
        </Button>

        {!allActivitiesComplete && (
          <p className="text-xs text-center text-muted-foreground">
            Complete all activities above to unlock your daily coin reward
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default WarriorSpaceRewards;
