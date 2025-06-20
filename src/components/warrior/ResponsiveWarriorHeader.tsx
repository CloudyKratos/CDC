
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Sword, Flame, Coins, Star, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface ResponsiveWarriorHeaderProps {
  stats: {
    streak: number;
    level: number;
    totalCoins: number;
  };
  progressPercentage: number;
  completedQuestsToday: number;
  totalQuestsToday: number;
}

const ResponsiveWarriorHeader = ({ 
  stats, 
  progressPercentage, 
  completedQuestsToday, 
  totalQuestsToday 
}: ResponsiveWarriorHeaderProps) => {
  const { user } = useAuth();

  return (
    <div className="border-b border-purple-800/30 bg-black/20 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-4">
        {/* Main Header Row */}
        <div className="flex items-center justify-between mb-4">
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
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold text-white">Warrior's Space</h1>
              </div>
              <div className="sm:hidden">
                <h1 className="text-xl font-bold text-white">Warrior's Space</h1>
              </div>
            </div>
          </div>
          
          {/* User Info */}
          <div className="flex items-center gap-3">
            {/* Mobile: Simplified Stats */}
            <div className="flex items-center gap-2 sm:hidden">
              <Badge className="bg-purple-600 text-white text-xs">
                <Star className="h-3 w-3 mr-1" />
                L{stats.level}
              </Badge>
              <div className="flex items-center gap-1 bg-yellow-500/20 px-2 py-1 rounded-full border border-yellow-500/30">
                <Coins className="h-3 w-3 text-yellow-400" />
                <span className="text-yellow-400 font-semibold text-xs">{stats.totalCoins}</span>
              </div>
            </div>

            {/* Desktop: Full Stats */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="flex items-center gap-2 bg-yellow-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
                <Coins className="h-4 w-4 text-yellow-400" />
                <span className="text-yellow-400 font-semibold">{stats.totalCoins}</span>
              </div>
              <Badge className="bg-purple-600 text-white">
                <Star className="h-3 w-3 mr-1" />
                Level {stats.level}
              </Badge>
            </div>

            <Avatar className="h-8 w-8 sm:h-10 sm:w-10">
              <AvatarImage src={user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=warrior"} />
              <AvatarFallback>{user?.name?.slice(0, 2).toUpperCase() || "W"}</AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Progress Section */}
        <div className="space-y-3">
          {/* Progress Stats Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            {/* Streak & Progress */}
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-purple-300">
                <Flame className="h-4 w-4" />
                <span className="text-sm font-medium">{stats.streak} day streak</span>
              </div>
              <div className="flex items-center gap-2 text-green-400">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm font-medium">{completedQuestsToday}/{totalQuestsToday} today</span>
              </div>
            </div>

            {/* Progress Percentage */}
            <div className="text-right">
              <span className="text-sm text-purple-300">
                Daily Progress: {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full">
            <Progress 
              value={progressPercentage} 
              className="h-3 bg-purple-900/30"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResponsiveWarriorHeader;
