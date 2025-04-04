import React, { useState, useEffect } from 'react';
import { format, startOfWeek, endOfWeek, addDays, addMonths, subMonths, parseISO, isToday, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarIcon, ChevronLeft, ChevronRight, Plus, Search, Filter, Users, MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { 
  CalendarEvent, 
  getCalendarCells, 
  addEventsToCalendar, 
  filterEvents, 
  groupEventsByDate,
  getEventTypeColor 
} from '@/utils/calendarUtils';
import CalendarEventForm from './calendar/CalendarEventForm';
import { toast } from 'sonner';

const CalendarPanel: React.FC = () => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'timeline'>('month');
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [calendarCells, setCalendarCells] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [filters, setFilters] = useState({
    meeting: true,
    task: true,
    reminder: true,
    event: true,
    webinar: true,
    deadline: true
  });
  const [filterMenuOpen, setFilterMenuOpen] = useState<boolean>(false);
  const [createEventOpen, setCreateEventOpen] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [eventDetailOpen, setEventDetailOpen] = useState<boolean>(false);
  
  useEffect(() => {
    const mockEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Team Meeting',
        date: new Date(),
        type: 'meeting',
        description: 'Weekly team meeting to discuss project progress',
        startTime: '09:00',
        endTime: '10:30',
        location: 'Conference Room A',
        attendees: [
          { id: '1', name: 'John Doe', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John' },
          { id: '2', name: 'Jane Smith', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane' },
          { id: '3', name: 'Alex Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' }
        ]
      },
      {
        id: '2',
        title: 'Entrepreneurship Workshop',
        date: addDays(new Date(), 2),
        type: 'webinar',
        description: 'A workshop on startup funding strategies',
        startTime: '13:00',
        endTime: '15:00',
        location: 'Online',
        url: 'https://zoom.us/j/123456789'
      },
      {
        id: '3',
        title: 'Investor Pitch Deadline',
        date: addDays(new Date(), 5),
        type: 'deadline',
        description: 'Submit final pitch deck for investor meeting',
        priority: 'high'
      },
      {
        id: '4',
        title: 'Product Launch',
        date: addDays(new Date(), 7),
        type: 'event',
        description: 'Official launch of our new product line',
        startTime: '10:00',
        endTime: '14:00',
        location: 'Main Auditorium'
      },
      {
        id: '5',
        title: 'Competitor Analysis',
        date: addDays(new Date(), -1),
        type: 'task',
        description: 'Complete the quarterly competitor analysis report',
        priority: 'medium'
      },
      {
        id: '6',
        title: 'Marketing Campaign Review',
        date: addDays(new Date(), 3),
        type: 'meeting',
        description: 'Review the performance of our recent marketing campaigns',
        startTime: '11:00',
        endTime: '12:00',
        location: 'Marketing Department'
      },
      {
        id: '7',
        title: 'Submit Tax Documents',
        date: addDays(new Date(), 10),
        type: 'reminder',
        description: 'Deadline for quarterly tax filing',
        priority: 'high'
      }
    ];
    
    setEvents(mockEvents);
  }, []);
  
  useEffect(() => {
    const cells = getCalendarCells(currentDate);
    const filtered = filterEvents(events, currentDate, filters, searchTerm);
    const cellsWithEvents = addEventsToCalendar(cells, filtered);
    
    setCalendarCells(cellsWithEvents);
    setFilteredEvents(filtered);
  }, [currentDate, events, filters, searchTerm]);
  
  const handleFilterChange = (type: string) => {
    setFilters({
      ...filters,
      [type]: !filters[type as keyof typeof filters]
    });
  };
  
  const handleEventSubmit = (eventData: Partial<CalendarEvent>) => {
    if (selectedEvent) {
      const updatedEvents = events.map(event => 
        event.id === selectedEvent.id ? { ...event, ...eventData } : event
      );
      setEvents(updatedEvents);
      toast.success('Event updated successfully');
    } else {
      const newEvent: CalendarEvent = {
        id: `event-${events.length + 1}`,
        title: eventData.title || 'Untitled Event',
        date: eventData.date instanceof Date ? eventData.date : new Date(),
        type: eventData.type || 'event',
        priority: eventData.priority || 'medium',
        attendees: eventData.attendees || [],
        ...eventData
      };
      
      setEvents([...events, newEvent]);
      toast.success('Event created successfully');
    }
    
    setCreateEventOpen(false);
    setSelectedEvent(null);
  };
  
  const handleDayClick = (day: any) => {
    setSelectedDate(day.date);
    
    if (day.events.length > 0) {
      if (day.events.length === 1) {
        setSelectedEvent(day.events[0]);
        setEventDetailOpen(true);
      }
    } else {
      setCreateEventOpen(true);
    }
  };
  
  const handleEventClick = (event: CalendarEvent, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedEvent(event);
    setEventDetailOpen(true);
  };
  
  const renderMonthView = () => {
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekdays.map(day => (
            <div key={day} className="text-center text-xs font-medium text-gray-500 dark:text-gray-400">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {calendarCells.map((day, index) => (
            <div
              key={index}
              className={cn(
                "min-h-[80px] p-1 border border-gray-100 dark:border-gray-700 rounded-md relative transition-all cursor-pointer",
                day.isCurrentMonth ? "bg-white dark:bg-gray-800" : "bg-gray-50 dark:bg-gray-900/50",
                day.isToday && "ring-2 ring-primary ring-inset",
                !day.isCurrentMonth && "opacity-50"
              )}
              onClick={() => handleDayClick(day)}
            >
              <div className={cn(
                "text-right text-xs font-medium", 
                day.isToday ? "text-primary" : ""
              )}>
                {day.dayOfMonth}
              </div>
              
              {day.events.length > 0 && (
                <div className="mt-1 space-y-1 max-h-[60px] overflow-y-auto">
                  {day.events.slice(0, 3).map((event: CalendarEvent) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-1 rounded-sm text-white truncate",
                        getEventTypeColor(event.type)
                      )}
                      onClick={(e) => handleEventClick(event, e)}
                    >
                      {event.startTime && `${event.startTime} `}{event.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                      +{day.events.length - 3} more
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const renderWeekView = () => {
    const startDay = startOfWeek(currentDate);
    const endDay = endOfWeek(currentDate);
    const days = [];
    
    for (let i = 0; i <= 6; i++) {
      const day = addDays(startDay, i);
      days.push(day);
    }
    
    const groupedEvents = groupEventsByDate(filteredEvents);
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            const dateKey = format(day, 'yyyy-MM-dd');
            const dayEvents = groupedEvents[dateKey] || [];
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={index}
                className={cn(
                  "min-h-[120px] p-2 border border-gray-100 dark:border-gray-700 rounded-md",
                  isCurrentDay && "ring-2 ring-primary ring-inset"
                )}
              >
                <div className="text-center mb-2">
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {format(day, 'EEE')}
                  </div>
                  <div className={cn(
                    "font-medium",
                    isCurrentDay ? "text-primary" : ""
                  )}>
                    {format(day, 'd')}
                  </div>
                </div>
                
                <div className="space-y-2 max-h-[300px] overflow-y-auto">
                  {dayEvents.map((event) => (
                    <div
                      key={event.id}
                      className={cn(
                        "text-xs p-2 rounded text-white",
                        getEventTypeColor(event.type)
                      )}
                      onClick={() => {
                        setSelectedEvent(event);
                        setEventDetailOpen(true);
                      }}
                    >
                      <div className="font-medium truncate">{event.title}</div>
                      {event.startTime && (
                        <div>{event.startTime} - {event.endTime || event.startTime}</div>
                      )}
                    </div>
                  ))}
                  
                  {dayEvents.length === 0 && (
                    <div 
                      className="text-xs text-center text-gray-400 p-2 border border-dashed border-gray-200 dark:border-gray-700 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50"
                      onClick={() => {
                        setSelectedDate(day);
                        setCreateEventOpen(true);
                      }}
                    >
                      + Add event
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };
  
  const renderTimelineView = () => {
    const groupedEvents = groupEventsByDate(filteredEvents);
    const sortedDates = Object.keys(groupedEvents).sort();
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-sm">
        <ScrollArea className="h-[70vh]">
          <div className="space-y-6 p-2">
            {sortedDates.map(dateKey => {
              const dayEvents = groupedEvents[dateKey];
              const date = parseISO(dateKey);
              const isCurrentDay = isToday(date);
              
              return (
                <div key={dateKey} className="space-y-2">
                  <div className={cn(
                    "sticky top-0 bg-white dark:bg-gray-800 z-10 py-2 font-medium flex items-center",
                    isCurrentDay ? "text-primary" : ""
                  )}>
                    {format(date, 'EEEE, MMMM d, yyyy')}
                    {isCurrentDay && (
                      <Badge variant="outline" className="ml-2 bg-primary/10 text-primary border-primary/20">
                        Today
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2 pl-4 border-l-2 border-gray-200 dark:border-gray-700">
                    {dayEvents
                      .sort((a, b) => {
                        if (!a.startTime) return 1;
                        if (!b.startTime) return -1;
                        return a.startTime.localeCompare(b.startTime);
                      })
                      .map(event => (
                        <div 
                          key={event.id}
                          className="relative before:absolute before:w-3 before:h-3 before:rounded-full before:bg-white dark:before:bg-gray-800 before:border-2 before:border-primary before:-left-[27px] before:top-1/2 before:-translate-y-1/2"
                        >
                          <Card 
                            className={cn(
                              "border-l-4",
                              event.type === 'meeting' && "border-l-blue-500",
                              event.type === 'task' && "border-l-purple-500",
                              event.type === 'reminder' && "border-l-yellow-500",
                              event.type === 'event' && "border-l-green-500",
                              event.type === 'webinar' && "border-l-indigo-500",
                              event.type === 'deadline' && "border-l-red-500"
                            )}
                            onClick={() => {
                              setSelectedEvent(event);
                              setEventDetailOpen(true);
                            }}
                          >
                            <CardHeader className="p-3 pb-1">
                              <div className="flex justify-between items-start">
                                <CardTitle className="text-base">{event.title}</CardTitle>
                                <Badge variant="outline" className={cn(
                                  event.type === 'meeting' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                                  event.type === 'task' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                                  event.type === 'reminder' && "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                                  event.type === 'event' && "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                                  event.type === 'webinar' && "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
                                  event.type === 'deadline' && "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                                )}>
                                  {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                                </Badge>
                              </div>
                            </CardHeader>
                            <CardContent className="p-3 pt-1">
                              {event.startTime && (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mb-2">
                                  <CalendarIcon className="w-4 h-4 mr-1" />
                                  {event.startTime} - {event.endTime || event.startTime}
                                </div>
                              )}
                              
                              {event.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                                  {event.description.length > 100 
                                    ? `${event.description.substring(0, 100)}...` 
                                    : event.description}
                                </p>
                              )}
                              
                              {event.location && (
                                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mb-2">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {event.location}
                                </div>
                              )}
                              
                              {event.attendees && event.attendees.length > 0 && (
                                <div className="flex items-center mt-2">
                                  <div className="flex -space-x-2 mr-2">
                                    {event.attendees.slice(0, 3).map((attendee, index) => (
                                      <Avatar key={index} className="h-6 w-6 border-2 border-white dark:border-gray-800">
                                        <AvatarImage src={attendee.avatar} />
                                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                    ))}
                                  </div>
                                  {event.attendees.length > 3 && (
                                    <span className="text-xs text-gray-500 dark:text-gray-400">
                                      +{event.attendees.length - 3} more
                                    </span>
                                  )}
                                </div>
                              )}
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                  </div>
                </div>
              );
            })}
            
            {sortedDates.length === 0 && (
              <div className="text-center py-10 text-gray-500 dark:text-gray-400">
                <CalendarIcon className="w-10 h-10 mx-auto mb-2 opacity-20" />
                <p>No events match your filters</p>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="mt-4"
                  onClick={() => {
                    setFilters({
                      meeting: true,
                      task: true,
                      reminder: true,
                      event: true,
                      webinar: true,
                      deadline: true
                    });
                    setSearchTerm('');
                  }}
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    );
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <CardTitle className="text-xl flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-primary" />
                <span className="bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                  Calendar
                </span>
              </CardTitle>
              <CardDescription>
                Manage your events, meetings, and deadlines
              </CardDescription>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              
              <div>
                <Button onClick={() => setCreateEventOpen(true)}>
                  <Plus className="mr-1 h-4 w-4" /> Add Event
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4">
            <div className="flex-1 flex flex-col sm:flex-row items-center gap-2">
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 ml-auto sm:ml-2">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    <span>Date</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={currentDate}
                    onSelect={(date) => date && setCurrentDate(date)}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500 dark:text-gray-400" />
                <Input
                  placeholder="Search events..."
                  className="pl-8 w-full max-w-[220px]"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <Popover open={filterMenuOpen} onOpenChange={setFilterMenuOpen}>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="icon"
                    className={cn(
                      "relative",
                      Object.values(filters).some(f => !f) && "bg-primary/20 text-primary border-primary/30" 
                    )}
                  >
                    <Filter className="h-4 w-4" />
                    {Object.values(filters).some(f => !f) && (
                      <span className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-primary"></span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-56">
                  <div className="space-y-2 p-1">
                    <h4 className="font-medium text-sm">Filter by type</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-meeting" 
                          checked={filters.meeting} 
                          onCheckedChange={() => handleFilterChange('meeting')}
                        />
                        <Label htmlFor="filter-meeting" className="text-sm">Meetings</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-task" 
                          checked={filters.task} 
                          onCheckedChange={() => handleFilterChange('task')}
                        />
                        <Label htmlFor="filter-task" className="text-sm">Tasks</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-reminder" 
                          checked={filters.reminder} 
                          onCheckedChange={() => handleFilterChange('reminder')}
                        />
                        <Label htmlFor="filter-reminder" className="text-sm">Reminders</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-event" 
                          checked={filters.event} 
                          onCheckedChange={() => handleFilterChange('event')}
                        />
                        <Label htmlFor="filter-event" className="text-sm">Events</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-webinar" 
                          checked={filters.webinar} 
                          onCheckedChange={() => handleFilterChange('webinar')}
                        />
                        <Label htmlFor="filter-webinar" className="text-sm">Webinars</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id="filter-deadline" 
                          checked={filters.deadline} 
                          onCheckedChange={() => handleFilterChange('deadline')}
                        />
                        <Label htmlFor="filter-deadline" className="text-sm">Deadlines</Label>
                      </div>
                    </div>
                    
                    <div className="pt-2 flex justify-between">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                          setFilters({
                            meeting: true,
                            task: true,
                            reminder: true,
                            event: true,
                            webinar: true,
                            deadline: true
                          });
                        }}
                      >
                        Reset All
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setFilterMenuOpen(false)}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          <div className="border-t border-gray-200 dark:border-gray-800">
            <Tabs 
              defaultValue="month" 
              value={calendarView} 
              onValueChange={(value) => setCalendarView(value as 'month' | 'week' | 'timeline')}
              className="p-4"
            >
              <TabsList className="grid w-full max-w-[360px] grid-cols-3 mb-4">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="timeline">Schedule</TabsTrigger>
              </TabsList>
              
              <TabsContent value="month" className="mt-0">
                {renderMonthView()}
              </TabsContent>
              
              <TabsContent value="week" className="mt-0">
                {renderWeekView()}
              </TabsContent>
              
              <TabsContent value="timeline" className="mt-0">
                {renderTimelineView()}
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
      </Card>
      
      <Dialog open={createEventOpen} onOpenChange={setCreateEventOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{selectedEvent ? 'Edit Event' : 'Create New Event'}</DialogTitle>
            <DialogDescription>
              {selectedEvent 
                ? 'Update the details of your existing event.'
                : 'Fill in the details to add a new event to your calendar.'}
            </DialogDescription>
          </DialogHeader>
          
          <ScrollArea className="max-h-[70vh]">
            <div className="p-1">
              <CalendarEventForm
                event={selectedEvent || (selectedDate ? { date: selectedDate } as CalendarEvent : undefined)}
                onSubmit={handleEventSubmit}
                onCancel={() => {
                  setCreateEventOpen(false);
                  setSelectedEvent(null);
                }}
              />
            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
      
      <Dialog open={eventDetailOpen} onOpenChange={setEventDetailOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle>{selectedEvent?.title}</DialogTitle>
              <Badge variant="outline" className={cn(
                selectedEvent?.type === 'meeting' && "bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
                selectedEvent?.type === 'task' && "bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800",
                selectedEvent?.type === 'reminder' && "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                selectedEvent?.type === 'event' && "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                selectedEvent?.type === 'webinar' && "bg-indigo-50 text-indigo-600 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800",
                selectedEvent?.type === 'deadline' && "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
              )}>
                {selectedEvent?.type?.charAt(0).toUpperCase() + (selectedEvent?.type?.slice(1) || '')}
              </Badge>
            </div>
            <DialogDescription>
              {selectedEvent?.date && format(
                typeof selectedEvent.date === 'string' 
                  ? parseISO(selectedEvent.date) 
                  : selectedEvent.date, 
                'EEEE, MMMM d, yyyy'
              )}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {selectedEvent?.description && (
              <div>
                <h4 className="text-sm font-medium mb-1">Description</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {selectedEvent.description}
                </p>
              </div>
            )}
            
            {(selectedEvent?.startTime || selectedEvent?.location) && (
              <div className="grid grid-cols-2 gap-4">
                {selectedEvent.startTime && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Time</h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <CalendarIcon className="w-4 h-4 mr-1 text-gray-500" />
                      {selectedEvent.startTime} - {selectedEvent.endTime || selectedEvent.startTime}
                    </div>
                  </div>
                )}
                
                {selectedEvent.location && (
                  <div>
                    <h4 className="text-sm font-medium mb-1">Location</h4>
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <MapPin className="w-4 h-4 mr-1 text-gray-500" />
                      {selectedEvent.location}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {selectedEvent?.attendees && selectedEvent.attendees.length > 0 && (
              <div>
                <h4 className="text-sm font-medium mb-2">Attendees</h4>
                <div className="flex items-center flex-wrap gap-2">
                  {selectedEvent.attendees.map((attendee, index) => (
                    <div key={index} className="flex items-center bg-gray-100 dark:bg-gray-800 rounded-full pl-1 pr-3 py-1">
                      <Avatar className="h-6 w-6 mr-2">
                        <AvatarImage src={attendee.avatar} />
                        <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{attendee.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {selectedEvent?.url && (
              <div>
                <h4 className="text-sm font-medium mb-1">URL</h4>
                <a 
                  href={selectedEvent.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                >
                  {selectedEvent.url}
                </a>
              </div>
            )}
            
            {selectedEvent?.priority && (
              <div>
                <h4 className="text-sm font-medium mb-1">Priority</h4>
                <Badge variant="outline" className={cn(
                  selectedEvent.priority === 'low' && "bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800",
                  selectedEvent.priority === 'medium' && "bg-yellow-50 text-yellow-600 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
                  selectedEvent.priority === 'high' && "bg-red-50 text-red-600 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                )}>
                  {selectedEvent.priority.charAt(0).toUpperCase() + selectedEvent.priority.slice(1)}
                </Badge>
              </div>
            )}
          </div>
          
          <Separator />
          
          <div className="flex justify-end space-x-2">
            <Button 
              variant="outline" 
              onClick={() => {
                setEventDetailOpen(false);
                setSelectedEvent(null);
              }}
            >
              Close
            </Button>
            <Button
              onClick={() => {
                setEventDetailOpen(false);
                setCreateEventOpen(true);
              }}
            >
              Edit Event
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
