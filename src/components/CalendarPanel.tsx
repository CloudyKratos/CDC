
import React, { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  addDays, 
  format, 
  startOfToday, 
  startOfWeek, 
  endOfWeek, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  eachDayOfInterval, 
  isToday,
  getHours,
  getMinutes,
  parseISO,
  isThisWeek,
  isThisMonth,
  differenceInMinutes
} from "date-fns";
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
  Clock8,
  BellRing,
  AlertCircle,
  Filter,
  Search,
  Tag,
  X,
  CalendarDays,
  CalendarClock,
  Star
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
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

// Types for our events
type Event = {
  id: string;
  title: string;
  date: Date;
  startTime: string;
  endTime: string;
  location?: string;
  description?: string;
  type: 'meeting' | 'deadline' | 'reminder' | 'task' | 'personal' | 'workshop' | 'seminar';
  attendees?: { name: string; avatar?: string }[];
  isCompleted?: boolean;
  tags?: string[];
  isReminderSet?: boolean;
  createdBy?: string;
  priority?: 'low' | 'medium' | 'high';
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
    ],
    tags: ["development", "daily"],
    priority: "medium"
  },
  {
    id: "2",
    title: "Project Deadline",
    date: addDays(startOfToday(), 2),
    startTime: "17:00",
    endTime: "18:00",
    description: "Final submission for Q3 project",
    type: "deadline",
    isReminderSet: true,
    tags: ["project", "deadline"],
    priority: "high"
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
    ],
    tags: ["client", "requirements"],
    priority: "high",
    isReminderSet: true
  },
  {
    id: "4",
    title: "Prepare Presentation",
    date: startOfToday(),
    startTime: "14:00",
    endTime: "16:00",
    description: "Create slides for the investor meeting",
    type: "task",
    isCompleted: false,
    tags: ["presentation", "investors"]
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
    ],
    tags: ["marketing", "analytics", "planning"]
  },
  {
    id: "6",
    title: "Gym Session",
    date: addDays(startOfToday(), 1),
    startTime: "07:00",
    endTime: "08:00",
    location: "Fitness Center",
    type: "personal",
    tags: ["health", "personal"]
  },
  {
    id: "7",
    title: "Product Launch",
    date: addDays(startOfToday(), 7),
    startTime: "09:00",
    endTime: "12:00",
    description: "Launch new product features",
    type: "deadline",
    isReminderSet: true,
    tags: ["product", "launch", "marketing"],
    priority: "high"
  },
  {
    id: "8",
    title: "Entrepreneurship Workshop",
    date: addDays(startOfToday(), 5),
    startTime: "13:00",
    endTime: "17:00",
    location: "Community Center",
    description: "Workshop on startup funding strategies and pitching to investors",
    type: "workshop",
    attendees: [
      { name: "Robert Chen", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Robert" },
      { name: "Lisa Kumar", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Lisa" },
      { name: "James Wilson", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=James" },
    ],
    tags: ["entrepreneurship", "funding", "workshop"],
    isReminderSet: true
  },
  {
    id: "9",
    title: "Tech Industry Seminar",
    date: addDays(startOfToday(), 4),
    startTime: "10:00",
    endTime: "12:30",
    location: "Virtual - Zoom",
    description: "Seminar on emerging technologies and industry trends",
    type: "seminar",
    tags: ["tech", "industry", "education"],
    isReminderSet: false
  },
  {
    id: "10",
    title: "Networking Dinner",
    date: addDays(startOfToday(), 6),
    startTime: "19:00",
    endTime: "21:00",
    location: "Grand Hotel",
    description: "Dinner with local entrepreneurs and potential investors",
    type: "personal",
    attendees: [
      { name: "Amanda Garcia", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Amanda" },
      { name: "Thomas Wright", avatar: "https://api.dicebear.com/7.x/micah/svg?seed=Thomas" },
    ],
    tags: ["networking", "business"],
    priority: "medium"
  }
];

// Get events for a specific date
const getEventsForDate = (date: Date, searchTerm: string = "", tagFilter: string[] = [], typeFilter: string = "all") => {
  return events.filter(event => {
    // First filter by date
    const isMatchingDate = isSameDay(event.date, date);
    if (!isMatchingDate) return false;
    
    // Then filter by search term if provided
    const matchesSearch = searchTerm === "" || 
      event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (event.description && event.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (event.location && event.location.toLowerCase().includes(searchTerm.toLowerCase()));
    if (!matchesSearch) return false;
    
    // Filter by tags if provided
    const matchesTags = tagFilter.length === 0 || 
      (event.tags && event.tags.some(tag => tagFilter.includes(tag)));
    if (tagFilter.length > 0 && !matchesTags) return false;
    
    // Filter by event type if provided
    const matchesType = typeFilter === "all" || event.type === typeFilter;
    if (typeFilter !== "all" && !matchesType) return false;
    
    return true;
  }).sort((a, b) => a.startTime.localeCompare(b.startTime));
};

// Get dates with events for the current month
const getDatesWithEvents = (month: Date) => {
  const start = startOfMonth(month);
  const end = endOfMonth(month);
  const days = eachDayOfInterval({ start, end });
  
  return days.filter(day => events.some(event => isSameDay(event.date, day)));
};

// Extract all unique tags from events
const getAllTags = () => {
  const tags = events.flatMap(event => event.tags || []);
  return [...new Set(tags)];
};

// Format time for better display
const formatTimeRange = (startTime: string, endTime: string) => {
  // Helper function to format time with AM/PM
  const formatTimeWithAmPm = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hour12 = hours % 12 || 12;
    return `${hour12}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  return `${formatTimeWithAmPm(startTime)} - ${formatTimeWithAmPm(endTime)}`;
};

// Calculate event duration in minutes
const getEventDuration = (startTime: string, endTime: string) => {
  const [startHour, startMinute] = startTime.split(':').map(Number);
  const [endHour, endMinute] = endTime.split(':').map(Number);
  
  const startDate = new Date();
  startDate.setHours(startHour, startMinute, 0);
  
  const endDate = new Date();
  endDate.setHours(endHour, endMinute, 0);
  
  return differenceInMinutes(endDate, startDate);
};

// Get a color based on the event type
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
    case 'workshop':
      return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
    case 'seminar':
      return 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300 border-pink-200 dark:border-pink-800';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700';
  }
};

// Get priority badge styling
const getPriorityBadge = (priority?: 'low' | 'medium' | 'high') => {
  switch (priority) {
    case 'high':
      return (
        <Badge variant="outline" className="bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 border-red-200">
          High Priority
        </Badge>
      );
    case 'medium':
      return (
        <Badge variant="outline" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300 border-yellow-200">
          Medium Priority
        </Badge>
      );
    case 'low':
      return (
        <Badge variant="outline" className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300 border-green-200">
          Low Priority
        </Badge>
      );
    default:
      return null;
  }
};

const CalendarPanel = () => {
  const [date, setDate] = useState<Date>(new Date());
  const [calendarView, setCalendarView] = useState<'month' | 'week' | 'day'>('month');
  const [selectedDate, setSelectedDate] = useState<Date>(startOfToday());
  const [filter, setFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showAddEventDialog, setShowAddEventDialog] = useState<boolean>(false);
  const [newEvent, setNewEvent] = useState<Partial<Event>>({
    title: "",
    description: "",
    date: new Date(),
    startTime: "09:00",
    endTime: "10:00",
    type: "meeting",
    tags: [],
    isReminderSet: false
  });
  const [showEventDetailsDialog, setShowEventDetailsDialog] = useState<boolean>(false);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Get events based on currently selected date and filter
  const filteredEvents = getEventsForDate(selectedDate, searchTerm, selectedTags, filter);
  
  // For highlighting dates with events
  const datesWithEvents = getDatesWithEvents(date);
  
  // All available tags
  const allTags = getAllTags();

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(date);
    }
  };

  const handleAddReminder = (eventId: string) => {
    // This would typically update the event in a real database
    toast.success("Reminder set", {
      description: "You'll be notified before this event begins.",
    });
  };

  const handleTagSelect = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleAddEvent = () => {
    // This would typically add the event to a real database
    toast.success("Event added", {
      description: "Your new event has been added to the calendar.",
    });
    setShowAddEventDialog(false);
  };

  const handleCompleteTask = (eventId: string) => {
    // This would typically update the event in a real database
    toast.success("Task completed", {
      description: "The task has been marked as completed.",
    });
  };

  const openEventDetails = (event: Event) => {
    setSelectedEvent(event);
    setShowEventDetailsDialog(true);
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
            className={`border rounded p-2 ${
              isToday(day) ? 'border-primary' : 'border-gray-200 dark:border-gray-700'
            }`}
          >
            <div className="font-medium text-center mb-2">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {format(day, 'EEE')}
              </div>
              <div className={`text-sm mt-1 rounded-full w-6 h-6 flex items-center justify-center mx-auto ${
                isToday(day) ? 'bg-primary text-white' : ''
              }`}>
                {format(day, 'd')}
              </div>
            </div>
            <div className="space-y-1 overflow-hidden max-h-32">
              {getEventsForDate(day).slice(0, 3).map((event) => (
                <div 
                  key={event.id}
                  className={`text-xs p-1 rounded truncate cursor-pointer ${getEventTypeColor(event.type)}`}
                  onClick={() => openEventDetails(event)}
                >
                  {event.startTime} {event.title}
                </div>
              ))}
              {getEventsForDate(day).length > 3 && (
                <div 
                  className="text-xs text-center text-gray-500 dark:text-gray-400 cursor-pointer hover:underline"
                  onClick={() => setSelectedDate(day)}
                >
                  +{getEventsForDate(day).length - 3} more
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDayView = () => {
    return (
      <div className="space-y-4">
        <div className="text-lg font-medium">
          {format(selectedDate, 'EEEE, MMMM d, yyyy')}
        </div>
        <div className="space-y-1">
          {Array.from({ length: 24 }).map((_, i) => {
            const hourEvents = filteredEvents.filter(event => {
              const hour = parseInt(event.startTime.split(':')[0], 10);
              return hour === i;
            });
            
            return (
              <div 
                key={i} 
                className={`flex items-start py-2 border-b border-gray-100 dark:border-gray-800 ${
                  hourEvents.length > 0 ? 'bg-gray-50 dark:bg-gray-800/30' : ''
                }`}
              >
                <div className="w-16 text-sm text-gray-500 dark:text-gray-400">
                  {i === 0 ? '12 AM' : i < 12 ? `${i} AM` : i === 12 ? '12 PM' : `${i - 12} PM`}
                </div>
                <div className="flex-1">
                  {hourEvents.map(event => {
                    const duration = getEventDuration(event.startTime, event.endTime);
                    const height = Math.max(50, duration / 2); // 30 minutes = 15px height minimum
                    
                    return (
                      <div 
                        key={event.id}
                        className={`p-2 rounded mb-1 cursor-pointer transition-all hover:shadow-md ${getEventTypeColor(event.type)}`}
                        style={{ minHeight: `${height}px` }}
                        onClick={() => openEventDetails(event)}
                      >
                        <div className="font-medium">{event.title}</div>
                        <div className="text-xs">
                          {event.startTime} - {event.endTime}
                          {event.location && ` • ${event.location}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
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
            <Button variant="outline" size="sm" onClick={() => setShowAddEventDialog(true)}>
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
                <SelectItem value="workshop">Workshops</SelectItem>
                <SelectItem value="seminar">Seminars</SelectItem>
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
                      <CalendarDays className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => setCalendarView('day')}
                      className={calendarView === 'day' ? 'bg-primary text-white' : ''}
                    >
                      <CalendarClock className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-auto pb-6">
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
                  renderDayView()
                )}
              </CardContent>
            </Card>
            
            {/* Events List */}
            <Card className="shadow-sm flex flex-col overflow-hidden">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center space-x-2">
                    <span>{format(selectedDate, 'MMM d, yyyy')}</span>
                    <Badge variant="outline" className={isToday(selectedDate) ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30' : ''}>
                      {isToday(selectedDate) ? 'Today' : format(selectedDate, 'EEEE')}
                    </Badge>
                  </CardTitle>
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
                </div>
                <CardDescription>
                  {filteredEvents.length} events scheduled
                </CardDescription>
                <div className="mt-2 flex items-center space-x-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
                    <Input 
                      placeholder="Search events..." 
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 text-sm"
                    />
                  </div>
                  
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="icon" className="h-9 w-9">
                        <Tag className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-60">
                      <div className="space-y-2">
                        <div className="font-medium">Filter by tags</div>
                        <div className="flex flex-wrap gap-1">
                          {allTags.map(tag => (
                            <Badge 
                              key={tag}
                              variant={selectedTags.includes(tag) ? "default" : "outline"}
                              className="cursor-pointer"
                              onClick={() => handleTagSelect(tag)}
                            >
                              {tag}
                              {selectedTags.includes(tag) && (
                                <X className="ml-1 h-3 w-3" />
                              )}
                            </Badge>
                          ))}
                        </div>
                        {selectedTags.length > 0 && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-xs w-full mt-2"
                            onClick={() => setSelectedTags([])}
                          >
                            Clear all filters
                          </Button>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardHeader>
              <CardContent className="flex-1 overflow-hidden">
                <ScrollArea className="h-[calc(100vh-330px)]">
                  {filteredEvents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                      <CalendarIcon className="h-12 w-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                      <p>No events scheduled for this day</p>
                      <Button variant="outline" className="mt-4" onClick={() => setShowAddEventDialog(true)}>
                        <Plus className="mr-1 h-4 w-4" />
                        Add Event
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4 pr-2">
                      {filteredEvents.map((event) => (
                        <div 
                          key={event.id}
                          className="p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow cursor-pointer"
                          onClick={() => openEventDetails(event)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-medium flex items-center">
                                {event.title}
                                {event.isReminderSet && (
                                  <BellRing className="h-3.5 w-3.5 ml-1 text-yellow-500" />
                                )}
                              </h3>
                              <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                                <Clock8 className="h-3.5 w-3.5 mr-1" />
                                {formatTimeRange(event.startTime, event.endTime)}
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
                                  {!event.isReminderSet && (
                                    <DropdownMenuItem onClick={() => handleAddReminder(event.id)}>
                                      Set Reminder
                                    </DropdownMenuItem>
                                  )}
                                  <DropdownMenuItem>Copy Link</DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                          
                          {event.description && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                              {event.description.length > 100 
                                ? `${event.description.substring(0, 100)}...` 
                                : event.description
                              }
                            </p>
                          )}
                          
                          {event.tags && event.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {event.tags.map((tag, index) => (
                                <Badge 
                                  key={index} 
                                  variant="outline" 
                                  className="text-xs"
                                >
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="mt-3">
                              <div className="flex -space-x-2 overflow-hidden">
                                {event.attendees.slice(0, 3).map((attendee, index) => (
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
                              <Button 
                                variant={event.isCompleted ? "outline" : "default"} 
                                size="sm"
                                onClick={() => handleCompleteTask(event.id)}
                              >
                                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                                {event.isCompleted ? "Completed" : "Mark Complete"}
                              </Button>
                            </div>
                          )}
                          
                          {event.priority && (
                            <div className="mt-3">
                              {getPriorityBadge(event.priority)}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </ScrollArea>
              </CardContent>
              <CardFooter className="pt-2 border-t bg-gray-50 dark:bg-gray-900/20">
                <Button variant="outline" className="w-full" onClick={() => setShowAddEventDialog(true)}>
                  <Plus className="h-4 w-4 mr-1" />
                  Add New Event
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="schedule">
          <div className="px-6">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Schedule</CardTitle>
                <CardDescription>View your upcoming events chronologically</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Today's events */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-green-500 mr-2"></div>
                      <h3 className="font-medium">Today</h3>
                    </div>
                    <div className="ml-4 space-y-2">
                      {events
                        .filter(event => isToday(event.date))
                        .map(event => (
                          <div 
                            key={event.id} 
                            className="p-2 rounded-md border-l-4 border-green-500 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                            onClick={() => openEventDetails(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {formatTimeRange(event.startTime, event.endTime)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* This week's events */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-blue-500 mr-2"></div>
                      <h3 className="font-medium">This Week</h3>
                    </div>
                    <div className="ml-4 space-y-2">
                      {events
                        .filter(event => !isToday(event.date) && isThisWeek(event.date))
                        .map(event => (
                          <div 
                            key={event.id} 
                            className="p-2 rounded-md border-l-4 border-blue-500 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                            onClick={() => openEventDetails(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(event.date, 'EEE, MMM d')} • {formatTimeRange(event.startTime, event.endTime)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Later this month */}
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-purple-500 mr-2"></div>
                      <h3 className="font-medium">Later This Month</h3>
                    </div>
                    <div className="ml-4 space-y-2">
                      {events
                        .filter(event => !isToday(event.date) && !isThisWeek(event.date) && isThisMonth(event.date))
                        .map(event => (
                          <div 
                            key={event.id} 
                            className="p-2 rounded-md border-l-4 border-purple-500 bg-gray-50 dark:bg-gray-800/50 cursor-pointer"
                            onClick={() => openEventDetails(event)}
                          >
                            <div className="font-medium">{event.title}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {format(event.date, 'EEE, MMM d')} • {formatTimeRange(event.startTime, event.endTime)}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="timeline">
          <div className="px-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Timeline</CardTitle>
                <CardDescription>
                  Track your key events and milestones
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="relative pl-6 border-l-2 border-gray-200 dark:border-gray-700 space-y-8">
                  {events
                    .filter(event => event.type === 'deadline' || event.type === 'workshop' || event.type === 'seminar')
                    .sort((a, b) => a.date.getTime() - b.date.getTime())
                    .map((event, index) => (
                      <div key={event.id} className="relative">
                        <div className="absolute -left-[27px] h-4 w-4 rounded-full bg-primary"></div>
                        <div className="pl-4">
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {format(event.date, 'MMMM d, yyyy')}
                          </div>
                          <div 
                            className={`
                              p-3 mt-1 rounded-lg border shadow-sm hover:shadow-md transition-shadow cursor-pointer 
                              ${getEventTypeColor(event.type)}
                            `}
                            onClick={() => openEventDetails(event)}
                          >
                            <h3 className="font-medium">{event.title}</h3>
                            {event.description && (
                              <p className="text-sm mt-1">{event.description}</p>
                            )}
                            <div className="mt-2 flex items-center justify-between">
                              <Badge variant="outline">
                                {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                              </Badge>
                              <div className="text-sm">
                                {formatTimeRange(event.startTime, event.endTime)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  }
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
      
      {/* Add Event Dialog */}
      <Dialog open={showAddEventDialog} onOpenChange={setShowAddEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
            <DialogDescription>
              Create a new event in your calendar
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input 
                id="title" 
                placeholder="Enter event title"
                value={newEvent.title}
                onChange={(e) => setNewEvent({...newEvent, title: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="justify-start text-left font-normal">
                      {newEvent.date ? format(newEvent.date, 'PPP') : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={newEvent.date}
                      onSelect={(date) => setNewEvent({...newEvent, date: date || new Date()})}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="type">Event Type</Label>
                <Select 
                  value={newEvent.type} 
                  onValueChange={(value) => setNewEvent({...newEvent, type: value as Event['type']})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="personal">Personal</SelectItem>
                    <SelectItem value="workshop">Workshop</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input 
                  id="startTime" 
                  type="time"
                  value={newEvent.startTime}
                  onChange={(e) => setNewEvent({...newEvent, startTime: e.target.value})}
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input 
                  id="endTime" 
                  type="time"
                  value={newEvent.endTime}
                  onChange={(e) => setNewEvent({...newEvent, endTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="location">Location (Optional)</Label>
              <Input 
                id="location" 
                placeholder="Enter location"
                value={newEvent.location || ''}
                onChange={(e) => setNewEvent({...newEvent, location: e.target.value})}
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea 
                id="description" 
                placeholder="Enter description"
                value={newEvent.description || ''}
                onChange={(e) => setNewEvent({...newEvent, description: e.target.value})}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="reminder"
                checked={newEvent.isReminderSet}
                onChange={(e) => setNewEvent({...newEvent, isReminderSet: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="reminder" className="cursor-pointer">Set reminder for this event</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddEventDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAddEvent}
              disabled={!newEvent.title || !newEvent.date || !newEvent.startTime || !newEvent.endTime}
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Event Details Dialog */}
      {selectedEvent && (
        <Dialog open={showEventDetailsDialog} onOpenChange={setShowEventDetailsDialog}>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <span className="mr-2">{selectedEvent.title}</span>
                {selectedEvent.isReminderSet && (
                  <BellRing className="h-4 w-4 text-yellow-500" />
                )}
              </DialogTitle>
              <div className="flex items-center space-x-2 mt-1">
                <Badge className={getEventTypeColor(selectedEvent.type)}>
                  {selectedEvent.type.charAt(0).toUpperCase() + selectedEvent.type.slice(1)}
                </Badge>
                {selectedEvent.priority && getPriorityBadge(selectedEvent.priority)}
              </div>
            </DialogHeader>
            
            <div className="py-4 space-y-4">
              <div className="flex items-center text-sm">
                <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                <span>{format(selectedEvent.date, 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center text-sm">
                <Clock className="h-4 w-4 mr-2 text-gray-500" />
                <span>{formatTimeRange(selectedEvent.startTime, selectedEvent.endTime)}</span>
                <span className="text-gray-500 ml-2">
                  ({getEventDuration(selectedEvent.startTime, selectedEvent.endTime)} min)
                </span>
              </div>
              
              {selectedEvent.location && (
                <div className="flex items-center text-sm">
                  <MapPin className="h-4 w-4 mr-2 text-gray-500" />
                  <span>{selectedEvent.location}</span>
                </div>
              )}
              
              {selectedEvent.description && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-medium mb-1">Description</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {selectedEvent.description}
                  </p>
                </div>
              )}
              
              {selectedEvent.attendees && selectedEvent.attendees.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-medium mb-2">Attendees</h4>
                  <div className="space-y-2">
                    {selectedEvent.attendees.map((attendee, index) => (
                      <div key={index} className="flex items-center">
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={attendee.avatar} />
                          <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <span>{attendee.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
                  <h4 className="text-sm font-medium mb-2">Tags</h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter className="flex items-center justify-between">
              <Button variant="outline" size="sm" onClick={() => setShowEventDetailsDialog(false)}>
                Close
              </Button>
              
              <div className="space-x-2">
                {!selectedEvent.isReminderSet && (
                  <Button variant="outline" size="sm" onClick={() => handleAddReminder(selectedEvent.id)}>
                    <BellRing className="h-4 w-4 mr-1" />
                    Set Reminder
                  </Button>
                )}
                
                {selectedEvent.type === 'meeting' && (
                  <Button variant="outline" size="sm">
                    <Video className="h-4 w-4 mr-1" />
                    Join Meeting
                  </Button>
                )}
                
                {selectedEvent.type === 'task' && !selectedEvent.isCompleted && (
                  <Button 
                    size="sm"
                    onClick={() => handleCompleteTask(selectedEvent.id)}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Mark Complete
                  </Button>
                )}
              </div>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarPanel;
