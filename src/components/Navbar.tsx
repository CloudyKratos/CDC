
import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { Logo } from "./ui/Logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./ThemeToggle";
import { Menu, X, Bell, Search, User, Home, Sparkles, MessageCircle, Hash, Users } from "lucide-react";
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

  return (
    <nav
      ref={navbarRef}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 ease-in-out",
        scrolled || !transparent
          ? "py-3 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm border-b border-gray-100 dark:border-gray-800"
          : "py-5 bg-transparent"
      )}
    >
      <div className="container mx-auto flex items-center justify-between px-4 md:px-6">
        <Link to="/" className="flex items-center z-20 group transition-all duration-300">
          <Logo className="button-effect mr-2 group-hover:scale-110 transition-transform duration-300" />
          <span className="text-lg font-bold gradient-text group-hover:text-primary transition-colors duration-300">Nexus</span>
        </Link>

        <div className="hidden md:flex items-center space-x-6">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="/" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1 link-underline"
                >
                  <Home size={16} />
                  <span>Home</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Dashboard</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="#features" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1 link-underline"
                >
                  <Sparkles size={16} />
                  <span>Features</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Explore features</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Link 
                  to="#community" 
                  className="text-gray-700 dark:text-gray-300 hover:text-primary dark:hover:text-primary transition-colors font-medium flex items-center gap-1 link-underline"
                >
                  <Users size={16} />
                  <span>Community</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p className="text-xs">Join our community</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>

        <div className="flex items-center space-x-3 z-20">
          {/* Search Button */}
          <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-colors">
            <Search size={18} />
          </Button>
          
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="hidden md:flex relative hover:bg-primary/10 transition-colors">
                <Bell size={18} />
                {unreadNotifications > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-primary text-[10px] font-bold text-white rounded-full flex items-center justify-center">
                    {unreadNotifications}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 p-2 glass-morphism">
              <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100 dark:border-gray-800">
                <h3 className="font-semibold">Notifications</h3>
                <Button variant="ghost" size="sm" className="text-xs h-7 px-2">Mark all as read</Button>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto scrollbar-thin">
                {notifications.map((notif) => (
                  <div 
                    key={notif.id}
                    className={cn(
                      "p-2 rounded-lg flex items-start gap-2 transition-colors cursor-pointer",
                      notif.read 
                        ? "bg-transparent hover:bg-gray-50 dark:hover:bg-gray-800/50" 
                        : "bg-primary/5 dark:bg-primary/10"
                    )}
                    onClick={() => handleNotificationRead(notif.id)}
                  >
                    <div className={cn(
                      "h-2 w-2 mt-2 rounded-full flex-shrink-0",
                      notif.read ? "bg-gray-300 dark:bg-gray-700" : "bg-primary"
                    )} />
                    <div className="flex-1">
                      <p className="text-sm">{notif.text}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{notif.time}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-2 pt-2 border-t border-gray-100 dark:border-gray-800 text-center">
                <Button variant="ghost" size="sm" className="w-full text-primary text-xs">View all notifications</Button>
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
          
          <ThemeToggle />
          
          <Link to="/dashboard">
            <Button variant="default" className="button-effect hidden md:flex bg-primary hover:bg-primary/90 shadow-sm">
              Dashboard
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className={cn(
              "md:hidden transition-all duration-300",
              mobileMenuOpen ? "rotate-90 opacity-70" : ""
            )}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      <div 
        className={cn(
          "absolute top-0 left-0 right-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-lg transform transition-all duration-500 ease-in-out overflow-hidden",
          mobileMenuOpen 
            ? "h-screen translate-y-0 opacity-100" 
            : "h-0 -translate-y-10 opacity-0 pointer-events-none"
        )}
      >
        <div className="container mx-auto px-4 pt-20 pb-6">
          <div className="flex flex-col space-y-6 items-center">
            <div className="flex flex-col w-full space-y-4">
              <Link 
                to="/" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Home className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Home</span>
                </div>
              </Link>
              
              <Link 
                to="#features" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Sparkles className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Features</span>
                </div>
              </Link>
              
              <Link 
                to="#community" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Users className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Community</span>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary">
                  New
                </Badge>
              </Link>
              
              <div className="h-px w-full bg-gray-100 dark:bg-gray-800 my-2"></div>
              
              <Link 
                to="/dashboard" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <Hash className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Dashboard</span>
                </div>
              </Link>
              
              <Link 
                to="/messages" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <MessageCircle className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Messages</span>
                </div>
                <Badge className="bg-primary text-white">3</Badge>
              </Link>
              
              <Link 
                to="/profile" 
                className="flex items-center justify-between p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                <div className="flex items-center">
                  <User className="mr-3 text-primary" size={20} />
                  <span className="text-lg">Profile</span>
                </div>
              </Link>
            </div>
            
            <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="w-full">
              <Button size="lg" className="bg-primary hover:bg-primary/90 mt-4 w-full">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};
