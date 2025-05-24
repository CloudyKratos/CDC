
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/auth/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import RoleBasedComponent from "@/components/auth/RoleBasedComponent";
import {
  Home,
  Calendar,
  MessageSquare,
  VideoIcon,
  Users,
  User,
  Settings,
  Shield,
  Crown,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const Sidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { currentRole, canManageCalendar, canManageUsers, canViewAnalytics } = useRole();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const getRoleBadgeColor = () => {
    switch (currentRole) {
      case 'admin': return 'bg-red-500 hover:bg-red-600';
      case 'moderator': return 'bg-orange-500 hover:bg-orange-600';
      case 'member': return 'bg-blue-500 hover:bg-blue-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const navigation = [
    { name: "Home", href: "/dashboard", icon: Home, show: true },
    { name: "Calendar", href: "/dashboard?tab=calendar", icon: Calendar, show: true },
    { name: "Community", href: "/dashboard?tab=community", icon: MessageSquare, show: true },
    { name: "Stage Events", href: "/dashboard?tab=stage", icon: VideoIcon, show: true },
    { name: "Members", href: "/dashboard?tab=workspace", icon: Users, show: true },
  ];

  const adminNavigation = [
    { name: "Admin Panel", href: "/admin", icon: Shield, show: canManageUsers },
    { name: "Analytics", href: "/admin?tab=analytics", icon: BarChart3, show: canViewAnalytics },
    { name: "Settings", href: "/settings", icon: Settings, show: currentRole === 'admin' },
  ];

  if (!user) return null;

  return (
    <div className={cn(
      "flex flex-col h-full bg-white border-r border-gray-200 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">C</span>
            </div>
            <span className="font-semibold text-gray-900">Community</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8 p-0"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <span className="text-white font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.name || 'User'}
              </p>
              <div className="flex items-center gap-2">
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                {currentRole && (
                  <Badge className={cn("text-xs", getRoleBadgeColor())}>
                    {currentRole === 'admin' && <Crown className="h-3 w-3 mr-1" />}
                    {currentRole}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        <div className="space-y-1">
          {navigation.map((item) => (
            item.show && (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  isActive(item.href)
                    ? "bg-blue-50 text-blue-700 border-r-2 border-blue-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                )}
              >
                <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
                {!isCollapsed && item.name}
              </Link>
            )
          ))}
        </div>

        {/* Admin Section */}
        <RoleBasedComponent allowedRoles={['admin', 'moderator']}>
          {!isCollapsed && (
            <div className="pt-4">
              <h3 className="px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Administration
              </h3>
            </div>
          )}
          <div className="space-y-1 mt-2">
            {adminNavigation.map((item) => (
              item.show && (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                    isActive(item.href)
                      ? "bg-red-50 text-red-700 border-r-2 border-red-700"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  )}
                >
                  <item.icon className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
                  {!isCollapsed && item.name}
                </Link>
              )
            ))}
          </div>
        </RoleBasedComponent>
      </nav>

      {/* Profile Link */}
      <div className="p-4 border-t border-gray-200">
        <Link
          to="/profile"
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
            "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
          )}
        >
          <User className={cn("flex-shrink-0", isCollapsed ? "h-5 w-5" : "h-4 w-4 mr-3")} />
          {!isCollapsed && "Profile"}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
