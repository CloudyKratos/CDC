
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Bell, Search, Home, Sparkles, Users, ChevronRight, Shield, User } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/AuthContext";
import { useRole } from "@/contexts/RoleContext";
import { toast } from "sonner";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const navbarRef = useRef<HTMLDivElement>(null);
  const { user, isAuthenticated, logout } = useAuth();
  const { currentRole } = useRole();
  const navigate = useNavigate();

  const isAdmin = currentRole === 'admin';

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    toast.success("You've been successfully logged out");
    navigate("/login");
    setMobileMenuOpen(false);
  };

  const handleNotificationRead = (notificationId: string) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  const navItems = [
    { id: "home", label: "Home", icon: Home, url: "/" },
    { id: "features", label: "Features", icon: Sparkles, url: "#features" },
    { id: "community", label: "Community", icon: Users, url: "#community" }
  ];

  return (
    <nav
      ref={navbarRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-700 ease-out backdrop-blur-xl",
        scrolled || !transparent
          ? "py-3 bg-white/95 dark:bg-gray-900/95 shadow-lg border-b border-gray-100/60 dark:border-gray-800/60"
          : "py-5 bg-transparent"
      )}
      style={{
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
      }}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center z-20 group">
          <div className="relative">
            <Logo className="mr-2 group-hover:scale-110 transition-all duration-500 ease-out" />
            <div className="absolute -inset-2 bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-all duration-700 ease-out animate-pulse"></div>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary via-purple-500 to-blue-500 text-transparent bg-clip-text group-hover:from-blue-500 group-hover:via-cyan-400 group-hover:to-primary transition-all duration-700 ease-out">
            Nexus
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.url} 
                    className="relative px-4 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-all duration-500 ease-out font-medium flex items-center gap-2 group overflow-hidden rounded-full"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 dark:from-primary/10 dark:via-primary/20 dark:to-primary/10 rounded-full scale-0 group-hover:scale-100 transition-all duration-500 ease-out origin-center"></div>
                    <item.icon size={16} className="transition-all duration-500 ease-out group-hover:scale-125 group-hover:rotate-12" />
                    <span className="relative group-hover:font-semibold transition-all duration-500">{item.label}</span>
                    <div className="absolute bottom-1 left-1/2 w-1 h-1 bg-primary rounded-full scale-0 group-hover:scale-100 transition-all duration-500 ease-out transform -translate-x-1/2"></div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black/95 text-white border-0 text-xs backdrop-blur-sm">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="flex items-center space-x-2 z-20">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-all duration-500 ease-out rounded-full group hover:scale-110">
            <Search size={18} className="group-hover:scale-110 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full scale-0 group-hover:scale-100 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"></div>
          </Button>
          
          {/* Admin Panel Button - Only show for admins */}
          {isAdmin && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link to="/admin">
                    <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 hover:text-red-700 transition-colors rounded-full">
                      <Shield size={18} />
                    </Button>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black/90 text-white border-0 text-xs">
                  <p>Admin Panel</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-all duration-500 ease-out rounded-full group hover:scale-110">
                <Bell size={18} className="group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-gradient-to-r from-red-500 to-pink-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse shadow-lg">
                    {unreadNotifications}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full scale-0 group-hover:scale-100 transition-all duration-500 ease-out opacity-0 group-hover:opacity-100"></div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 glass-morphism animate-scale-in">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Mark all as read</Button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.length === 0 ? (
                  <div className="text-center py-8">
                    <Bell className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No notifications yet</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500">We'll notify you when something happens</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div 
                      key={notif.id}
                      className={cn(
                        "p-2 rounded-lg flex items-start gap-2 transition-all cursor-pointer hover:scale-[1.02]",
                        notif.read 
                          ? "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50" 
                          : "bg-primary/5 dark:bg-primary/10"
                      )}
                      onClick={() => handleNotificationRead(notif.id)}
                    >
                      <div className={cn(
                        "h-2 w-2 mt-2 rounded-full flex-shrink-0",
                        notif.read ? "bg-gray-300 dark:bg-gray-700" : "bg-primary animate-pulse"
                      )} />
                      <div className="flex-1">
                        <p className="text-sm">{notif.text}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
          
          {/* Authentication Buttons */}
          {isAuthenticated ? (
            <Link to="/dashboard" className="hidden md:block">
              <Button variant="default" className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:from-primary/90 hover:via-blue-600 hover:to-purple-700 shadow-lg rounded-full transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl group">
                <span className="group-hover:scale-110 transition-transform duration-500">Dashboard</span>
              </Button>
            </Link>
          ) : (
            <Link to="/login" className="hidden md:block">
              <Button variant="outline" className="border-primary text-primary hover:bg-primary/10 transition-all duration-500 ease-out hover:scale-105 hover:shadow-md rounded-full">
                Sign In
              </Button>
            </Link>
          )}
          
          {/* CTA Button */}
          {!isAuthenticated && (
            <Link to="/login" className="hidden md:block">
              <Button variant="default" className="bg-gradient-to-r from-primary via-blue-500 to-purple-600 hover:from-primary/90 hover:via-blue-600 hover:to-purple-700 shadow-lg rounded-full transition-all duration-500 ease-out hover:scale-105 hover:shadow-xl group">
                <span className="group-hover:scale-110 transition-transform duration-500">Get Started</span>
              </Button>
            </Link>
          )}
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "md:hidden transition-all duration-700 ease-out hover:scale-110 rounded-full",
              mobileMenuOpen ? "rotate-180 scale-110 bg-primary/10" : "hover:bg-primary/5"
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="transition-transform duration-500" /> : <Menu className="transition-transform duration-500" />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 bg-white/98 dark:bg-gray-900/98 backdrop-blur-2xl transform transition-all duration-700 ease-out overflow-hidden shadow-2xl",
          mobileMenuOpen 
            ? "h-screen translate-y-0 opacity-100" 
            : "h-0 -translate-y-20 opacity-0 pointer-events-none"
        )}
        style={{
          backdropFilter: 'blur(32px) saturate(180%)',
          WebkitBackdropFilter: 'blur(32px) saturate(180%)',
        }}
      >
        <div className="container mx-auto px-4 pt-24 pb-6">
          <div className="flex flex-col space-y-5 items-center">
            <div className="flex flex-col w-full space-y-3">
              {navItems.map((item, index) => (
                <Link 
                  key={item.id}
                  to={item.url} 
                  className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02]"
                  onClick={() => setMobileMenuOpen(false)}
                  style={{ 
                    animationDelay: `${index * 100}ms`,
                    animation: "fade-in 0.5s ease-out forwards",
                    opacity: 0
                  }}
                >
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
                      <item.icon className="text-primary" size={20} />
                    </div>
                    <span className="text-base font-medium">{item.label}</span>
                  </div>
                </Link>
              ))}
              
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-2"></div>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 hover:from-primary/20 hover:to-blue-500/20 dark:hover:from-primary/30 dark:hover:to-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      animation: "fade-in 0.5s ease-out forwards",
                      animationDelay: `${navItems.length * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/30 to-blue-500/30 flex items-center justify-center mr-3">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      <span className="text-base font-medium">Dashboard</span>
                    </div>
                    <ChevronRight size={18} className="text-primary" />
                  </Link>

                  {isAdmin && (
                    <Link 
                      to="/admin" 
                      className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] border border-red-200 dark:border-red-900/30"
                      onClick={() => setMobileMenuOpen(false)}
                      style={{ 
                        animation: "fade-in 0.5s ease-out forwards",
                        animationDelay: `${(navItems.length + 1) * 100}ms`,
                        opacity: 0
                      }}
                    >
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-lg bg-red-200/50 dark:bg-red-900/20 flex items-center justify-center mr-3">
                          <Shield className="text-red-600 dark:text-red-400" size={20} />
                        </div>
                        <span className="text-base font-medium text-red-600 dark:text-red-400">Admin Panel</span>
                      </div>
                      <ChevronRight size={18} className="text-red-600 dark:text-red-400" />
                    </Link>
                  )}

                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-between p-3 rounded-xl border border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20 transition-all duration-300 hover:scale-[1.02] text-red-600 dark:text-red-400"
                    style={{ 
                      animation: "fade-in 0.5s ease-out forwards",
                      animationDelay: `${(navItems.length + 2) * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-red-200/50 dark:bg-red-900/20 flex items-center justify-center mr-3">
                        <User className="text-red-600 dark:text-red-400" size={20} />
                      </div>
                      <span className="text-base font-medium">Sign Out</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    to="/login" 
                    className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800/30 hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      animation: "fade-in 0.5s ease-out forwards",
                      animationDelay: `${navItems.length * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center mr-3">
                        <User className="text-primary" size={20} />
                      </div>
                      <span className="text-base font-medium">Sign In</span>
                    </div>
                    <ChevronRight size={18} className="text-primary" />
                  </Link>
                  
                  <Link 
                    to="/login" 
                    className="flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-primary/10 to-blue-500/10 dark:from-primary/20 dark:to-blue-500/20 hover:from-primary/20 hover:to-blue-500/20 dark:hover:from-primary/30 dark:hover:to-blue-500/30 transition-all duration-300 hover:scale-[1.02]"
                    onClick={() => setMobileMenuOpen(false)}
                    style={{ 
                      animation: "fade-in 0.5s ease-out forwards",
                      animationDelay: `${(navItems.length + 1) * 100}ms`,
                      opacity: 0
                    }}
                  >
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary/30 to-blue-500/30 flex items-center justify-center mr-3">
                        <Sparkles className="text-white" size={20} />
                      </div>
                      <span className="text-base font-medium">Get Started</span>
                    </div>
                    <ChevronRight size={18} className="text-primary" />
                  </Link>
                </>
              )}
            </div>
            
            <div className="flex items-center justify-center space-x-3 pt-8">
              <ThemeToggle />
              <Button variant="outline" size="icon" className="rounded-full relative" onClick={() => setMobileMenuOpen(false)}>
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
