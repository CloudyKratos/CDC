
import React, { useState, useEffect, useMemo } from 'react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Plus,
  List,
  LayoutGrid,
  Clock,
  User,
  MapPin,
  File,
  Loader2
} from 'lucide-react';
import { format, addDays, subDays, addMonths, subMonths, startOfMonth, endOfMonth, isSameDay, addWeeks, subWeeks, startOfWeek, endOfWeek, parse } from 'date-fns';
import { ScrollArea } from '@/components/ui/scroll-area';
import CalendarEventForm from './calendar/CalendarEventForm';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import SupabaseService, { EventData } from './services/SupabaseService';

// Define calendar event type
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  start: Date;
  end: Date;
  location?: string;
  created_by?: string;
  attendees?: string[];
  color?: string;
}

interface CalendarPanelProps {
  isAdminView: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView }) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eventDialogOpen, setEventDialogOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [viewMode, setViewMode] = useState('month'); // 'day', 'week', 'month', 'list'
  const [viewDate, setViewDate] = useState(new Date());
  const { user } = useAuth();
  
  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, [viewDate, viewMode]);
  
  const fetchEvents = async () => {
    if (!user) {
      setEvents([]);
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Calculate date range based on view mode
      let startDate, endDate;
      
      if (viewMode === 'day') {
        startDate = viewDate;
        endDate = viewDate;
      } else if (viewMode === 'week') {
        startDate = startOfWeek(viewDate);
        endDate = endOfWeek(viewDate);
      } else if (viewMode === 'month') {
        startDate = startOfMonth(viewDate);
        endDate = endOfMonth(viewDate);
      } else {
        // List view - fetch events for the next 30 days
        startDate = viewDate;
        endDate = addDays(viewDate, 30);
      }
      
      const eventData = await SupabaseService.getEvents({
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString()
      });
      
      // Convert to CalendarEvent format
      const formattedEvents: CalendarEvent[] = eventData.map(event => ({
        id: event.id || '',
        title: event.title,
        description: event.description,
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        created_by: event.created_by,
        color: getRandomEventColor(event.title)
      }));
      
      setEvents(formattedEvents);
    } catch (error) {
      console.error("Error fetching events:", error);
      toast.error("Failed to fetch events");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCreateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!user) {
      toast.error("You must be logged in to create events");
      return;
    }
    
    try {
      // Convert to Supabase format
      const newEvent: EventData = {
        title: eventData.title || "Untitled Event",
        description: eventData.description,
        start_time: eventData.start || new Date(),
        end_time: eventData.end || new Date(),
        created_by: user.id
      };
      
      await SupabaseService.createEvent(newEvent);
      
      // Refresh events
      await fetchEvents();
      
      toast.success("Event created successfully");
      setEventDialogOpen(false);
    } catch (error) {
      console.error("Error creating event:", error);
      toast.error("Failed to create event");
    }
  };
  
  const handleUpdateEvent = async (eventData: Partial<CalendarEvent>) => {
    if (!selectedEvent?.id || !user) return;
    
    try {
      // Convert to Supabase format
      const updatedEvent: Partial<EventData> = {
        title: eventData.title,
        description: eventData.description,
        start_time: eventData.start,
        end_time: eventData.end
      };
      
      await SupabaseService.updateEvent(selectedEvent.id, updatedEvent);
      
      // Refresh events
      await fetchEvents();
      
      toast.success("Event updated successfully");
      setEventDialogOpen(false);
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Failed to update event");
    }
  };
  
  const handleDeleteEvent = async () => {
    if (!selectedEvent?.id || !user) return;
    
    try {
      await SupabaseService.deleteEvent(selectedEvent.id);
      
      // Refresh events
      await fetchEvents();
      
      toast.success("Event deleted successfully");
      setEventDialogOpen(false);
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Failed to delete event");
    }
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventDialogOpen(true);
  };
  
  const handleNewEvent = () => {
    // Create a default event starting at the current selected date
    const defaultStart = selectedDate || new Date();
    const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000); // 1 hour later
    
    setSelectedEvent({
      id: '',
      title: '',
      description: '',
      start: defaultStart,
      end: defaultEnd
    });
    
    setEventDialogOpen(true);
  };
  
  const handleDialogClose = () => {
    setEventDialogOpen(false);
    setSelectedEvent(null);
  };
  
  const handlePrevious = () => {
    if (viewMode === 'day') {
      setViewDate(subDays(viewDate, 1));
    } else if (viewMode === 'week') {
      setViewDate(subWeeks(viewDate, 1));
    } else {
      setViewDate(subMonths(viewDate, 1));
    }
  };
  
  const handleNext = () => {
    if (viewMode === 'day') {
      setViewDate(addDays(viewDate, 1));
    } else if (viewMode === 'week') {
      setViewDate(addWeeks(viewDate, 1));
    } else {
      setViewDate(addMonths(viewDate, 1));
    }
  };
  
  const handleToday = () => {
    setViewDate(new Date());
  };
  
  // Utility function to generate a random color for events based on title
  const getRandomEventColor = (title: string) => {
    const colors = [
      'bg-blue-500 text-white',
      'bg-green-500 text-white',
      'bg-purple-500 text-white',
      'bg-yellow-500 text-black',
      'bg-pink-500 text-white',
      'bg-indigo-500 text-white',
      'bg-red-500 text-white',
      'bg-orange-500 text-black'
    ];
    
    const index = title.charCodeAt(0) % colors.length;
    return colors[index] || colors[0];
  };
  
  // Get the events for the selected date view
  const filteredEvents = useMemo(() => {
    if (!selectedDate) return [];
    
    if (viewMode === 'day') {
      return events.filter(event => {
        return isSameDay(event.start, selectedDate);
      });
    }
    
    return events;
  }, [events, selectedDate, viewMode]);
  
  // Get view title based on current view mode
  const viewTitle = useMemo(() => {
    if (viewMode === 'day') {
      return format(viewDate, 'MMMM d, yyyy');
    } else if (viewMode === 'week') {
      const start = startOfWeek(viewDate);
      const end = endOfWeek(viewDate);
      const startMonth = format(start, 'MMM');
      const endMonth = format(end, 'MMM');
      const startDay = format(start, 'd');
      const endDay = format(end, 'd');
      const year = format(viewDate, 'yyyy');
      
      if (startMonth === endMonth) {
        return `${startMonth} ${startDay}-${endDay}, ${year}`;
      } else {
        return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
      }
    } else if (viewMode === 'month') {
      return format(viewDate, 'MMMM yyyy');
    } else {
      // List view
      return 'Upcoming Events';
    }
  }, [viewDate, viewMode]);
  
  // Generate calendar days for the current month
  const calendarDays = useMemo(() => {
    if (viewMode !== 'month') return [];
    
    const startDate = startOfMonth(viewDate);
    const endDate = endOfMonth(viewDate);
    const days = [];
    
    let currentDate = startOfWeek(startDate);
    while (currentDate <= endOfWeek(endDate)) {
      days.push(currentDate);
      currentDate = addDays(currentDate, 1);
    }
    
    return days;
  }, [viewDate, viewMode]);
  
  // Generate calendar hours for day view
  const calendarHours = useMemo(() => {
    const hours = [];
    for (let i = 0; i < 24; i++) {
      hours.push(i);
    }
    return hours;
  }, []);
  
  // Generate week days for week view
  const weekDays = useMemo(() => {
    if (viewMode !== 'week') return [];
    
    const startDate = startOfWeek(viewDate);
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      days.push(addDays(startDate, i));
    }
    
    return days;
  }, [viewDate, viewMode]);
  
  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-800 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <CalendarIcon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
            <h2 className="text-xl font-semibold">{viewTitle}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={handleToday}>
              Today
            </Button>
            <Button variant="outline" size="icon" onClick={handlePrevious}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" onClick={handleNext}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <Tabs value={viewMode} onValueChange={setViewMode} className="w-full max-w-md">
            <TabsList>
              <TabsTrigger value="day" className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span className="hidden sm:inline">Day</span>
              </TabsTrigger>
              <TabsTrigger value="week" className="flex items-center gap-1">
                <LayoutGrid className="h-4 w-4" />
                <span className="hidden sm:inline">Week</span>
              </TabsTrigger>
              <TabsTrigger value="month" className="flex items-center gap-1">
                <CalendarIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Month</span>
              </TabsTrigger>
              <TabsTrigger value="list" className="flex items-center gap-1">
                <List className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {isAdminView && (
            <Button 
              size="sm"
              onClick={handleNewEvent}
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Event
            </Button>
          )}
        </div>
      </div>
      
      {/* Calendar Body */}
      <div className="flex-grow overflow-auto">
        {isLoading ? (
          <div className="h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            {/* Day View */}
            {viewMode === 'day' && (
              <div className="grid grid-cols-1 h-full">
                <div className="h-full overflow-y-auto">
                  <div className="relative min-h-full" style={{ minHeight: 'calc(24 * 3rem)' }}>
                    {calendarHours.map((hour) => (
                      <div
                        key={hour}
                        className="border-t border-gray-200 dark:border-gray-800 h-12 relative"
                      >
                        <div className="absolute -top-2.5 left-2 text-xs text-gray-500 dark:text-gray-400">
                          {hour === 0 ? '12 AM' : hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                        </div>
                      </div>
                    ))}
                    
                    {/* Day Events */}
                    {events
                      .filter(event => isSameDay(event.start, viewDate))
                      .map((event) => {
                        const startHour = event.start.getHours() + (event.start.getMinutes() / 60);
                        const endHour = event.end.getHours() + (event.end.getMinutes() / 60);
                        const duration = endHour - startHour;
                        const top = `${startHour * 3}rem`;
                        const height = `${duration * 3}rem`;
                        
                        return (
                          <div
                            key={event.id}
                            className={`absolute left-14 right-2 rounded-md ${event.color} border border-white/10 shadow-sm p-2 cursor-pointer hover:opacity-90 transition-opacity overflow-hidden text-ellipsis`}
                            style={{ top, height, minHeight: '2rem' }}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="font-semibold text-sm truncate">
                              {event.title}
                            </div>
                            <div className="text-xs opacity-90 truncate">
                              {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Week View */}
            {viewMode === 'week' && (
              <div className="grid grid-cols-7 h-full divide-x divide-gray-200 dark:divide-gray-800">
                {weekDays.map((day, index) => (
                  <div key={index} className="h-full overflow-hidden flex flex-col">
                    {/* Day Header */}
                    <div className={`p-2 text-center border-b border-gray-200 dark:border-gray-800 ${
                      isSameDay(day, new Date()) ? 'bg-primary/10' : ''
                    }`}>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(day, 'EEE')}
                      </div>
                      <div className={`text-lg ${
                        isSameDay(day, new Date()) ? 'font-bold text-primary' : ''
                      }`}>
                        {format(day, 'd')}
                      </div>
                    </div>
                    
                    {/* Day Events */}
                    <div className="flex-1 overflow-y-auto">
                      <div className="p-1 space-y-1">
                        {events
                          .filter(event => isSameDay(event.start, day))
                          .map((event) => (
                            <div 
                              key={event.id} 
                              className={`${event.color} rounded-md p-1.5 cursor-pointer hover:opacity-90 transition-opacity`}
                              onClick={() => handleEventClick(event)}
                            >
                              <div className="font-semibold text-xs truncate">
                                {event.title}
                              </div>
                              <div className="text-xs opacity-90 truncate">
                                {format(event.start, 'h:mm a')}
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {/* Month View */}
            {viewMode === 'month' && (
              <div className="grid grid-cols-7 auto-rows-fr h-full divide-x divide-y divide-gray-200 dark:divide-gray-800">
                {/* Week day headers */}
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="p-2 text-center font-semibold text-sm text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-gray-800">
                    {day}
                  </div>
                ))}
                
                {/* Calendar days */}
                {calendarDays.map((day, i) => {
                  const isCurrentMonth = day.getMonth() === viewDate.getMonth();
                  const isToday = isSameDay(day, new Date());
                  const isSelected = selectedDate && isSameDay(day, selectedDate);
                  
                  const dayEvents = events.filter(event => isSameDay(event.start, day));
                  
                  return (
                    <div
                      key={i}
                      className={`p-1 overflow-hidden flex flex-col ${
                        isCurrentMonth ? 'bg-white/80 dark:bg-gray-900/80' : 'bg-gray-50/80 dark:bg-gray-800/80'
                      } ${isToday ? 'border border-primary' : ''}`}
                      onClick={() => setSelectedDate(day)}
                    >
                      <div className={`text-right p-1 ${
                        isCurrentMonth ? 'text-gray-900 dark:text-gray-200' : 'text-gray-400 dark:text-gray-600'
                      } ${isSelected ? 'font-bold text-primary' : ''} ${isToday ? 'font-bold' : ''}`}>
                        {format(day, 'd')}
                      </div>
                      
                      {/* Day events - limit to 3 visible */}
                      <div className="flex-1 overflow-hidden">
                        {dayEvents.slice(0, 3).map((event) => (
                          <div 
                            key={event.id} 
                            className={`${event.color} rounded text-xs p-1 mb-1 cursor-pointer truncate hover:opacity-90 transition-opacity`}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEventClick(event);
                            }}
                          >
                            {event.title}
                          </div>
                        ))}
                        
                        {dayEvents.length > 3 && (
                          <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                            +{dayEvents.length - 3} more
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            
            {/* List View */}
            {viewMode === 'list' && (
              <ScrollArea className="h-full p-4">
                {events.length === 0 ? (
                  <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                    No upcoming events
                  </div>
                ) : (
                  <div className="space-y-4">
                    {events.map((event) => (
                      <Card 
                        key={event.id} 
                        className="overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                        onClick={() => handleEventClick(event)}
                      >
                        <div className={`h-1 w-full ${event.color.split(' ')[0]}`} />
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start gap-4">
                            <div className="space-y-1">
                              <h3 className="font-semibold">{event.title}</h3>
                              <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
                                <CalendarIcon className="h-3.5 w-3.5" />
                                <span>
                                  {format(event.start, 'EEE, MMM d')} · {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                                </span>
                              </div>
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                                  {event.description}
                                </p>
                              )}
                              
                              <div className="flex items-center gap-3 mt-3">
                                <Badge variant="outline" className="flex items-center gap-1">
                                  <User size={12} />
                                  <span>Creator</span>
                                </Badge>
                              </div>
                            </div>
                            
                            <Avatar className="h-10 w-10">
                              <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${event.title}`} />
                              <AvatarFallback>{event.title.charAt(0)}</AvatarFallback>
                            </Avatar>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            )}
          </>
        )}
      </div>
      
      {/* Event Dialog */}
      <Dialog open={eventDialogOpen} onOpenChange={setEventDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent?.id ? 'Edit Event' : 'New Event'}</DialogTitle>
          </DialogHeader>
          
          {selectedEvent && (
            <CalendarEventForm 
              event={selectedEvent} 
              onSubmit={selectedEvent.id ? handleUpdateEvent : handleCreateEvent}
              onCancel={handleDialogClose}
              onDelete={handleDeleteEvent}
              isReadOnly={!isAdminView && selectedEvent.id !== ''} 
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
