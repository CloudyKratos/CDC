
import React from "react";
import { Button } from "@/components/ui/button";
import { 
  BellRing, 
  Sun, 
  Moon, 
  Sparkles
} from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { NotificationType } from "@/types/notification";

interface DashboardHeaderProps {
  isMobile: boolean;
  viewMode: string;
  activeChannel: string;
  darkMode: boolean;
  toggleDarkMode: () => void;
  setViewMode: (mode: string) => void;
  unreadCount: number;
  notificationsOpen: boolean;
  setNotificationsOpen: (open: boolean) => void;
  notifications: NotificationType[];
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  isMobile,
  viewMode,
  activeChannel,
  darkMode,
  toggleDarkMode,
  setViewMode,
  unreadCount,
  notificationsOpen,
  setNotificationsOpen,
  notifications
}) => {
  const handleNotificationClick = () => {
    setNotificationsOpen(true);
  };

  const renderTitle = () => {
    if (viewMode === "home") {
      return <span className="bg-gradient-to-r from-green-500 to-emerald-600 text-transparent bg-clip-text">Home</span>;
    } else if (viewMode === "chat") {
      return <span className="bg-gradient-to-r from-indigo-600 to-blue-500 text-transparent bg-clip-text">
        Direct Messages
      </span>;
    } else if (viewMode === "community") {
      return (
        <>
          <span className="bg-gradient-to-r from-purple-600 to-pink-500 text-transparent bg-clip-text">
            {activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1).replace(/-/g, ' ')}
          </span>
          <Sparkles size={16} className="text-purple-500 animate-pulse-glow" />
        </>
      );
    } else if (viewMode === "workspace") {
      return <span className="bg-gradient-to-r from-blue-500 to-cyan-400 text-transparent bg-clip-text">Documents</span>;
    } else if (viewMode === "calendar") {
      return <span className="bg-gradient-to-r from-orange-400 to-red-500 text-transparent bg-clip-text">Calendar</span>;
    } else if (viewMode === "profile") {
      return <span className="bg-gradient-to-r from-green-400 to-teal-500 text-transparent bg-clip-text">Profile</span>;
    } else {
      return <span className="bg-gradient-to-r from-purple-600 to-blue-500 text-transparent bg-clip-text">Dashboard</span>;
    }
  };

  return (
    <div className="p-3 bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 flex justify-between items-center shadow-sm sticky top-0 z-30">
      {isMobile && (
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={() => setViewMode("mobile-menu")}
          className={viewMode !== "mobile-menu" ? "flex" : "hidden"}
        >
          <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 3C1.22386 3 1 3.22386 1 3.5C1 3.77614 1.22386 4 1.5 4H13.5C13.7761 4 14 3.77614 14 3.5C14 3.22386 13.7761 3 13.5 3H1.5ZM1 7.5C1 7.22386 1.22386 7 1.5 7H13.5C13.7761 7 14 7.22386 14 7.5C14 7.77614 13.7761 8 13.5 8H1.5C1.22386 8 1 7.77614 1 7.5ZM1 11.5C1 11.2239 1.22386 11 1.5 11H13.5C13.7761 11 14 11.2239 14 11.5C14 11.7761 13.7761 12 13.5 12H1.5C1.22386 12 1 11.7761 1 11.5Z" fill="currentColor" />
          </svg>
        </Button>
      )}
      
      <div className={`text-xl font-bold flex items-center gap-2 ${isMobile && viewMode !== "mobile-menu" ? "text-center flex-1" : ""}`}>
        {renderTitle()}
      </div>
      
      <div className="flex items-center space-x-2">
        <Popover open={notificationsOpen} onOpenChange={setNotificationsOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleNotificationClick}
              className="relative hover:bg-primary/10 rounded-full h-9 w-9"
            >
              <BellRing size={18} />
              {unreadCount > 0 && (
                <span className="absolute top-0 right-0 h-2.5 w-2.5 rounded-full bg-primary animate-pulse"></span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0 mr-2" align="end">
            <div className="flex items-center justify-between p-4 border-b">
              <h4 className="font-medium">Notifications</h4>
              <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">{unreadCount} new</Badge>
            </div>
            <ScrollArea className="h-[300px]">
              <div className="py-2">
                {notifications.map((notification) => (
                  <div 
                    key={notification.id} 
                    className={`px-4 py-3 hover:bg-muted/50 cursor-pointer ${!notification.read ? 'border-l-2 border-primary' : ''}`}
                  >
                    <div className="flex gap-3 items-start">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center ${
                        notification.type === 'message' 
                          ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-400' 
                          : notification.type === 'event'
                          ? 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400'
                          : notification.type === 'document'
                          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
                          : notification.type === 'user'
                          ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                          : notification.type === 'announcement'
                          ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                          : 'bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400'
                      }`}>
                        {notification.icon}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{notification.title}</p>
                        <p className="text-xs text-muted-foreground">{notification.description}</p>
                        <p className="text-xs text-muted-foreground mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-4 border-t text-center">
              <Button variant="ghost" className="w-full text-sm">View All Notifications</Button>
            </div>
          </PopoverContent>
        </Popover>
        {!isMobile && (
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleDarkMode}
            className="h-9 w-9 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DashboardHeader;
