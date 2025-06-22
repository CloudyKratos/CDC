
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Target,
  MessageSquare,
  MessageCircle,
  User,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { cn } from '@/lib/utils';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/warrior-space', label: 'Warrior Space', icon: Target },
  { path: '/community', label: 'Community', icon: MessageSquare },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  // Helper functions to safely access user metadata
  const getUserName = () => {
    if (!user) return '';
    const metadata = (user as any).user_metadata;
    return metadata?.full_name || metadata?.name || user.email?.split('@')[0] || 'User';
  };

  const getUserAvatar = () => {
    if (!user) return '';
    const metadata = (user as any).user_metadata;
    return metadata?.avatar_url || metadata?.avatar || '';
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={cn(
        "bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300",
        isSidebarOpen ? "w-64" : "w-16"
      )}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              {isSidebarOpen && (
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Community
                </h2>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              >
                {isSidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
              </Button>
            </div>
          </div>
          
          {/* Navigation */}
          <div className="flex-1 px-3 py-4 overflow-y-auto">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                
                return (
                  <Button
                    key={item.path}
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      !isSidebarOpen && "px-2"
                    )}
                    onClick={() => navigate(item.path)}
                  >
                    <Icon className="h-4 w-4" />
                    {isSidebarOpen && <span className="ml-2">{item.label}</span>}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {/* User section */}
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-3">
              <Avatar className="w-8 h-8">
                <AvatarImage 
                  src={getUserAvatar()} 
                  alt={getUserName()} 
                />
                <AvatarFallback>
                  {getUserName()[0]?.toUpperCase() || 'U'}
                </AvatarFallback>
              </Avatar>
              
              {isSidebarOpen && (
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {getUserName()}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {user?.email}
                  </div>
                </div>
              )}
            </div>
            
            {isSidebarOpen && (
              <Button
                variant="ghost"
                size="sm"
                className="w-full mt-2"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
