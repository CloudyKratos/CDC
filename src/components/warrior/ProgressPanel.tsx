
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Clock, CheckCircle2, Coins, TrendingUp } from "lucide-react";

interface ProgressPanelProps {
  stats: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    totalCoins: number;
    weeklyProgress: number;
  };
}

const ProgressPanel = ({ stats }: ProgressPanelProps) => {
  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-purple-400" />
          Your Journey
        </CardTitle>
        <CardDescription className="text-purple-300">
          Track your progress and see how far you've come
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center py-8">
          <div className="text-6xl font-bold text-purple-400 mb-2">{stats.level}</div>
          <div className="text-purple-300 mb-4">Current Level</div>
          <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="w-full max-w-md mx-auto" />
          <div className="text-sm text-purple-300 mt-2">
            {stats.nextLevelXp - stats.xp} XP to next level
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-purple-900/20 rounded-lg border border-purple-700/30">
            <Clock className="h-6 w-6 text-purple-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-400">{stats.streak}</div>
            <div className="text-xs text-purple-300">Current Streak</div>
          </div>
          <div className="text-center p-4 bg-green-900/20 rounded-lg border border-green-700/30">
            <CheckCircle2 className="h-6 w-6 text-green-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-400">{stats.completedQuests}</div>
            <div className="text-xs text-green-300">Total Quests</div>
          </div>
          <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
            <Coins className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-yellow-400">{stats.totalCoins}</div>
            <div className="text-xs text-yellow-300">Total Coins</div>
          </div>
          <div className="text-center p-4 bg-blue-900/20 rounded-lg border border-blue-700/30">
            <TrendingUp className="h-6 w-6 text-blue-400 mx-auto mb-2" />
            <div className="text-2xl font-bold text-blue-400">{stats.weeklyProgress}%</div>
            <div className="text-xs text-blue-300">Weekly Progress</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressPanel;
