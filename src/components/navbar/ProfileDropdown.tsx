
import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Shield,
  User,
  Settings,
  LogOut,
  Trophy,
  Star,
  Target,
  Coins,
  TrendingUp,
  Calendar,
  ChevronRight,
  Crown,
  Zap
} from "lucide-react";
import { toast } from "sonner";

interface ProfileDropdownProps {
  onLogout: () => void;
}

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ onLogout }) => {
  const { user } = useAuth();
  const { currentRole } = useRole();
  const { progress, isLoading } = useWarriorProgress();
  const isAdmin = currentRole === 'admin';

  if (!user) return null;

  const progressPercentage = progress ? (progress.currentXp / progress.nextLevelXp) * 100 : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
          <Avatar className="h-10 w-10">
            <AvatarImage 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
              alt={user?.name || 'User'} 
            />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold">
              {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          {progress && progress.streak > 0 && (
            <div className="absolute -top-1 -right-1 h-5 w-5 bg-orange-500 text-white rounded-full flex items-center justify-center text-xs font-bold animate-pulse">
              {progress.streak}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0 glass-morphism animate-scale-in">
        {/* Profile Header - Now clickable */}
        <Link to="/profile-settings">
          <div className="p-4 border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors cursor-pointer rounded-t-lg">
            <div className="flex items-center gap-3 mb-3">
              <Avatar className="h-12 w-12 border-2 border-primary/20">
                <AvatarImage 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name || 'User'}`} 
                  alt={user?.name || 'User'} 
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">
                    {user?.name || user?.email?.split('@')[0] || 'Anonymous User'}
                  </h3>
                  {isAdmin && (
                    <Badge className="bg-red-500 text-white text-xs">
                      <Shield className="h-2 w-2 mr-1" />
                      Admin
                    </Badge>
                  )}
                  {progress && progress.rank && (
                    <Badge variant="outline" className="text-xs">
                      <Crown className="h-2 w-2 mr-1" />
                      {progress.rank}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {user?.email}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                  Click to edit profile →
                </p>
              </div>
            </div>

            {/* Warrior Progress */}
            {progress && !isLoading && (
              <div className="space-y-3">
                {/* Level Progress */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-primary font-medium">
                      <Trophy className="h-3 w-3" />
                      Level {progress.level}
                    </span>
                    <span className="text-xs text-gray-500">
                      {progress.currentXp}/{progress.nextLevelXp} XP
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Star className="h-3 w-3 text-orange-500" />
                    </div>
                    <div className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {progress.streak}
                    </div>
                    <div className="text-xs text-gray-500">Streak</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Target className="h-3 w-3 text-green-500" />
                    </div>
                    <div className="text-sm font-bold text-green-600 dark:text-green-400">
                      {progress.completedQuests}
                    </div>
                    <div className="text-xs text-gray-500">Quests</div>
                  </div>
                  
                  <div className="text-center p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <div className="flex items-center justify-center mb-1">
                      <Coins className="h-3 w-3 text-yellow-500" />
                    </div>
                    <div className="text-sm font-bold text-yellow-600 dark:text-yellow-400">
                      {progress.totalCoins}
                    </div>
                    <div className="text-xs text-gray-500">Coins</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Link>

        {/* Quick Actions */}
        <div className="p-2">
          <Link to="/warrior-space">
            <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 group">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-r from-orange-100 to-red-100 dark:from-orange-900/20 dark:to-red-900/20 rounded-lg group-hover:scale-110 transition-transform">
                  <Zap className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Warrior's Space</span>
                  <p className="text-xs text-gray-500">View quests & progress</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuItem>
          </Link>

          <Link to="/dashboard">
            <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 group">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gradient-to-r from-blue-100 to-purple-100 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Dashboard</span>
                  <p className="text-xs text-gray-500">Main workspace</p>
                </div>
                <ChevronRight className="h-4 w-4 text-gray-400" />
              </div>
            </DropdownMenuItem>
          </Link>

          {isAdmin && (
            <Link to="/admin">
              <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 group text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10">
                <div className="flex items-center gap-3 w-full">
                  <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:scale-110 transition-transform">
                    <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
                  </div>
                  <div className="flex-1">
                    <span className="font-medium">Admin Panel</span>
                    <p className="text-xs text-red-400">System management</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-red-400" />
                </div>
              </DropdownMenuItem>
            </Link>
          )}

          <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

          <Link to="/profile-settings">
            <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 group">
              <div className="flex items-center gap-3 w-full">
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:scale-110 transition-transform">
                  <User className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <span className="font-medium">Edit Profile</span>
                  <p className="text-xs text-gray-500">Update your info</p>
                </div>
              </div>
            </DropdownMenuItem>
          </Link>

          <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 group">
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg group-hover:scale-110 transition-transform">
                <Settings className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Settings</span>
                <p className="text-xs text-gray-500">Preferences & privacy</p>
              </div>
            </div>
          </DropdownMenuItem>

          <DropdownMenuSeparator className="my-1 bg-gray-100 dark:bg-gray-800" />

          <DropdownMenuItem 
            onClick={onLogout} 
            className="cursor-pointer rounded-md py-2 my-1 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/10 group"
          >
            <div className="flex items-center gap-3 w-full">
              <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg group-hover:scale-110 transition-transform">
                <LogOut className="h-4 w-4 text-red-500" />
              </div>
              <div className="flex-1">
                <span className="font-medium">Sign Out</span>
                <p className="text-xs text-red-400">Leave your session</p>
              </div>
            </div>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
