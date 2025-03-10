
import React, { useState } from "react";
import { Bell, Calendar, Users, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

export type AnnouncementType = "roundtable" | "update" | "maintenance";

export interface AnnouncementProps {
  id: string;
  title: string;
  content: string;
  date: string;
  type: AnnouncementType;
  attendees?: number;
  maxAttendees?: number;
}

interface AnnouncementBannerProps {
  announcement: AnnouncementProps;
}

const AnnouncementBanner: React.FC<AnnouncementBannerProps> = ({ announcement }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAttending, setIsAttending] = useState(false);
  
  if (!isVisible) return null;

  const handleClose = () => {
    setIsVisible(false);
  };

  const handleAttend = () => {
    if (isAttending) {
      toast.info("You've been removed from the attendee list");
      setIsAttending(false);
    } else {
      toast.success("You're now attending this event!");
      setIsAttending(true);
    }
  };

  // Calculate attendance percentage
  const attendancePercentage = announcement.attendees && announcement.maxAttendees 
    ? (announcement.attendees / announcement.maxAttendees) * 100
    : 0;

  // Different styling based on announcement type
  const getBgColor = () => {
    switch (announcement.type) {
      case "roundtable":
        return "bg-gradient-to-r from-purple-600/90 to-indigo-600/90";
      case "update":
        return "bg-gradient-to-r from-blue-600/90 to-cyan-600/90";
      case "maintenance":
        return "bg-gradient-to-r from-amber-600/90 to-orange-600/90";
      default:
        return "bg-gradient-to-r from-purple-600/90 to-indigo-600/90";
    }
  };

  const getIcon = () => {
    switch (announcement.type) {
      case "roundtable":
        return <Users className="h-5 w-5 text-indigo-200" />;
      case "update":
        return <Bell className="h-5 w-5 text-blue-200" />;
      case "maintenance":
        return <Calendar className="h-5 w-5 text-amber-200" />;
      default:
        return <Bell className="h-5 w-5 text-indigo-200" />;
    }
  };

  return (
    <div className={`w-full ${getBgColor()} text-white p-3 sm:p-4 shadow-md relative animate-fade-in`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-start sm:items-center justify-between">
        <div className="flex items-center space-x-3 mb-2 sm:mb-0">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            {getIcon()}
          </div>
          <div>
            <h3 className="font-medium text-sm sm:text-base">{announcement.title}</h3>
            <p className="text-xs sm:text-sm text-white/80">{announcement.content}</p>
          </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
          {announcement.type === "roundtable" && announcement.attendees !== undefined && announcement.maxAttendees !== undefined && (
            <div className="flex flex-col space-y-1 w-full sm:w-48">
              <div className="flex justify-between text-xs">
                <span>{announcement.attendees} attending</span>
                <span>{announcement.maxAttendees} max</span>
              </div>
              <Progress value={attendancePercentage} className="h-2 bg-white/20" indicatorClassName="bg-white" />
            </div>
          )}
          
          <div className="flex space-x-2 w-full sm:w-auto justify-between sm:justify-start">
            <span className="text-xs sm:text-sm font-medium bg-white/20 px-2 py-1 rounded-full">
              {announcement.date}
            </span>
            
            {announcement.type === "roundtable" && (
              <Button 
                size="sm" 
                variant={isAttending ? "destructive" : "secondary"} 
                className="text-xs sm:text-sm h-7"
                onClick={handleAttend}
              >
                {isAttending ? "Cancel" : "Attend"}
              </Button>
            )}
          </div>
        </div>
      </div>
      
      <button 
        className="absolute top-2 right-2 sm:top-4 sm:right-4 text-white/80 hover:text-white transition-colors"
        onClick={handleClose}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export default AnnouncementBanner;
