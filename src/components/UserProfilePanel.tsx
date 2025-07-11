import React from "react";
import { useAuth } from "@/contexts/auth/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Shield, 
  Star, 
  Trophy, 
  Target, 
  Calendar,
  MapPin,
  Mail,
  User,
  Settings,
  ChevronRight
} from "lucide-react";
import { useWarriorProgress } from "@/hooks/useWarriorProgress";

interface ProfilePanelProps {
  onViewFullProfile?: () => void;
}

const ProfilePanel: React.FC<ProfilePanelProps> = ({ onViewFullProfile }) => {
  const { user } = useAuth();
  const { progress, isLoading } = useWarriorProgress();

  if (!user) {
    return (
      <Card className="w-full">
        <CardContent className="p-6 text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Please sign in to view your profile</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full shadow-lg border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            <AvatarImage 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} 
              alt={user.name || 'User'} 
            />
            <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
              {(user.name || 'U').charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg truncate">
                {user.name || 'Anonymous User'}
              </CardTitle>
              {user.role === "admin" && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                  <Shield className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Mail className="h-3 w-3" />
              <span className="truncate">{user.email}</span>
            </div>
            
            {user.role && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <User className="h-3 w-3" />
                <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Warrior Progress */}
        {progress && !isLoading && (
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center p-3 bg-primary/5 rounded-lg border border-primary/10">
              <div className="flex items-center justify-center mb-1">
                <Trophy className="h-4 w-4 text-primary" />
              </div>
              <div className="text-lg font-bold text-primary">{progress.level}</div>
              <div className="text-xs text-muted-foreground">Level</div>
            </div>
            
            <div className="text-center p-3 bg-orange-500/5 rounded-lg border border-orange-500/10">
              <div className="flex items-center justify-center mb-1">
                <Star className="h-4 w-4 text-orange-500" />
              </div>
              <div className="text-lg font-bold text-orange-500">{progress.streak}</div>
              <div className="text-xs text-muted-foreground">Streak</div>
            </div>
            
            <div className="text-center p-3 bg-green-500/5 rounded-lg border border-green-500/10">
              <div className="flex items-center justify-center mb-1">
                <Target className="h-4 w-4 text-green-500" />
              </div>
              <div className="text-lg font-bold text-green-500">{progress.completedQuests}</div>
              <div className="text-xs text-muted-foreground">Quests</div>
            </div>
          </div>
        )}
        
        {/* Quick Stats */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Member since</span>
            <span className="font-medium">
              {new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                year: 'numeric' 
              })}
            </span>
          </div>
          
          {progress && (
            <>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Total XP</span>
                <span className="font-medium text-primary">{progress.totalXp}</span>
              </div>
              
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Current Rank</span>
                <Badge variant="outline" className="text-xs">
                  {progress.rank}
                </Badge>
              </div>
            </>
          )}
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewFullProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewFullProfile}
              className="flex-1 gap-2"
            >
              <User className="h-4 w-4" />
              View Profile
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePanel;
