
import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { CalendarEventData } from '@/types/calendar-events';
import { useCalendarState } from '@/hooks/useCalendarState';
import { generateCalendarDays, getEventsForDate, getEventTypeConfig } from '@/utils/calendarHelpers';
import CalendarService from '@/services/CalendarService';
import CalendarHeader from './CalendarHeader';
import CalendarGrid from './CalendarGrid';
import EventDetailsModal from './EventDetailsModal';

interface ImprovedCalendarViewProps {
  showAllEvents?: boolean;
  onEventSelect?: (event: CalendarEventData) => void;
}

const ImprovedCalendarView: React.FC<ImprovedCalendarViewProps> = ({
  showAllEvents = true,
  onEventSelect
}) => {
  const [events, setEvents] = useState<CalendarEventData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEventData | null>(null);

  const { state, actions, computed } = useCalendarState(events);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async (showToast = false) => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log('📅 ImprovedCalendarView: Loading events...');
      const eventsData = await CalendarService.getEvents();
      
      setEvents(eventsData);
      
      if (showToast) {
        toast.success(`Loaded ${eventsData.length} events`);
      }
      
      console.log(`✅ ImprovedCalendarView: Loaded ${eventsData.length} events`);
    } catch (error) {
      console.error('📅 ImprovedCalendarView: Error loading events:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to load events';
      setError(errorMessage);
      
      if (showToast) {
        toast.error('Failed to load calendar events');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEventSelect = (event: CalendarEventData) => {
    setSelectedEvent(event);
    if (onEventSelect) {
      onEventSelect(event);
    }
  };

  const handleJoinEvent = (event: CalendarEventData) => {
    if (event.meeting_url) {
      window.open(event.meeting_url, '_blank');
      toast.success('Opening event meeting...');
    } else {
      toast.error('No meeting link available for this event');
    }
  };

  const calendarDays = generateCalendarDays(
    state.currentDate,
    state.selectedDate,
    computed.filteredEvents
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Loading calendar...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertTriangle className="h-4 w-4 text-red-600" />
        <AlertDescription className="text-red-800">
          Failed to load calendar: {error}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-4">
      <CalendarHeader
        state={state}
        monthTitle={computed.monthRange.title}
        eventCount={computed.filteredEvents.length}
        isLoading={isLoading}
        onNavigateMonth={actions.navigateMonth}
        onViewChange={actions.setView}
        onRefresh={() => loadEvents(true)}
      />

      {state.view === 'month' && (
        <CalendarGrid
          days={calendarDays}
          onDateSelect={actions.setSelectedDate}
          onEventSelect={handleEventSelect}
          showWeekends={state.showWeekends}
        />
      )}

      {state.view === 'agenda' && (
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Upcoming Events</h3>
              {computed.filteredEvents.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No events found for the selected filters.
                </p>
              ) : (
                <div className="space-y-3">
                  {computed.filteredEvents
                    .sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime())
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                        onClick={() => handleEventSelect(event)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="space-y-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {new Date(event.start_time).toLocaleDateString()} • {new Date(event.start_time).toLocaleTimeString()}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="text-lg">{getEventTypeConfig(event.event_type).icon}</div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <EventDetailsModal
        event={selectedEvent}
        isOpen={!!selectedEvent}
        onClose={() => setSelectedEvent(null)}
        onJoinEvent={handleJoinEvent}
      />
    </div>
  );
};

export default ImprovedCalendarView;
