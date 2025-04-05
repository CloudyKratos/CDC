
import React, { useState, useEffect } from 'react';
import { CalendarEvent } from "@/types/workspace";
import { Calendar } from "@/components/ui/calendar";
import { format, addMonths, subMonths } from "date-fns";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronLeft, ChevronRight, Plus, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEventTypeColor, getCalendarCells, addEventsToCalendar, filterEvents } from "@/utils/calendarUtils";
import CalendarEventForm from "@/components/calendar/CalendarEventForm";

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

const CalendarPanel = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>(mockEvents);
  const [calendarView, setCalendarView] = useState<"month" | "week" | "list">("month");
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
  
  // Get calendar cells for current month
  const calendarCells = addEventsToCalendar(
    getCalendarCells(currentDate),
    filterEvents(events, currentDate, typeFilters, searchTerm)
  );
  
  const filteredEvents = filterEvents(events, currentDate, typeFilters, searchTerm);
  
  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
  };
  
  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
  };
  
  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsAddEventOpen(true);
  };
  
  const handleAddEventClick = () => {
    setSelectedEvent(undefined);
    setIsAddEventOpen(true);
  };
  
  const handleSaveEvent = (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      // Update existing event
      setEvents(events.map(event => 
        event.id === selectedEvent.id 
          ? { ...event, ...eventData, id: event.id } 
          : event
      ));
    } else {
      // Add new event
      const newEvent: CalendarEvent = {
        id: `event-${Date.now()}`,
        ...eventData as CalendarEvent,
      };
      setEvents([...events, newEvent]);
    }
    setIsAddEventOpen(false);
  };
  
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      setEvents(events.filter(event => event.id !== selectedEvent.id));
      setIsAddEventOpen(false);
    }
  };
  
  const handleTypeFilterChange = (type: string, checked: boolean) => {
    setTypeFilters({
      ...typeFilters,
      [type]: checked,
    });
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
          
          <Button onClick={handleAddEventClick}>
            <Plus className="h-4 w-4 mr-2" />
            Add Event
          </Button>
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
      
      <Tabs value={calendarView} onValueChange={(v) => setCalendarView(v as "month" | "week" | "list")} className="flex-1 overflow-hidden">
        <TabsList className="mx-4 mt-2">
          <TabsTrigger value="month">Month</TabsTrigger>
          <TabsTrigger value="week">Week</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        
        <TabsContent value="month" className="flex-1 overflow-auto mt-2">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <Button variant="outline" size="sm" onClick={handlePrevMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <div className="text-lg font-medium">
                {format(currentDate, "MMMM yyyy")}
              </div>
              
              <Button variant="outline" size="sm" onClick={handleNextMonth}>
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
          <div className="p-4">
            <div className="text-center text-muted-foreground">
              Week view coming soon
            </div>
          </div>
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
            onDelete={handleDeleteEvent}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
