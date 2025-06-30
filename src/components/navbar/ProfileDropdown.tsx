
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
  Star, 
  Trophy, 
  Target, 
  Settings, 
  LogOut, 
  User,
  Flame,
  Coins,
  TrendingUp
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";
import { toast } from "sonner";

interface ProfileDropdownProps {
  className?: string;
}

const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ className = "" }) => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const { progress, isLoading } = useWarriorProgress();
  const navigate = useNavigate();

  const isAdmin = currentRole === 'admin';

  const handleLogout = async () => {
    await logout();
    toast.success("You've been successfully logged out");
    navigate("/login");
  };

  if (!user) return null;

  const nextLevelXp = progress ? (progress.level + 1) * 1000 : 1000;
  const currentLevelXp = progress ? progress.level * 1000 : 0;
  const progressPercent = progress ? 
    ((progress.totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp)) * 100 : 0;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={`rounded-full overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all ${className}`}>
          <Avatar>
            <AvatarImage 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} 
              alt="Avatar" 
            />
            <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-semibold">
              {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-80 p-0 glass-morphism animate-scale-in">
        {/* Profile Header */}
        <Card className="border-0 shadow-none">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-3">
              <Avatar className="h-16 w-16 border-2 border-primary/20">
                <AvatarImage 
                  src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} 
                  alt="Avatar" 
                />
                <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white font-bold text-lg">
                  {(user?.name || user?.email || "U").charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-semibold text-lg truncate">
                    {user.name || 'Warrior'}
                  </h3>
                  {isAdmin && (
                    <Badge className="bg-red-500 text-white text-xs">
                      <Shield className="h-2 w-2 mr-1" />
                      Admin
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {user.email}
                </p>
                {progress && (
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      Level {progress.level}
                    </Badge>
                    <div className="flex items-center gap-1 text-xs text-orange-500">
                      <Flame className="h-3 w-3" />
                      {progress.streak}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            {/* Warrior Progress */}
            {progress && !isLoading && (
              <>
                {/* XP Progress Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">XP Progress</span>
                    <span className="font-medium text-primary">
                      {progress.totalXp} / {nextLevelXp}
                    </span>
                  </div>
                  <Progress value={progressPercent} className="h-2" />
                  <p className="text-xs text-muted-foreground">
                    {nextLevelXp - progress.totalXp} XP to next level
                  </p>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-3 gap-2">
                  <div className="text-center p-2 bg-primary/5 rounded-lg">
                    <Trophy className="h-4 w-4 text-primary mx-auto mb-1" />
                    <div className="text-sm font-bold text-primary">{progress.level}</div>
                    <div className="text-xs text-muted-foreground">Level</div>
                  </div>
                  
                  <div className="text-center p-2 bg-orange-500/5 rounded-lg">
                    <Flame className="h-4 w-4 text-orange-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-orange-500">{progress.streak}</div>
                    <div className="text-xs text-muted-foreground">Streak</div>
                  </div>
                  
                  <div className="text-center p-2 bg-green-500/5 rounded-lg">
                    <Target className="h-4 w-4 text-green-500 mx-auto mb-1" />
                    <div className="text-sm font-bold text-green-500">{progress.completedQuests}</div>
                    <div className="text-xs text-muted-foreground">Quests</div>
                  </div>
                </div>

                {/* Recent Achievement */}
                <div className="flex items-center gap-2 p-2 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/10 dark:to-orange-900/10 rounded-lg border border-yellow-200/50 dark:border-yellow-800/30">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <div className="flex-1">
                    <p className="text-xs font-medium">Latest Achievement</p>
                    <p className="text-xs text-muted-foreground">Consistency Master</p>
                  </div>
                  <Badge variant="secondary" className="text-xs">+50 XP</Badge>
                </div>
              </>
            )}

            {/* Quick Actions */}
            <div className="flex gap-2">
              <Link to="/warrior-space" className="flex-1">
                <Button variant="outline" size="sm" className="w-full gap-2 text-xs">
                  <TrendingUp className="h-3 w-3" />
                  View Progress
                </Button>
              </Link>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Settings className="h-3 w-3" />
                Settings
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <DropdownMenuSeparator />
        
        {/* Menu Items */}
        <div className="p-1">
          <Link to="/dashboard">
            <DropdownMenuItem className="cursor-pointer rounded-md py-2">
              <User className="h-4 w-4 mr-2" />
              <span>Dashboard</span>
            </DropdownMenuItem>
          </Link>

          {isAdmin && (
            <Link to="/admin">
              <DropdownMenuItem className="cursor-pointer rounded-md py-2 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/10">
                <Shield className="h-4 w-4 mr-2" />
                <span>Admin Panel</span>
              </DropdownMenuItem>
            </Link>
          )}
          
          <DropdownMenuItem onClick={handleLogout} className="cursor-pointer rounded-md py-2 text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-900/10">
            <LogOut className="h-4 w-4 mr-2" />
            <span>Sign out</span>
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ProfileDropdown;
