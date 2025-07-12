import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Sword, Flame, Coins, Star } from "lucide-react";
import { useAuth } from "@/contexts/auth/AuthContext";

interface WarriorHeaderProps {
  stats: {
    streak: number;
    level: number;
    totalCoins: number;
  };
  progressPercentage: number;
  completedQuestsToday: number;
  totalQuestsToday: number;
}

const WarriorHeader = ({ 
  stats, 
  progressPercentage, 
  completedQuestsToday, 
  totalQuestsToday 
}: WarriorHeaderProps) => {
  const { user } = useAuth();

  return (
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
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 text-purple-300">
                    <Flame className="h-4 w-4" />
                    {stats.streak} day streak
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-2 bg-purple-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-500"
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                    <span className="text-purple-300">{completedQuestsToday}/{totalQuestsToday} today</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
              <Coins className="h-4 w-4 text-yellow-400" />
              <span className="text-yellow-400 font-semibold">{stats.totalCoins}</span>
            </div>
            <Badge className="bg-purple-600 text-white">
              <Star className="h-3 w-3 mr-1" />
              Level {stats.level}
            </Badge>
            <Avatar>
              <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior"} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "W"}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarriorHeader;
