
import React from "react";
import { X, Calendar, Bell, Megaphone, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { AnnouncementProps } from "@/types/announcement";

const AnnouncementBanner: React.FC<{ announcement: AnnouncementProps }> = ({ announcement }) => {
  const [isVisible, setIsVisible] = React.useState(true);

  if (!isVisible) {
    return null;
  }

  const getIcon = () => {
    switch (announcement.type) {
      case "event":
        return <Calendar className="mr-2 h-5 w-5 text-blue-500" />;
      case "announcement":
        return <Bell className="mr-2 h-5 w-5 text-purple-500" />;
      case "update":
        return <Megaphone className="mr-2 h-5 w-5 text-orange-500" />;
      case "roundtable":
        return <Users className="mr-2 h-5 w-5 text-green-500" />;
      default:
        return <Bell className="mr-2 h-5 w-5 text-purple-500" />;
    }
  };

  const getBgColor = () => {
    switch (announcement.type) {
      case "event":
        return "bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-800/30";
      case "announcement":
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30";
      case "update":
        return "bg-orange-50 dark:bg-orange-900/20 border-orange-100 dark:border-orange-800/30";
      case "roundtable":
        return "bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-800/30";
      default:
        return "bg-purple-50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800/30";
    }
  };

  const getButtonColor = () => {
    switch (announcement.type) {
      case "event":
        return "bg-blue-500 hover:bg-blue-600 text-white";
      case "announcement":
        return "bg-purple-500 hover:bg-purple-600 text-white";
      case "update":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "roundtable":
        return "bg-green-500 hover:bg-green-600 text-white";
      default:
        return "bg-purple-500 hover:bg-purple-600 text-white";
    }
  };

  const progressValue = announcement.attendees && announcement.maxAttendees 
    ? (announcement.attendees / announcement.maxAttendees) * 100 
    : 0;

  return (
    <div className={`p-4 mb-4 rounded-lg border animate-fade-in ${getBgColor()}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {getIcon()}
          <h3 className="font-semibold">{announcement.title}</h3>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setIsVisible(false)}
        >
          <X className="h-3 w-3" />
        </Button>
      </div>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{announcement.content}</p>
      
      {announcement.attendees !== undefined && announcement.maxAttendees !== undefined && (
        <div className="mt-2">
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-1">
            <span>{announcement.attendees} attending</span>
            <span>{announcement.maxAttendees - announcement.attendees} spots left</span>
          </div>
          <Progress value={progressValue} className="h-1.5" />
        </div>
      )}
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">{announcement.date}</span>
        <Button className={`text-xs px-3 py-1 h-7 ${getButtonColor()}`}>
          Join Now
        </Button>
      </div>
    </div>
  );
};

export default AnnouncementBanner;
