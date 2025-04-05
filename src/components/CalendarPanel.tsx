
import React, { useState } from 'react';
import { format, addDays, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, isSameDay } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarEventForm } from '@/components/calendar/CalendarEventForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import Icons from '@/utils/IconUtils';
import { toast } from 'sonner';

interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description?: string;
  color: string;
  location?: string;
  participants?: string[];
  type: 'meeting' | 'task' | 'reminder' | 'event';
}

const CalendarPanel = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Team Meeting',
      date: new Date().toISOString().split('T')[0],
      startTime: '10:00',
      endTime: '11:00',
      description: 'Weekly status update',
      color: 'bg-blue-500',
      location: 'Conference Room A',
      participants: ['John', 'Lisa', 'Mike'],
      type: 'meeting'
    },
    {
      id: '2',
      title: 'Project Deadline',
      date: addDays(new Date(), 2).toISOString().split('T')[0],
      startTime: '09:00',
      endTime: '17:00',
      description: 'Submit final project report',
      color: 'bg-red-500',
      type: 'task'
    },
    {
      id: '3',
      title: 'Client Call',
      date: addDays(new Date(), 1).toISOString().split('T')[0],
      startTime: '14:00',
      endTime: '15:00',
      description: 'Discuss project requirements',
      color: 'bg-green-500',
      location: 'Zoom',
      participants: ['Client ABC', 'Sarah'],
      type: 'meeting'
    }
  ]);
  const [eventFormOpen, setEventFormOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  
  const weekStart = startOfWeek(date, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(date, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
    }
  };
  
  const handleAddEvent = (event: Omit<CalendarEvent, 'id'>) => {
    const newEvent = { 
      ...event, 
      id: (events.length + 1).toString() 
    };
    
    setEvents([...events, newEvent as CalendarEvent]);
    setEventFormOpen(false);
    toast.success('Event added successfully!');
  };
  
  const handleUpdateEvent = (event: CalendarEvent) => {
    setEvents(events.map(e => e.id === event.id ? event : e));
    setEventFormOpen(false);
    setSelectedEvent(null);
    toast.success('Event updated successfully!');
  };
  
  const handleDeleteEvent = (id: string) => {
    setEvents(events.filter(event => event.id !== id));
    setEventFormOpen(false);
    setSelectedEvent(null);
    toast.success('Event deleted successfully!');
  };
  
  const openAddEventForm = () => {
    setSelectedEvent(null);
    setEventFormOpen(true);
  };
  
  const openEditEventForm = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setEventFormOpen(true);
  };
  
  // Filter events for the current day view
  const dayEvents = events.filter(event => 
    isSameDay(parseISO(event.date), date)
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Filter events for the current week view
  const weekEvents = events.filter(event => {
    const eventDate = parseISO(event.date);
    return eventDate >= weekStart && eventDate <= weekEnd;
  });
  
  // Filter events for today
  const todayEvents = events.filter(event => 
    isSameDay(parseISO(event.date), new Date())
  ).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // Helper to get icon for event type
  const getEventTypeIcon = (type: string) => {
    switch(type) {
      case 'meeting':
        return <Icons.Users size={14} className="mr-1" />;
      case 'task':
        return <Icons.CheckCircle size={14} className="mr-1" />;
      case 'reminder':
        return <Icons.Bell size={14} className="mr-1" />;
      case 'event':
        return <Icons.Calendar size={14} className="mr-1" />;
      default:
        return <Icons.Calendar size={14} className="mr-1" />;
    }
  };
  
  return (
    <div className="p-6 h-full flex flex-col relative overflow-hidden">
      {/* Celestial whales background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <img 
          src="/lovable-uploads/164358ca-4f3f-427d-8763-57b886bb4b8f.png"
          alt="Celestial whales background"
          className="w-full h-full object-cover opacity-15 dark:opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-transparent to-background/80"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold">Calendar</h2>
            <p className="text-sm text-muted-foreground">Manage your schedule and appointments</p>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="hidden md:flex">
              <Button
                variant={viewMode === 'day' ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-l-md rounded-r-none border-r-0"
                onClick={() => setViewMode('day')}
              >
                Day
              </Button>
              <Button
                variant={viewMode === 'week' ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-none border-x-0"
                onClick={() => setViewMode('week')}
              >
                Week
              </Button>
              <Button
                variant={viewMode === 'month' ? 'secondary' : 'outline'}
                size="sm"
                className="rounded-r-md rounded-l-none border-l-0"
                onClick={() => setViewMode('month')}
              >
                Month
              </Button>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              className="hidden md:flex"
              onClick={() => setDate(new Date())}
            >
              Today
            </Button>
            
            <Button
              variant="default"
              size="sm"
              onClick={openAddEventForm}
              className="flex items-center gap-1"
            >
              <Icons.Plus size={16} />
              <span>Add Event</span>
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue={viewMode} value={viewMode} onValueChange={(value) => setViewMode(value as any)} className="flex-1 flex flex-col">
          <div className="flex flex-col md:flex-row gap-4 flex-1">
            <div className="md:w-64 space-y-4">
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Mini Calendar</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={handleDateChange}
                    className="rounded-md border backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                  />
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Today's Events</CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-48 px-4">
                    {todayEvents.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full py-4 text-center">
                        <Icons.Calendar className="h-8 w-8 text-muted-foreground opacity-20 mb-2" />
                        <p className="text-sm text-muted-foreground">No events scheduled for today</p>
                      </div>
                    ) : (
                      <div className="space-y-2 py-2">
                        {todayEvents.map(event => (
                          <button
                            key={event.id}
                            className="w-full text-left p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors flex items-start"
                            onClick={() => openEditEventForm(event)}
                          >
                            <div className={`w-2 h-full rounded-full mr-2 ${event.color}`}></div>
                            <div>
                              <p className="font-medium text-sm">{event.title}</p>
                              <p className="text-xs text-muted-foreground">{event.startTime} - {event.endTime}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </ScrollArea>
                </CardContent>
              </Card>
              
              <Card className="backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">Calendar Legend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="bg-blue-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm">Meetings</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-red-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm">Tasks</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm">Calls</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-purple-500 w-3 h-3 rounded-full mr-2"></div>
                      <span className="text-sm">Events</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            <div className="flex-1 overflow-hidden">
              <TabsContent value="day" className="h-full m-0">
                <Card className="h-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 1))}>
                          <Icons.ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-lg font-semibold">
                          {format(date, 'EEEE, MMMM d, yyyy')}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 1))}>
                          <Icons.ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="flex flex-col">
                        {Array.from({ length: 24 }).map((_, hour) => (
                          <div key={hour} className="flex border-b border-gray-100 dark:border-gray-800 min-h-[60px]">
                            <div className="w-16 py-1 px-2 text-right text-xs text-muted-foreground border-r border-gray-100 dark:border-gray-800">
                              {hour === 0 ? '12 AM' : 
                               hour < 12 ? `${hour} AM` : 
                               hour === 12 ? '12 PM' : 
                               `${hour - 12} PM`}
                            </div>
                            <div className="flex-1 p-1 relative">
                              {dayEvents
                                .filter(event => parseInt(event.startTime.split(':')[0]) === hour)
                                .map(event => (
                                  <div 
                                    key={event.id}
                                    className={`${event.color} text-white rounded-md p-2 mb-1 cursor-pointer`}
                                    onClick={() => openEditEventForm(event)}
                                  >
                                    <div className="font-medium">{event.title}</div>
                                    <div className="text-xs">{event.startTime} - {event.endTime}</div>
                                    {event.location && (
                                      <div className="text-xs flex items-center mt-1">
                                        <Icons.Map size={12} className="mr-1" />
                                        {event.location}
                                      </div>
                                    )}
                                  </div>
                                ))
                              }
                            </div>
                          </div>
                        ))}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="week" className="h-full m-0">
                <Card className="h-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 7))}>
                          <Icons.ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-lg font-semibold">
                          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
                        </h3>
                        <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 7))}>
                          <Icons.ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <ScrollArea className="h-[calc(100vh-200px)]">
                      <div className="grid grid-cols-7 border-b">
                        {weekDays.map((day, i) => (
                          <div 
                            key={i} 
                            className={`text-center py-2 font-medium ${
                              isSameDay(day, new Date()) 
                                ? 'bg-primary/10 text-primary' 
                                : ''
                            }`}
                            onClick={() => setDate(day)}
                          >
                            <div>{format(day, 'EEE')}</div>
                            <div className={`text-lg ${
                              isSameDay(day, new Date())
                                ? 'bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center mx-auto'
                                : ''
                            }`}>
                              {format(day, 'd')}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div className="grid grid-cols-7">
                        {weekDays.map((day, dayIndex) => {
                          const dayEvts = events.filter(event => 
                            isSameDay(parseISO(event.date), day)
                          );
                          
                          return (
                            <div key={dayIndex} className="border-r min-h-[500px] relative">
                              {dayEvts.map(event => (
                                <div 
                                  key={event.id}
                                  className={`${event.color} text-white text-xs p-1 m-1 rounded cursor-pointer`}
                                  onClick={() => openEditEventForm(event)}
                                >
                                  <div className="font-medium truncate">{event.title}</div>
                                  <div className="truncate">{event.startTime} - {event.endTime}</div>
                                </div>
                              ))}
                            </div>
                          );
                        })}
                      </div>
                    </ScrollArea>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="month" className="h-full m-0">
                <Card className="h-full backdrop-blur-sm bg-white/50 dark:bg-gray-900/50 border-celestial-gold/20">
                  <CardHeader className="pb-2 border-b">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => setDate(subDays(date, 30))}>
                          <Icons.ChevronLeft className="h-4 w-4" />
                        </Button>
                        <h3 className="text-lg font-semibold">{format(date, 'MMMM yyyy')}</h3>
                        <Button variant="ghost" size="icon" onClick={() => setDate(addDays(date, 30))}>
                          <Icons.ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={handleDateChange}
                      className="rounded-md border w-full backdrop-blur-sm bg-white/80 dark:bg-gray-800/80"
                      classNames={{
                        day_today: "bg-primary/10 text-primary font-bold",
                      }}
                    />
                    
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Selected Date: {format(date, 'MMMM d, yyyy')}</h4>
                      <div className="space-y-2">
                        {dayEvents.length === 0 ? (
                          <p className="text-sm text-muted-foreground">No events scheduled</p>
                        ) : (
                          dayEvents.map(event => (
                            <div 
                              key={event.id}
                              className="flex items-start p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer"
                              onClick={() => openEditEventForm(event)}
                            >
                              <div className={`${event.color} w-2 h-full rounded-full mr-2`}></div>
                              <div>
                                <div className="font-medium">{event.title}</div>
                                <div className="text-sm text-muted-foreground">{event.startTime} - {event.endTime}</div>
                                {event.description && (
                                  <div className="text-sm mt-1">{event.description}</div>
                                )}
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </div>
          </div>
        </Tabs>
      </div>
      
      {/* Event Form Dialog */}
      <Dialog open={eventFormOpen} onOpenChange={setEventFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <CalendarEventForm
            initialData={selectedEvent || undefined}
            onSubmit={selectedEvent ? handleUpdateEvent : handleAddEvent}
            onDelete={selectedEvent ? () => handleDeleteEvent(selectedEvent.id) : undefined}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
