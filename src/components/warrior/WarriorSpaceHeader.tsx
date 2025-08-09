
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sword } from "lucide-react";

interface WarriorSpaceHeaderProps {
  progress: {
    streak: number;
    level: number;
    totalCoins: number;
    completedQuests: number;
    currentXp: number;
    nextLevelXp: number;
    rank: string;
    dailyQuestProgress: number;
  };
}

const WarriorSpaceHeader = ({ progress }: WarriorSpaceHeaderProps) => {
  return (
    <div className="relative z-20">
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm mobile-safe-area-top">
        <div className="container mx-auto px-4 py-3 min-h-[64px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 min-w-0">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white touch-target-optimal">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-xl sm:text-2xl font-bold text-white truncate">Warrior's Space</h1>
                  <p className="text-purple-200 text-xs sm:text-sm truncate">Transform your potential into power</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorSpaceHeader;
