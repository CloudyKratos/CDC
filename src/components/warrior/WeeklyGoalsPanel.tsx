
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Star, Coins } from "lucide-react";

interface WeeklyGoal {
  id: number;
  title: string;
  progress: number;
  target: number;
  xp: number;
  coins: number;
}

interface WeeklyGoalsPanelProps {
  goals: WeeklyGoal[];
}

const WeeklyGoalsPanel = ({ goals }: WeeklyGoalsPanelProps) => {
  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-blue-400" />
          Weekly Goals
        </CardTitle>
        <CardDescription className="text-purple-300">
          Long-term objectives to build lasting habits and earn bigger rewards
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => (
          <div
            key={goal.id}
            className="p-4 rounded-lg border bg-blue-900/20 border-blue-700/30 transition-all duration-200 hover:scale-[1.02]"
          >
            <div className="flex justify-between items-start mb-3">
              <h4 className="font-semibold">{goal.title}</h4>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="border-blue-500 text-blue-400">
                  {goal.progress}/{goal.target}
                </Badge>
              </div>
            </div>
            <Progress value={(goal.progress / goal.target) * 100} className="h-2 mb-3" />
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-blue-400">
                  <Star className="h-3 w-3" />
                  <span>+{goal.xp} XP</span>
                </div>
                <div className="flex items-center gap-1 text-yellow-400">
                  <Coins className="h-3 w-3" />
                  <span>+{goal.coins} coins</span>
                </div>
              </div>
              <div className="text-sm text-purple-300">
                {Math.round((goal.progress / goal.target) * 100)}% complete
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default WeeklyGoalsPanel;
