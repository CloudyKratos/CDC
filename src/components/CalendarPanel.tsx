
import React, { useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { addDays, format, startOfToday, startOfWeek, endOfWeek, isSameDay, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";
import { 
  ChevronLeft, 
  ChevronRight, 
  Clock,
  Users,
  Video,
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus,
  ArrowRight,
  MoreHorizontal,
  MapPin,
  Clock8
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Types for our events
type Event = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'task' | 'personal';
  attendees?: { name: string; avatar?: string }[];
  isCompleted?: boolean;
};

// Sample events data
const events: Event[] = [
  {
    id: "1",
    title: "Team Standup",
    date: startOfToday(),
    startTime: "09:00",
    endTime: "09:30",
    location: "Conference Room A",
    description: "Daily standup meeting with the development team",
    type: "meeting",
    attendees: [
      { name: "John Smith", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Jane" },
      { name: "Alex Johnson", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Alex" },
      { name: "Sarah Williams", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Sarah" },
    ]
  },
  {
    id: "2",
    title: "Project Deadline",
    date: addDays(startOfToday(), 2),
    startTime: "17:00",
    endTime: "18:00",
    description: "Final submission for Q3 project",
    type: "deadline"
  },
  {
    id: "3",
    title: "Client Meeting",
    date: addDays(startOfToday(), 1),
    startTime: "11:00",
    endTime: "12:00",
    location: "Virtual - Zoom",
    description: "Discuss new requirements with the client",
    type: "meeting",
    attendees: [
      { name: "Michael Brown", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Michael" },
      { name: "Emily Davis", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Emily" },
    ]
  },
  {
    id: "4",
    title: "Prepare Presentation",
    date: startOfToday(),
    startTime: "14:00",
    endTime: "16:00",
    description: "Create slides for the investor meeting",
    type: "task",
    isCompleted: false
  },
  {
    id: "5",
    title: "Marketing Review",
    date: addDays(startOfToday(), 3),
    startTime: "10:00",
    endTime: "11:30",
    location: "Conference Room B",
    description: "Review Q3 marketing analytics and plan Q4 campaigns",
    type: "meeting",
    attendees: [
      { name: "Jessica Lee", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Jessica" },
      { name: "David Wilson", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=David" },
    ]
  },
  {
    id: "6",
    title: "Gym Session",
    date: addDays(startOfToday(), 1),
    startTime: "07:00",
    endTime: "08:00",
    location: "Fitness Center",
    type: "personal"
  },
  {
    id: "7",
    title: "Product Launch",
    date: addDays(startOfToday(), 7),
    startTime: "09:00",
    endTime: "12:00",
    description: "Launch new product features",
    type: "deadline"
  },
];

// Get events for a specific date
const getEventsForDate = (date: Date) => {
  return events.filter(event => isSameDay(event.date, date));
};

// Get dates with events for the current month
const getDatesWithEvents = (month: Date) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  return days.filter(day => events.some(event => isSameDay(event.date, day)));
};

const CalendarPanel = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [filter, setFilter] = useState<string>("all");

  // Get events based on currently selected date and filter
  const filteredEvents = getEventsForDate(selectedDate).filter(event => {
    if (filter === "all") return true;
    return event.type === filter;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
  
  // For highlighting dates with events
  const datesWithEvents = getDatesWithEvents(date);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const getEventTypeColor = (type: string) => {
    switch (type) {
      case 'meeting':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'deadline':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'reminder':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'task':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'personal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
    }
  };

  const renderWeekView = () => {
    const startDay = startOfWeek(selectedDate);
    const endDay = endOfWeek(selectedDate);
    const days = eachDayOfInterval({ start: startDay, end: endDay });

    return (
      <div className="grid grid-cols-7 gap-2 mt-4">
        {days.map((day) => (
          <div 
            key={day.toString()}
            className="border border-gray-200 dark:border-gray-700 rounded p-2"
          >
            <div className="font-medium text-center mb-2">
              {format(day, 'EEE')}
              <div className={`text-sm mt-1 rounded-full w-6 h-6 flex items-center justify-center mx-auto ${
                isSameDay(day, new Date()) ? 'bg-primary text-white' : ''
              }`}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="space-y-1 overflow-hidden max-h-32">
              {getEventsForDate(day).slice(0, 3).map((event) => (
                <div 
                  key={event.id}
                  className={`text-xs p-1 rounded truncate ${getEventTypeColor(event.type)}`}
                >
                  {event.startTime} {event.title}
                </div>
              ))}
              {getEventsForDate(day).length > 3 && (
                <div className="text-xs text-center text-gray-500 dark:text-gray-400">
                  +{getEventsForDate(day).length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="p-0 h-full">
      <Tabs defaultValue="calendar" className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4 px-6 pt-6">
          <TabsList>
            <TabsTrigger value="calendar">Calendar</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-4 w-4" />
              Create Event
            </Button>
            
            <Select value={filter} onValueChange={setFilter}>
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Filter Events" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Events</SelectItem>
                <SelectItem value="meeting">Meetings</SelectItem>
                <SelectItem value="deadline">Deadlines</SelectItem>
                <SelectItem value="task">Tasks</SelectItem>
                <SelectItem value="reminder">Reminders</SelectItem>
                <SelectItem value="personal">Personal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <TabsContent value="calendar" className="flex-1 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3 h-full gap-6 px-6">
            {/* Calendar View */}
            <Card className="col-span-1 md:col-span-2 flex flex-col shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    {format(date, 'MMMM yyyy')}
                  </CardTitle>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCalendarView('month')}
                      className={calendarView === 'month' ? 'bg-primary text-white' : ''}
                    >
                      <CalendarIcon className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCalendarView('week')}
                      className={calendarView === 'week' ? 'bg-primary text-white' : ''}
                    >
                      <Users className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCalendarView('day')}
                      className={calendarView === 'day' ? 'bg-primary text-white' : ''}
                    >
                      <Clock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto">
                {calendarView === 'month' ? (
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={handleDateSelect}
                    month={date}
                    onMonthChange={setDate}
                    className="rounded-md border h-full"
                    modifiers={{
                      event: datesWithEvents,
                    }}
                    modifiersStyles={{
                      event: { 
                        fontWeight: 'bold',
                        textDecoration: 'underline',
                        textDecorationColor: 'var(--primary)',
                        textDecorationThickness: '2px',
                      }
                    }}
                  />
                ) : calendarView === 'week' ? (
                  renderWeekView()
                ) : (
                  <div className="space-y-4">
                    <div className="text-lg font-medium">
                      {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                    </div>
                    <div className="space-y-2">
                      {Array.from({ length: 24 }).map((_, i) => (
                        <div key={i} className="flex items-start py-2 border-b border-gray-100 dark:border-gray-800">
                          <div className="w-16 text-sm text-gray-500 dark:text-gray-400">
                            {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                          </div>
                          <div className="flex-1">
                            {filteredEvents
                              .filter(event => {
                                const hour = parseInt(event.startTime.split(':')[0]);
                                return hour === i;
                              })
                              .map(event => (
                                <div 
                                  key={event.id}
                                  className={`p-2 rounded mb-1 ${getEventTypeColor(event.type)}`}
                                >
                                  <div className="font-medium">{event.title}</div>
                                  <div className="text-xs">
                                    {event.startTime} - {event.endTime}
                                    {event.location && ` • ${event.location}`}
                                  </div>
                                </div>
                              ))
                            }
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
            
            {/* Events List */}
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{format(selectedDate, 'MMMM d, yyyy')}</span>
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedDate(addDays(selectedDate, -1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8"
                      onClick={() => setSelectedDate(addDays(selectedDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[calc(100vh-300px)]">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>No events scheduled for this day</p>
                      <Button variant="outline" className="mt-4">
                        <Plus className="mr-1 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredEvents.map((event) => (
                        <div 
                          key={event.id}
                          className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium">{event.title}</h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Clock8 className="h-3.5 w-3.5 mr-1" />
                                {event.startTime} - {event.endTime}
                              </div>
                              {event.location && (
                                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                  <MapPin className="h-3.5 w-3.5 mr-1" />
                                  {event.location}
                                </div>
                              )}
                            </div>
                            <div className="flex items-center">
                              <Badge className={getEventTypeColor(event.type)}>
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </Badge>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 ml-1">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>Edit</DropdownMenuItem>
                                  <DropdownMenuItem>Copy Link</DropdownMenuItem>
                                  <DropdownMenuItem>Add Reminder</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {event.description}
                            </p>
                          )}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="mt-3">
                              <div className="flex -space-x-2 overflow-hidden">
                                {event.attendees.map((attendee, index) => (
                                  <Avatar key={index} className="border-2 border-background h-8 w-8">
                                    <AvatarImage src={attendee.avatar} />
                                    <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                                {event.attendees.length > 3 && (
                                  <div className="flex items-center justify-center h-8 w-8 rounded-full border-2 border-background bg-gray-100 dark:bg-gray-700 text-xs font-medium">
                                    +{event.attendees.length - 3}
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                          
                          {event.type === 'meeting' && (
                            <div className="mt-3">
                              <Button variant="outline" size="sm" className="mr-2">
                                <Video className="h-3.5 w-3.5 mr-1" />
                                Join
                              </Button>
                              <Button variant="outline" size="sm">
                                Edit
                              </Button>
                            </div>
                          )}
                          
                          {event.type === 'task' && (
                            <div className="mt-3">
                              <Button variant={event.isCompleted ? "outline" : "default"} size="sm">
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                {event.isCompleted ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="px-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">Schedule view will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="px-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500 dark:text-gray-400">Timeline view will be implemented here.</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CalendarPanel;
