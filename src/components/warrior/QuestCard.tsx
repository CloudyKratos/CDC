
import React from "react";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Lock, Star, Coins, Clock } from "lucide-react";

interface Quest {
  id: number;
  title: string;
  description: string;
  xp: number;
  coins: number;
  completed: boolean;
  difficulty: string;
  category: string;
  estimatedTime: string;
  locked?: boolean;
}

interface QuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
}

const QuestCard = ({ quest, onComplete }: QuestCardProps) => {
  return (
    <div
      className={`group relative p-4 rounded-lg border transition-all duration-200 hover:scale-[1.02] cursor-pointer ${
        quest.completed
          ? "bg-green-900/20 border-green-700/30"
          : quest.locked
          ? "bg-gray-900/20 border-gray-700/30 opacity-50"
          : "bg-purple-900/20 border-purple-700/30 hover:border-purple-600/50"
      }`}
      onClick={() => !quest.locked && onComplete(quest.id)}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3 flex-1">
          <div
            className={`w-6 h-6 rounded-full border-2 transition-all duration-200 flex items-center justify-center ${
              quest.completed
                ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30"
                : quest.locked
                ? "border-gray-500"
                : "border-purple-400 group-hover:border-purple-300"
            }`}
          >
            {quest.completed && <CheckCircle2 className="h-4 w-4 text-white" />}
            {quest.locked && <Lock className="h-4 w-4 text-gray-400" />}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className={`font-semibold ${quest.completed ? "line-through text-green-300" : ""}`}>
                {quest.title}
              </h4>
              <Badge 
                variant="outline" 
                className={`text-xs ${
                  quest.difficulty === 'easy' ? 'border-green-500 text-green-400' :
                  quest.difficulty === 'medium' ? 'border-yellow-500 text-yellow-400' :
                  'border-red-500 text-red-400'
                }`}
              >
                {quest.difficulty}
              </Badge>
              {quest.category && (
                <Badge variant="outline" className="text-xs border-blue-500 text-blue-400">
                  {quest.category}
                </Badge>
              )}
            </div>
            <p className="text-sm text-purple-300 mb-2">{quest.description}</p>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-blue-400">
                <Star className="h-3 w-3" />
                <span className="text-xs">+{quest.xp} XP</span>
              </div>
              <div className="flex items-center gap-1 text-yellow-400">
                <Coins className="h-3 w-3" />
                <span className="text-xs">+{quest.coins} coins</span>
              </div>
              {quest.estimatedTime && (
                <div className="flex items-center gap-1 text-purple-400">
                  <Clock className="h-3 w-3" />
                  <span className="text-xs">{quest.estimatedTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestCard;
