
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";

interface Achievement {
  title: string;
  description: string;
  icon: React.ElementType;
  earned: boolean;
  rarity: string;
}

interface AchievementsPanelProps {
  achievements: Achievement[];
}

const AchievementsPanel = ({ achievements }: AchievementsPanelProps) => {
  return (
    <Card className="bg-black/40 border-purple-800/30 text-white backdrop-blur-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="h-5 w-5 text-yellow-400" />
          Achievements
        </CardTitle>
        <CardDescription className="text-purple-300">
          Unlock badges and earn recognition for your accomplishments
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={index}
              className={`p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] ${
                achievement.earned
                  ? "bg-yellow-900/20 border-yellow-700/30"
                  : "bg-gray-900/20 border-gray-700/30"
              }`}
            >
              <div className="flex items-center gap-3">
                <achievement.icon
                  className={`h-8 w-8 transition-all duration-200 ${
                    achievement.earned ? "text-yellow-400" : "text-gray-500"
                  }`}
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className={`font-semibold ${achievement.earned ? "text-yellow-400" : "text-gray-400"}`}>
                      {achievement.title}
                    </h4>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${
                        achievement.rarity === 'common' ? 'border-gray-500 text-gray-400' :
                        achievement.rarity === 'rare' ? 'border-blue-500 text-blue-400' :
                        achievement.rarity === 'epic' ? 'border-purple-500 text-purple-400' :
                        'border-yellow-500 text-yellow-400'
                      }`}
                    >
                      {achievement.rarity}
                    </Badge>
                  </div>
                  <p className="text-sm text-purple-300">{achievement.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default AchievementsPanel;
