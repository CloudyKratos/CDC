
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Shield, Crown, Flame, Trophy, ChevronDown, ChevronUp } from "lucide-react";

interface WarriorStatsPanelProps {
  stats: {
    level: number;
    xp: number;
    nextLevelXp: number;
    streak: number;
    completedQuests: number;
    rank: string;
    weeklyProgress: number;
  };
  isCollapsed: boolean;
  onToggle: () => void;
}

const WarriorStatsPanel = ({ stats, isCollapsed, onToggle }: WarriorStatsPanelProps) => {
  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-purple-400" />
            Warrior Stats
          </CardTitle>
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="h-6 w-6 text-purple-300 hover:text-white"
          >
            {isCollapsed ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>
      {!isCollapsed && (
        <CardContent className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-purple-300">Rank</span>
            <Badge className="bg-gradient-to-r from-purple-600 to-pink-600">
              <Crown className="h-3 w-3 mr-1" />
              {stats.rank}
            </Badge>
          </div>
          
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-300">XP Progress</span>
              <span>{stats.xp}/{stats.nextLevelXp}</span>
            </div>
            <Progress value={(stats.xp / stats.nextLevelXp) * 100} className="h-2" />
            <div className="text-xs text-purple-400 mt-1">
              {stats.nextLevelXp - stats.xp} XP to next level
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="text-center p-3 bg-orange-500/10 rounded-lg border border-orange-500/20">
              <div className="text-2xl font-bold text-orange-400 flex items-center justify-center gap-1">
                <Flame className="h-5 w-5" />
                {stats.streak}
              </div>
              <div className="text-xs text-orange-300">Day Streak</div>
            </div>
            <div className="text-center p-3 bg-green-500/10 rounded-lg border border-green-500/20">
              <div className="text-2xl font-bold text-green-400 flex items-center justify-center gap-1">
                <Trophy className="h-5 w-5" />
                {stats.completedQuests}
              </div>
              <div className="text-xs text-green-300">Total Quests</div>
            </div>
          </div>

          <div className="pt-2 border-t border-purple-800/30">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-purple-300">Weekly Progress</span>
              <span>{stats.weeklyProgress}%</span>
            </div>
            <Progress value={stats.weeklyProgress} className="h-2" />
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default WarriorStatsPanel;
