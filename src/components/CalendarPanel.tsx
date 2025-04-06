
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from "@/types/workspace";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, isSameDay } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Filter,
  Clock,
  Calendar as CalendarIcon,
  Users
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getEventTypeColor, getCalendarCells, addEventsToCalendar, filterEvents } from "@/utils/calendarUtils";
import CalendarEventForm from "@/components/calendar/CalendarEventForm";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const mockEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Team Meeting",
    date: new Date(2025, 3, 8),
    startTime: "10:00",
    endTime: "11:30",
    type: "meeting",
    description: "Weekly team sync meeting",
    priority: "medium",
    attendees: [
      { id: "1", name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You" },
      { id: "2", name: "Alex", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" }
    ],
    reminder: {
      time: "15 minutes before",
      type: "notification"
    }
  },
  {
    id: "2",
    title: "Project Deadline",
    date: new Date(2025, 3, 15),
    type: "deadline",
    description: "Submit project documentation",
    priority: "high",
    attendees: [
      { id: "1", name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You" }
    ],
    reminder: {
      time: "1 day before",
      type: "email"
    }
  },
  {
    id: "3",
    title: "Client Call",
    date: new Date(2025, 3, 10),
    startTime: "14:00",
    endTime: "15:00",
    type: "meeting",
    description: "Call with client to discuss requirements",
    priority: "high",
    location: "Zoom",
    attendees: [
      { id: "1", name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You" },
      { id: "3", name: "Sarah", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" }
    ],
    reminder: {
      time: "30 minutes before",
      type: "notification"
    }
  }
];

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel = ({ isAdminView = false }: CalendarPanelProps) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "day" | "list" | "timeline">("month");
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | undefined>(undefined);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilters, setTypeFilters] = useState({
    meeting: true,
    task: true,
    reminder: true,
    event: true,
    webinar: true,
    deadline: true,
  });
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const { user } = useAuth();
  
  useEffect(() => {
    if (user) {
      fetchEvents();
    }
  }, [user]);
  
  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*');
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const formattedEvents: CalendarEvent[] = data.map((event: any) => ({
          id: event.id,
          title: event.title,
          date: new Date(event.start_time),
          startTime: format(new Date(event.start_time), 'HH:mm'),
          endTime: format(new Date(event.end_time), 'HH:mm'),
          type: 'event',
          description: event.description,
          priority: 'medium',
          attendees: []
        }));
        
        setEvents([...mockEvents, ...formattedEvents]);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };
  
  // Get calendar cells for current view
  const calendarCells = addEventsToCalendar(
    getCalendarCells(currentDate),
    filterEvents(events, currentDate, typeFilters, searchTerm)
  );
  
  const filteredEvents = filterEvents(events, currentDate, typeFilters, searchTerm);
  
  const handleDateNavigationPrev = () => {
    switch(calendarView) {
      case 'month':
        setCurrentDate(subMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };
  
  const handleDateNavigationNext = () => {
    switch(calendarView) {
      case 'month':
        setCurrentDate(addMonths(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsAddEventOpen(true);
  };
  
  const handleAddEventClick = () => {
    if (!isAdminView) {
      toast("Only admins can add events", {
        description: "Please contact an administrator to add events to the calendar."
      });
      return;
    }
    
    setSelectedEvent(undefined);
    setIsAddEventOpen(true);
  };
  
  const handleSaveEvent = async (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      // Update existing event
      try {
        if (isAdminView) {
          const { data, error } = await supabase
            .from('events')
            .update({
              title: eventData.title,
              description: eventData.description,
              start_time: eventData.date?.toISOString(),
              end_time: eventData.date?.toISOString()
            })
            .eq('id', selectedEvent.id);
            
          if (error) throw error;
          
          toast.success("Event updated successfully");
        }
        
        setEvents(events.map(event => 
          event.id === selectedEvent.id 
            ? { ...event, ...eventData, id: event.id } 
            : event
        ));
      } catch (error) {
        console.error('Error updating event:', error);
        toast.error("Failed to update event");
      }
    } else {
      // Add new event
      try {
        if (isAdminView) {
          const { data, error } = await supabase
            .from('events')
            .insert({
              title: eventData.title,
              description: eventData.description,
              start_time: eventData.date?.toISOString(),
              end_time: eventData.date?.toISOString(),
              created_by: user?.id
            });
            
          if (error) throw error;
          
          toast.success("Event added successfully");
        }
        
        const newEvent: CalendarEvent = {
          id: `event-${Date.now()}`,
          ...eventData as CalendarEvent,
        };
        setEvents([...events, newEvent]);
      } catch (error) {
        console.error('Error adding event:', error);
        toast.error("Failed to add event");
      }
    }
    setIsAddEventOpen(false);
  };
  
  const handleDeleteEvent = async () => {
    if (selectedEvent && isAdminView) {
      try {
        const { error } = await supabase
          .from('events')
          .delete()
          .eq('id', selectedEvent.id);
          
        if (error) throw error;
        
        toast.success("Event deleted successfully");
        setEvents(events.filter(event => event.id !== selectedEvent.id));
        setIsAddEventOpen(false);
      } catch (error) {
        console.error('Error deleting event:', error);
        toast.error("Failed to delete event");
      }
    }
  };
  
  const handleTypeFilterChange = (type: string, checked: boolean) => {
    setTypeFilters({
      ...typeFilters,
      [type]: checked,
    });
  };
  
  const renderTimelineView = () => {
    // Get hours from 6 AM to 10 PM
    const hours = Array.from({ length: 17 }, (_, i) => i + 6);
    
    // Filter events for the current day
    const dayEvents = events.filter(event => 
      isSameDay(new Date(event.date), currentDate)
    );
    
    return (
      <div className="p-4 h-full">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={handleDateNavigationPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-lg font-medium">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleDateNavigationNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex h-[calc(100%-60px)]">
          <div className="w-20 flex-shrink-0 border-r pr-2">
            {hours.map(hour => (
              <div key={hour} className="h-20 text-sm text-right text-muted-foreground">
                {hour % 12 === 0 ? 12 : hour % 12}{hour < 12 ? 'am' : 'pm'}
              </div>
            ))}
          </div>
          
          <div className="flex-1 relative">
            {hours.map(hour => (
              <div key={hour} className="h-20 border-b border-dashed relative">
                <div className="absolute left-0 right-0 top-0 h-px bg-gray-200 dark:bg-gray-800"></div>
              </div>
            ))}
            
            {dayEvents.map((event, i) => {
              const eventTime = new Date(event.date);
              const hours = eventTime.getHours();
              const minutes = eventTime.getMinutes();
              
              const startPercentage = (((hours - 6) * 60) + minutes) / (17 * 60) * 100;
              
              // Calculate height based on event duration
              let height = 60; // Default height
              if (event.startTime && event.endTime) {
                const [startHour, startMinute] = event.startTime.split(':').map(Number);
                const [endHour, endMinute] = event.endTime.split(':').map(Number);
                const durationMinutes = ((endHour * 60) + endMinute) - ((startHour * 60) + startMinute);
                height = (durationMinutes / 30) * 20;
              }
              
              return (
                <div 
                  key={event.id}
                  className={cn(
                    "absolute left-2 right-2 rounded-md p-2 overflow-hidden cursor-pointer",
                    getEventTypeColor(event.type)
                  )}
                  style={{
                    top: `${startPercentage}%`,
                    height: `${Math.max(height, 40)}px`
                  }}
                  onClick={() => handleEventClick(event)}
                >
                  <div className="font-medium text-sm">{event.title}</div>
                  <div className="text-xs opacity-90">
                    {event.startTime} {event.endTime && `- ${event.endTime}`}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };
  
  const renderDayView = () => {
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={handleDateNavigationPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-lg font-medium">
            {format(currentDate, "EEEE, MMMM d, yyyy")}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleDateNavigationNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="space-y-4">
          {events
            .filter(event => isSameDay(new Date(event.date), currentDate))
            .sort((a, b) => {
              const aTime = a.startTime ? a.startTime : "00:00";
              const bTime = b.startTime ? b.startTime : "00:00";
              return aTime.localeCompare(bTime);
            })
            .map((event) => (
              <div 
                key={event.id}
                className="flex p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={() => handleEventClick(event)}
              >
                <div className={cn(
                  "w-1 rounded mr-3 self-stretch",
                  getEventTypeColor(event.type)
                )}></div>
                
                <div className="flex-1">
                  <div className="font-medium">{event.title}</div>
                  <div className="text-sm text-muted-foreground flex items-center mt-1">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {event.startTime} {event.endTime && `- ${event.endTime}`}
                  </div>
                  {event.description && (
                    <div className="text-sm mt-2">{event.description}</div>
                  )}
                </div>
                
                <div className={cn(
                  "text-xs px-2 py-1 rounded-full h-fit",
                  event.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                  event.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                  "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                )}>
                  {event.priority}
                </div>
              </div>
            ))}
            
            {events.filter(event => isSameDay(new Date(event.date), currentDate)).length === 0 && (
              <div className="text-center text-muted-foreground py-8">
                No events scheduled for this day
              </div>
            )}
        </div>
      </div>
    );
  };
  
  const renderWeekView = () => {
    // Get the start of the week (Sunday)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());
    
    // Create array for days of the week
    const weekDays = Array.from({ length: 7 }, (_, i) => {
      const day = new Date(startOfWeek);
      day.setDate(startOfWeek.getDate() + i);
      return day;
    });
    
    return (
      <div className="p-4">
        <div className="flex justify-between items-center mb-4">
          <Button variant="outline" size="sm" onClick={handleDateNavigationPrev}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="text-lg font-medium">
            {format(weekDays[0], "MMM d")} - {format(weekDays[6], "MMM d, yyyy")}
          </div>
          
          <Button variant="outline" size="sm" onClick={handleDateNavigationNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day, i) => (
            <div key={i} className="text-center font-medium text-sm py-2">
              <div>{format(day, "EEE")}</div>
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center mx-auto mt-1",
                isSameDay(day, new Date()) && "bg-primary text-primary-foreground"
              )}>
                {format(day, "d")}
              </div>
            </div>
          ))}
          
          {weekDays.map((day, i) => (
            <div 
              key={`events-${i}`}
              className="min-h-[120px] p-1 border rounded-md overflow-y-auto"
            >
              <div className="space-y-1">
                {events
                  .filter(event => isSameDay(new Date(event.date), day))
                  .slice(0, 3)
                  .map(event => (
                    <div 
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded truncate cursor-pointer",
                        getEventTypeColor(event.type)
                      )}
                      onClick={() => handleEventClick(event)}
                    >
                      {event.title}
                    </div>
                  ))}
                  
                {events.filter(event => isSameDay(new Date(event.date), day)).length > 3 && (
                  <div className="text-xs text-center text-muted-foreground">
                    +{events.filter(event => isSameDay(new Date(event.date), day)).length - 3} more
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  return (
    <div className="h-full flex flex-col bg-background overflow-hidden">
      <div className="flex justify-between items-center p-4 border-b">
        <div className="text-2xl font-semibold">Calendar</div>
        
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Input
              placeholder="Search events..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-[200px]"
            />
          </div>
          
          <Button 
            variant="outline" 
            size="icon"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="h-4 w-4" />
          </Button>
          
          {isAdminView && (
            <Button onClick={handleAddEventClick}>
              <Plus className="h-4 w-4 mr-2" />
              Add Event
            </Button>
          )}
          
          {!isAdminView && (
            <Badge variant="outline" className="flex items-center">
              <Users size={14} className="mr-2" />
              Community View
            </Badge>
          )}
        </div>
      </div>
      
      {isFilterOpen && (
        <div className="p-4 border-b">
          <div className="text-sm font-medium mb-2">Filter by type:</div>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-meeting" 
                checked={typeFilters.meeting} 
                onCheckedChange={(checked) => handleTypeFilterChange("meeting", !!checked)} 
              />
              <label htmlFor="filter-meeting" className="text-sm cursor-pointer">Meetings</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-task" 
                checked={typeFilters.task} 
                onCheckedChange={(checked) => handleTypeFilterChange("task", !!checked)} 
              />
              <label htmlFor="filter-task" className="text-sm cursor-pointer">Tasks</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-reminder" 
                checked={typeFilters.reminder} 
                onCheckedChange={(checked) => handleTypeFilterChange("reminder", !!checked)} 
              />
              <label htmlFor="filter-reminder" className="text-sm cursor-pointer">Reminders</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-event" 
                checked={typeFilters.event} 
                onCheckedChange={(checked) => handleTypeFilterChange("event", !!checked)} 
              />
              <label htmlFor="filter-event" className="text-sm cursor-pointer">Events</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-webinar" 
                checked={typeFilters.webinar} 
                onCheckedChange={(checked) => handleTypeFilterChange("webinar", !!checked)} 
              />
              <label htmlFor="filter-webinar" className="text-sm cursor-pointer">Webinars</label>
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="filter-deadline" 
                checked={typeFilters.deadline} 
                onCheckedChange={(checked) => handleTypeFilterChange("deadline", !!checked)} 
              />
              <label htmlFor="filter-deadline" className="text-sm cursor-pointer">Deadlines</label>
            </div>
          </div>
        </div>
      )}
      
      <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as "month" | "week" | "day" | "list" | "timeline")} className="flex-1 overflow-hidden">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="day">Day</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="month" className="flex-1 overflow-auto mt-2">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={handleDateNavigationPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-lg font-medium">
                {format(currentDate, "MMMM yyyy")}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleDateNavigationNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center font-medium text-sm py-2">
                  {day}
                </div>
              ))}
              
              {calendarCells.map((cell, i) => (
                <div 
                  key={i}
                  className={cn(
                    "min-h-[100px] p-1 border rounded-md",
                    cell.isCurrentMonth ? "bg-background" : "bg-muted/30",
                    cell.isToday && "border-primary"
                  )}
                >
                  <div className={cn(
                    "text-right text-xs font-medium p-1",
                    cell.isToday && "bg-primary text-primary-foreground rounded-md"
                  )}>
                    {cell.dayOfMonth}
                  </div>
                  
                  <div className="space-y-1 mt-1">
                    {cell.events.slice(0, 3).map((event) => (
                      <div 
                        key={event.id}
                        className={cn(
                          "text-xs p-1 rounded truncate cursor-pointer",
                          getEventTypeColor(event.type)
                        )}
                        onClick={() => handleEventClick(event)}
                      >
                        {event.title}
                      </div>
                    ))}
                    
                    {cell.events.length > 3 && (
                      <div className="text-xs text-center text-muted-foreground">
                        +{cell.events.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        
        <TabsContent value="week" className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            {renderWeekView()}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="day" className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            {renderDayView()}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="timeline" className="flex-1 overflow-auto">
          <ScrollArea className="h-full">
            {renderTimelineView()}
          </ScrollArea>
        </TabsContent>
        
        <TabsContent value="list" className="flex-1 overflow-auto">
          <div className="p-4 space-y-4">
            {filteredEvents.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                No events found for the selected filters
              </div>
            ) : (
              filteredEvents.map((event) => (
                <div 
                  key={event.id}
                  className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => handleEventClick(event)}
                >
                  <div className={cn(
                    "w-2 h-full rounded mr-3",
                    getEventTypeColor(event.type)
                  )}></div>
                  
                  <div className="flex-1">
                    <div className="font-medium">{event.title}</div>
                    <div className="text-sm text-muted-foreground">
                      {format(
                        event.date instanceof Date ? event.date : new Date(event.date),
                        "MMM d, yyyy"
                      )}
                      {event.startTime && ` · ${event.startTime}`}
                      {event.endTime && ` - ${event.endTime}`}
                    </div>
                    <div className="text-sm mt-1">{event.description}</div>
                  </div>
                  
                  <div className={cn(
                    "text-xs px-2 py-1 rounded-full",
                    event.priority === "high" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300" :
                    event.priority === "medium" ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300" :
                    "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                  )}>
                    {event.priority}
                  </div>
                </div>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <CalendarEventForm 
            event={selectedEvent}
            onSubmit={handleSaveEvent}
            onCancel={() => setIsAddEventOpen(false)}
            onDelete={isAdminView ? handleDeleteEvent : undefined}
            isReadOnly={!isAdminView}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
