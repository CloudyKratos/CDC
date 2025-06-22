
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Users, MapPin, Video, Tag, Globe, Award } from 'lucide-react';
import { CalendarEventData } from '@/types/calendar-events';
import { getEventTypeConfig, getStatusConfig, formatEventTime } from '@/utils/calendarHelpers';
import { format } from 'date-fns';

interface EventDetailsModalProps {
  event: CalendarEventData | null;
  isOpen: boolean;
  onClose: () => void;
  onJoinEvent?: (event: CalendarEventData) => void;
}

const EventDetailsModal: React.FC<EventDetailsModalProps> = ({
  event,
  isOpen,
  onClose,
  onJoinEvent
}) => {
  if (!event) return null;

  const eventConfig = getEventTypeConfig(event.event_type);
  const statusConfig = getStatusConfig(event.status);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4">
          <div className="flex items-start gap-4">
            <div className={`p-3 rounded-lg ${eventConfig.bgColor}`}>
              <span className="text-2xl">{eventConfig.icon}</span>
            </div>
            <div className="flex-1 space-y-2">
              <DialogTitle className="text-xl">{event.title}</DialogTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="capitalize">
                  {event.event_type?.replace('_', ' ')}
                </Badge>
                <Badge variant={statusConfig.badge as any}>
                  {statusConfig.text}
                </Badge>
                {event.visibility_level && (
                  <Badge variant="secondary">
                    <Globe className="h-3 w-3 mr-1" />
                    {event.visibility_level}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Event Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Date:</span>
                <span>{format(new Date(event.start_time), 'PPP')}</span>
              </div>
              
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="font-medium">Time:</span>
                <span>{formatEventTime(event.start_time, event.end_time)}</span>
              </div>

              {event.max_attendees && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Max Attendees:</span>
                  <span>{event.max_attendees}</span>
                </div>
              )}
            </div>

            <div className="space-y-3">
              {event.xp_reward && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">XP Reward:</span>
                  <span>{event.xp_reward} XP</span>
                </div>
              )}

              {event.cohort_id && (
                <div className="flex items-center gap-2 text-sm">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Cohort:</span>
                  <span>{event.cohort_id}</span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Description */}
          {event.description && (
            <div className="space-y-2">
              <h4 className="font-semibold">Description</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {event.description}
              </p>
            </div>
          )}

          {/* Tags */}
          {event.tags && event.tags.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Tag className="h-4 w-4" />
                Tags
              </h4>
              <div className="flex flex-wrap gap-2">
                {event.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Resources */}
          {event.resources && (
            <div className="space-y-2">
              <h4 className="font-semibold">Resources</h4>
              <div className="text-sm text-muted-foreground">
                Additional resources will be available here
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {event.meeting_url && event.status !== 'completed' && event.status !== 'cancelled' && (
              <Button 
                className="flex-1"
                onClick={() => {
                  if (onJoinEvent) {
                    onJoinEvent(event);
                  } else {
                    window.open(event.meeting_url, '_blank');
                  }
                }}
              >
                <Video className="h-4 w-4 mr-2" />
                {event.status === 'live' ? 'Join Now' : 'Join Event'}
              </Button>
            )}
            
            {event.replay_url && event.status === 'completed' && (
              <Button 
                variant="outline"
                onClick={() => window.open(event.replay_url, '_blank')}
              >
                <Video className="h-4 w-4 mr-2" />
                Watch Replay
              </Button>
            )}
            
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EventDetailsModal;
