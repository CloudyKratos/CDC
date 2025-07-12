
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
      <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link to="/dashboard">
                <Button variant="ghost" size="icon" className="text-purple-300 hover:text-white">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center">
                  <Sword className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">Warrior's Space</h1>
                  <p className="text-purple-200 text-sm">Transform your potential into power</p>
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
