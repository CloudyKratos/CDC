
import React from "react";
import ProfilePanel from "./ProfilePanel";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import Icons from "@/utils/IconUtils";

const UserProfilePanel: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="animate-fade-in space-y-6">
      <ProfilePanel />
      
      <Card className="backdrop-blur-md bg-white/80 dark:bg-gray-900/80 border border-primary/10">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icons.User size={18} className="text-primary" />
            User Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center gap-4 pb-4 border-b dark:border-gray-800">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user?.avatar || undefined} />
                <AvatarFallback className="text-xl">
                  {user?.name?.charAt(0) || 'W'}
                </AvatarFallback>
              </Avatar>
              <Button 
                size="icon" 
                variant="outline" 
                className="absolute bottom-0 right-0 rounded-full h-8 w-8 bg-white dark:bg-gray-800"
              >
                <Icons.Camera size={14} />
              </Button>
            </div>
            <div className="text-center">
              <h3 className="font-medium text-lg">{user?.name || 'Warrior'}</h3>
              <p className="text-sm text-muted-foreground">{user?.email || 'warrior@cdcwarriors.com'}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icons.User size={16} />
              Edit Profile
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icons.Settings size={16} />
              Account Settings
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Icons.Bell size={16} />
              Notification Preferences
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
              <Icons.LogOut size={16} />
              Sign Out
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserProfilePanel;
