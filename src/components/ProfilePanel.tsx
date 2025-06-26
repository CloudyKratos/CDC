
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
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
  ChevronRight,
  BookOpen,
  Award,
  Zap
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
          <div className="relative">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage 
                src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.name || 'User'}`} 
                alt={user.name || 'User'} 
              />
              <AvatarFallback className="text-lg font-bold bg-primary text-primary-foreground">
                {(user.name || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            {progress && progress.level >= 5 && (
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                <Award className="h-3 w-3 text-white" />
              </div>
            )}
          </div>
          
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
              {progress && progress.level >= 10 && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                  <Zap className="h-3 w-3 mr-1" />
                  Elite
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
      
      <CardContent className="space-y-6">
        {/* Enhanced Progress Stats */}
        {progress && !isLoading && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="text-center p-3 bg-gradient-to-br from-primary/5 to-primary/10 rounded-lg border border-primary/10">
                <div className="flex items-center justify-center mb-1">
                  <Trophy className="h-4 w-4 text-primary" />
                </div>
                <div className="text-lg font-bold text-primary">{progress.level}</div>
                <div className="text-xs text-muted-foreground">Level</div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-orange-500/5 to-orange-500/10 rounded-lg border border-orange-500/10">
                <div className="flex items-center justify-center mb-1">
                  <Star className="h-4 w-4 text-orange-500" />
                </div>
                <div className="text-lg font-bold text-orange-500">{progress.streak}</div>
                <div className="text-xs text-muted-foreground">Streak</div>
              </div>
              
              <div className="text-center p-3 bg-gradient-to-br from-green-500/5 to-green-500/10 rounded-lg border border-green-500/10">
                <div className="flex items-center justify-center mb-1">
                  <Target className="h-4 w-4 text-green-500" />
                </div>
                <div className="text-lg font-bold text-green-500">{progress.completedQuests}</div>
                <div className="text-xs text-muted-foreground">Quests</div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">Level Progress</span>
                <span className="text-primary font-medium">{progress.totalXp} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-primary to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${Math.min((progress.totalXp % 1000) / 10, 100)}%` }}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Learning Stats */}
        <div className="space-y-3 pt-2 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-muted-foreground">Courses Completed</span>
            </div>
            <span className="font-medium text-blue-600">8/15</span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-green-500" />
              <span className="text-muted-foreground">Learning Streak</span>
            </div>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
              {progress?.streak || 0} days
            </Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-purple-500" />
              <span className="text-muted-foreground">Current Rank</span>
            </div>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {progress?.rank || 'Novice'}
            </Badge>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onViewFullProfile && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={onViewFullProfile}
              className="flex-1 gap-2 hover:bg-primary/5"
            >
              <User className="h-4 w-4" />
              View Profile
              <ChevronRight className="h-4 w-4 ml-auto" />
            </Button>
          )}
          
          <Button variant="outline" size="sm" className="gap-2 hover:bg-gray-50">
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfilePanel;
