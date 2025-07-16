
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Circle, Trophy } from 'lucide-react';

interface ProfileCompletionIndicatorProps {
  percentage: number;
  loading?: boolean;
}

export const ProfileCompletionIndicator: React.FC<ProfileCompletionIndicatorProps> = ({
  percentage,
  loading = false
}) => {
  const getCompletionMessage = () => {
    if (percentage === 100) {
      return { text: "Profile Complete! You're all set!", icon: Trophy, color: "text-green-600" };
    } else if (percentage >= 80) {
      return { text: "Almost there! Just a few more details.", icon: CheckCircle, color: "text-blue-600" };
    } else if (percentage >= 60) {
      return { text: "Good progress! Keep going.", icon: CheckCircle, color: "text-blue-500" };
    } else if (percentage >= 40) {
      return { text: "Getting started! Add more details.", icon: Circle, color: "text-orange-500" };
    } else {
      return { text: "Let's build your profile!", icon: Circle, color: "text-gray-500" };
    }
  };

  const { text, icon: Icon, color } = getCompletionMessage();

  if (loading) {
    return (
      <Card className="border-border/50 shadow-sm">
        <CardContent className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded mb-2"></div>
            <div className="h-2 bg-muted rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/50 shadow-sm">
      <CardContent className="p-4">
        <div className="flex items-center gap-3 mb-3">
          <Icon className={`h-5 w-5 ${color}`} />
          <div>
            <h3 className="font-semibold text-foreground">Profile Completion</h3>
            <p className={`text-sm ${color}`}>{text}</p>
          </div>
          <div className="ml-auto text-2xl font-bold text-foreground">
            {percentage}%
          </div>
        </div>
        <Progress value={percentage} className="h-2" />
      </CardContent>
    </Card>
  );
};
