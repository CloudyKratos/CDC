
import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Lock, Star, Coins, Clock, Zap, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface EnhancedQuestCardProps {
  quest: Quest;
  onComplete: (questId: number) => void;
}

const EnhancedQuestCard = ({ quest, onComplete }: EnhancedQuestCardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleComplete = () => {
    if (quest.locked) return;
    
    setIsAnimating(true);
    setTimeout(() => {
      onComplete(quest.id);
      setIsAnimating(false);
    }, 200);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'border-green-500 text-green-400 bg-green-500/10';
      case 'medium': return 'border-yellow-500 text-yellow-400 bg-yellow-500/10';
      case 'hard': return 'border-red-500 text-red-400 bg-red-500/10';
      default: return 'border-gray-500 text-gray-400 bg-gray-500/10';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'wellness': return <Target className="h-4 w-4" />;
      case 'productivity': return <Zap className="h-4 w-4" />;
      case 'learning': return <Trophy className="h-4 w-4" />;
      case 'social': return <Star className="h-4 w-4" />;
      default: return <Target className="h-4 w-4" />;
    }
  };

  return (
    <div
      className={cn(
        "group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden",
        quest.completed
          ? "bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-700/40 shadow-lg shadow-green-900/20"
          : quest.locked
          ? "bg-gray-900/30 border-gray-700/30 opacity-60"
          : "bg-gradient-to-br from-purple-900/30 to-blue-900/20 border-purple-700/40 hover:border-purple-600/60 hover:shadow-xl hover:shadow-purple-900/20",
        isHovered && !quest.locked && !quest.completed && "scale-[1.02] -translate-y-1",
        isAnimating && "scale-95"
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleComplete}
    >
      {/* Animated background gradient */}
      <div className={cn(
        "absolute inset-0 opacity-0 transition-opacity duration-300",
        isHovered && !quest.locked && !quest.completed && "opacity-100"
      )}>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-purple-600/10 animate-pulse" />
      </div>

      <div className="relative flex items-start justify-between">
        <div className="flex items-start gap-4 flex-1">
          {/* Enhanced completion indicator */}
          <div className="relative">
            <div
              className={cn(
                "w-8 h-8 rounded-full border-2 transition-all duration-300 flex items-center justify-center",
                quest.completed
                  ? "bg-green-500 border-green-500 shadow-lg shadow-green-500/30 scale-110"
                  : quest.locked
                  ? "border-gray-500 bg-gray-800"
                  : "border-purple-400 bg-purple-900/30 group-hover:border-purple-300 group-hover:bg-purple-800/30"
              )}
            >
              {quest.completed && <CheckCircle2 className="h-5 w-5 text-white" />}
              {quest.locked && <Lock className="h-4 w-4 text-gray-400" />}
              {!quest.completed && !quest.locked && (
                <div className={cn(
                  "w-3 h-3 rounded-full bg-purple-400 transition-all duration-300",
                  isHovered && "scale-125 bg-purple-300"
                )} />
              )}
            </div>
            
            {/* Completion celebration effect */}
            {quest.completed && (
              <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-20" />
            )}
          </div>

          <div className="flex-1 space-y-3">
            {/* Title and badges */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <h4 className={cn(
                  "font-semibold text-lg transition-all duration-200",
                  quest.completed ? "line-through text-green-300" : "text-white group-hover:text-purple-200"
                )}>
                  {quest.title}
                </h4>
                <div className="flex items-center gap-1">
                  {getCategoryIcon(quest.category)}
                </div>
              </div>
              
              <div className="flex items-center gap-2 flex-wrap">
                <Badge className={cn("text-xs font-medium", getDifficultyColor(quest.difficulty))}>
                  {quest.difficulty}
                </Badge>
                {quest.category && (
                  <Badge variant="outline" className="text-xs border-blue-500/50 text-blue-400 bg-blue-500/10">
                    {quest.category}
                  </Badge>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-purple-300 leading-relaxed">{quest.description}</p>

            {/* Rewards and time */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200",
                  "bg-blue-500/20 border border-blue-500/30 text-blue-400",
                  isHovered && "bg-blue-500/30 border-blue-500/50"
                )}>
                  <Star className="h-3 w-3" />
                  <span className="text-xs font-medium">+{quest.xp} XP</span>
                </div>
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-full transition-all duration-200",
                  "bg-yellow-500/20 border border-yellow-500/30 text-yellow-400",
                  isHovered && "bg-yellow-500/30 border-yellow-500/50"
                )}>
                  <Coins className="h-3 w-3" />
                  <span className="text-xs font-medium">+{quest.coins}</span>
                </div>
                {quest.estimatedTime && (
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30 text-purple-400">
                    <Clock className="h-3 w-3" />
                    <span className="text-xs font-medium">{quest.estimatedTime}</span>
                  </div>
                )}
              </div>

              {/* Action button for non-completed quests */}
              {!quest.completed && !quest.locked && (
                <Button
                  size="sm"
                  className={cn(
                    "transition-all duration-200 bg-purple-600 hover:bg-purple-500 text-white",
                    isHovered && "scale-105 shadow-lg shadow-purple-600/30"
                  )}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleComplete();
                  }}
                >
                  Complete
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Completion overlay */}
      {quest.completed && (
        <div className="absolute top-2 right-2">
          <div className="bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
            ✓ Done
          </div>
        </div>
      )}
    </div>
  );
};

export default EnhancedQuestCard;
