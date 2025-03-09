
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Bell, Search, User, Home, Sparkles, MessageCircle, Hash, Users, ChevronRight } from "lucide-react";
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
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface NavbarProps {
  transparent?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ transparent = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: "New message from Alex", time: "5m ago", read: false },
    { id: 2, text: "Community event starting soon", time: "1h ago", read: false },
    { id: 3, text: "Your daily reflection reminder", time: "2h ago", read: true },
  ]);
  const navbarRef = useRef<HTMLDivElement>(null);

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

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target as Node) && mobileMenuOpen) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [mobileMenuOpen]);

  const handleNotificationRead = (id: number) => {
    setNotifications(
      notifications.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
  };

  const unreadNotifications = notifications.filter(n => !n.read).length;

  // Navigation items - centralized for consistency
  const navItems = [
    { id: "home", label: "Home", icon: Home, url: "/" },
    { id: "features", label: "Features", icon: Sparkles, url: "#features" },
    { id: "community", label: "Community", icon: Users, url: "#community", badge: "New" },
    { id: "messages", label: "Messages", icon: MessageCircle, url: "/messages", count: 3 },
    { id: "explore", label: "Explore", icon: Hash, url: "/explore" }
  ];

  return (
    <nav
      ref={navbarRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out backdrop-blur-md",
        scrolled || !transparent
          ? "py-3 bg-white/90 dark:bg-gray-900/90 shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center z-20 group">
          <div className="relative">
            <Logo className="mr-2 group-hover:scale-110 transition-transform duration-300" />
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-blue-400 rounded-full blur opacity-0 group-hover:opacity-20 transition-opacity duration-500"></div>
          </div>
          <span className="text-lg font-bold bg-gradient-to-r from-primary to-blue-500 text-transparent bg-clip-text group-hover:from-blue-500 group-hover:to-primary transition-all duration-500">
            Nexus
          </span>
        </Link>

        {/* Desktop Menu - with improved animations */}
        <div className="hidden md:flex items-center space-x-1">
          {navItems.map((item, index) => (
            <TooltipProvider key={item.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link 
                    to={item.url} 
                    className="relative px-3 py-2 text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1 group overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 rounded-md scale-0 group-hover:scale-100 transition-transform duration-300 origin-bottom"></div>
                    <item.icon size={16} className="transition-transform duration-300 group-hover:scale-110" />
                    <span className="relative">{item.label}</span>
                    {item.badge && (
                      <Badge className="ml-1 bg-primary text-white text-[10px] px-1.5">
                        {item.badge}
                      </Badge>
                    )}
                    {item.count && (
                      <Badge className="ml-1 bg-primary text-white text-[10px] w-4 h-4 p-0 flex items-center justify-center">
                        {item.count}
                      </Badge>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="bg-black/90 text-white border-0 text-xs">
                  <p>{item.label}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>

        <div className="flex items-center space-x-2 z-20">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-colors rounded-full">
            <Search size={18} />
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-colors rounded-full">
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center animate-pulse">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 glass-morphism animate-scale-in">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Mark all as read</Button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
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
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <Button variant="ghost" size="sm" className="w-full text-primary text-xs group">
                  <span>View all notifications</span>
                  <ChevronRight size={14} className="ml-1 transition-transform group-hover:translate-x-0.5" />
                </Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
          
          {/* User profile menu for desktop */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild className="hidden md:flex">
              <Button variant="ghost" size="icon" className="rounded-full overflow-hidden hover:ring-2 hover:ring-primary/20 transition-all">
                <Avatar>
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>FX</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 glass-morphism animate-scale-in">
              <div className="py-2 px-3 mb-1 flex items-center space-x-3 border-b border-gray-100 dark:border-gray-800">
                <Avatar className="h-10 w-10">
                  <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" />
                  <AvatarFallback>FX</AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">Felix Chen</p>
                  <p className="text-xs text-gray-500">felix@example.com</p>
                </div>
              </div>
              
              <Link to="/dashboard">
                <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1">
                  <span>Dashboard</span>
                </DropdownMenuItem>
              </Link>
              
              <Link to="/settings">
                <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1">
                  <span>Settings</span>
                </DropdownMenuItem>
              </Link>
              
              <DropdownMenuItem className="cursor-pointer rounded-md py-2 my-1 text-red-500 focus:text-red-500">
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Link to="/dashboard" className="hidden md:block">
            <Button variant="default" className="bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-600 shadow-sm rounded-full">
              Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "md:hidden transition-all duration-500",
              mobileMenuOpen ? "rotate-90 opacity-70" : ""
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu - with enhanced animations */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg transform transition-all duration-500 ease-in-out overflow-hidden",
          mobileMenuOpen 
            ? "h-screen translate-y-0 opacity-100" 
            : "h-0 -translate-y-10 opacity-0 pointer-events-none"
        )}
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
                  {item.badge && (
                    <Badge className="bg-primary text-white">
                      {item.badge}
                    </Badge>
                  )}
                  {item.count && (
                    <Badge className="bg-primary text-white">
                      {item.count}
                    </Badge>
                  )}
                </Link>
              ))}
              
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-2"></div>
              
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
              <Button variant="outline" size="icon" className="rounded-full" onClick={() => setMobileMenuOpen(false)}>
                <User size={18} />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};
