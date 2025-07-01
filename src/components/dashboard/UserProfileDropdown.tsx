
import React from 'react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { 
  Shield,
  User,
  Settings,
  LogOut
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/contexts/RoleContext';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

const UserProfileDropdown: React.FC = () => {
  const { user, logout } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();
  const isAdmin = currentRole === 'admin';

  const handleLogout = () => {
    logout();
    toast.success("Successfully logged out");
    navigate("/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="flex items-center gap-3 p-2 h-auto">
          <div className="hidden sm:block text-right">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {user?.name || user?.email?.split('@')[0] || 'User'}
            </p>
            <div className="flex items-center gap-2">
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email}
              </p>
              {isAdmin && (
                <Badge className="bg-red-500 text-white text-[10px]">
                  <Shield className="h-2 w-2 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
          <Avatar className="h-10 w-10 ring-2 ring-gray-200 dark:ring-gray-700">
            <AvatarImage 
              src={user?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.email || 'default'}`} 
              alt="Avatar" 
            />
            <AvatarFallback>
              {user?.name?.slice(0, 2).toUpperCase() || 
               user?.email?.slice(0, 2).toUpperCase() || 
               'US'}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <Link to="/profile-settings">
          <DropdownMenuItem className="cursor-pointer">
            <User className="h-4 w-4 mr-2" />
            Profile Settings
          </DropdownMenuItem>
        </Link>
        <DropdownMenuItem>
          <Settings className="h-4 w-4 mr-2" />
          Preferences
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfileDropdown;
