
import React, { useState } from 'react';
import { Megaphone, X, Calendar, ArrowRight, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AnnouncementProps {
  announcement: {
    id: string;
    title: string;
    content: string;
    date: string;
    type: 'roundtable' | 'update' | 'maintenance';
    attendees?: number;
    maxAttendees?: number;
  };
  onJoin?: (id: string) => void;
}

const AnnouncementBanner: React.FC<AnnouncementProps> = ({ 
  announcement, 
  onJoin = () => toast.success(`Joined ${announcement.title}`) 
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isJoined, setIsJoined] = useState(false);

  if (!isVisible) return null;

  const getGradientByType = () => {
    switch (announcement.type) {
      case 'roundtable':
        return 'from-purple-500/10 to-blue-500/10 border-purple-200/50 dark:border-purple-900/30';
      case 'update':
        return 'from-green-500/10 to-teal-500/10 border-green-200/50 dark:border-green-900/30';
      case 'maintenance':
        return 'from-amber-500/10 to-orange-500/10 border-amber-200/50 dark:border-amber-900/30';
      default:
        return 'from-purple-500/10 to-blue-500/10 border-purple-200/50 dark:border-purple-900/30';
    }
  };

  const getIconBgByType = () => {
    switch (announcement.type) {
      case 'roundtable':
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400';
      case 'update':
        return 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400';
      case 'maintenance':
        return 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400';
      default:
        return 'bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400';
    }
  };

  const handleJoin = () => {
    if (!isJoined) {
      setIsJoined(true);
      onJoin(announcement.id);
    } else {
      toast.info("You're already registered for this event");
    }
  };

  return (
    <>
      <div className={`relative mb-4 p-4 bg-gradient-to-r ${getGradientByType()} border rounded-lg backdrop-blur-sm shadow-sm animate-fade-in transition-all`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 h-10 w-10 ${getIconBgByType()} rounded-full flex items-center justify-center`}>
            <Megaphone size={20} />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-start">
              <h3 className="text-base font-medium text-gray-900 dark:text-gray-100">
                {announcement.title}
              </h3>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-7 w-7 text-gray-500 hover:bg-gray-200/70 dark:hover:bg-gray-800/70 rounded-full -mt-1.5 -mr-1.5"
                onClick={() => setIsVisible(false)}
                aria-label="Dismiss"
              >
                <X size={14} />
              </Button>
            </div>
            
            <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
              {announcement.content.length > 120 
                ? `${announcement.content.substring(0, 120)}...` 
                : announcement.content}
            </p>
            
            <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-2">
              <div className="flex items-center">
                <Calendar size={12} className="mr-1" />
                <span>{announcement.date}</span>
              </div>
              
              {announcement.attendees !== undefined && (
                <div className="flex items-center">
                  <Users size={12} className="mr-1" />
                  <span>{announcement.attendees}/{announcement.maxAttendees || '∞'} attendees</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="mt-3 flex justify-end gap-2">
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-xs h-7 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30"
            onClick={() => setIsDetailsOpen(true)}
          >
            View Details
          </Button>
          
          {announcement.type === 'roundtable' && (
            <Button 
              size="sm" 
              variant={isJoined ? "outline" : "default"}
              className={`text-xs h-7 group ${isJoined ? 'border-green-500 text-green-600' : ''}`}
              onClick={handleJoin}
            >
              {isJoined ? 'Joined' : 'Join Roundtable'}
              <ArrowRight size={12} className="ml-1 group-hover:translate-x-0.5 transition-transform" />
            </Button>
          )}
        </div>
      </div>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{announcement.title}</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
              {announcement.content}
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Date & Time</h4>
                <p className="text-gray-600 dark:text-gray-400">{announcement.date}</p>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100">Type</h4>
                <p className="text-gray-600 dark:text-gray-400 capitalize">{announcement.type}</p>
              </div>
              
              {announcement.attendees !== undefined && (
                <div className="col-span-2">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">Attendees</h4>
                  <div className="flex items-center mt-1">
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (announcement.attendees / (announcement.maxAttendees || announcement.attendees)) * 100)}%` 
                        }}
                      ></div>
                    </div>
                    <span className="ml-2 text-xs text-gray-600 dark:text-gray-400">
                      {announcement.attendees}/{announcement.maxAttendees || '∞'}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <DialogFooter>
            {announcement.type === 'roundtable' && (
              <Button 
                variant={isJoined ? "outline" : "default"}
                className={isJoined ? 'border-green-500 text-green-600' : ''}
                onClick={handleJoin}
              >
                {isJoined ? 'Already Joined' : 'Join Roundtable'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default AnnouncementBanner;
