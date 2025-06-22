import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from 'flowbite-react';
import {
  LayoutDashboard,
  Target,
  Brain,
  TrendingUp,
  Calendar,
  MessageSquare,
  MessageCircle,
  User,
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/warrior-space', label: 'Warrior Space', icon: Target },
  { path: '/strategy', label: 'Strategy', icon: Brain },
  { path: '/progress', label: 'Progress', icon: TrendingUp },
  { path: '/events', label: 'Events', icon: Calendar },
  { path: '/community', label: 'Community', icon: MessageSquare },
  { path: '/messages', label: 'Messages', icon: MessageCircle },
  { path: '/profile', label: 'Profile', icon: User },
];

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar
        className="w-64 h-screen sticky top-0"
        aria-label="Sidebar with content separation example"
        style={{ display: isSidebarOpen ? 'block' : 'none' }}
      >
        <div className="h-full flex flex-col dark:bg-gray-800">
          <div className="px-3 py-4 overflow-y-auto flex-grow">
            <div className="space-y-2 font-medium">
              {navItems.map((item) => (
                <Sidebar.Item key={item.path} href={item.path} icon={item.icon} onClick={() => navigate(item.path)}>
                  {item.label}
                </Sidebar.Item>
              ))}
            </div>
          </div>
          <div className="p-4 border-t dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <Avatar className="w-8 h-8">
                <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                <AvatarFallback>{user?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="space-y-1 font-medium dark:text-white">
                <div>{user?.user_metadata?.full_name || user?.email}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</div>
              </div>
            </div>
            <Sidebar.Item href="#" onClick={handleSignOut} className="mt-4">
              Sign Out
            </Sidebar.Item>
          </div>
        </div>
      </Sidebar>
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
