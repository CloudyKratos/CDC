
import React, { useState } from "react";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Users, MapPin, Clock, Plus, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, addDays, isSameDay } from "date-fns";

// Upcoming events data - in a real app, this would come from a backend
const upcomingEvents = [
  {
    id: 1,
    title: "Weekly Round Table",
    description: "Join our weekly community discussion on entrepreneurship strategies",
    date: new Date(new Date().setHours(15, 0, 0, 0)),
    endDate: new Date(new Date().setHours(16, 30, 0, 0)),
    location: "Round Table Channel",
    attendees: [
      { id: "1", name: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
      { id: "2", name: "Sarah Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
      { id: "3", name: "Michael Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
      { id: "4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
      { id: "5", name: "James Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=James" },
      { id: "6", name: "Linda Jones", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda" },
      { id: "7", name: "Robert Taylor", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Robert" },
    ],
    category: "community",
    isRecurring: true,
    recurringDays: "Every Wednesday"
  },
  {
    id: 2,
    title: "Entrepreneurship Workshop",
    description: "Learn key strategies for launching your business from experienced mentors",
    date: addDays(new Date(new Date().setHours(11, 0, 0, 0)), 1),
    endDate: addDays(new Date(new Date().setHours(13, 0, 0, 0)), 1),
    location: "General Channel",
    attendees: [
      { id: "1", name: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
      { id: "3", name: "Michael Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
      { id: "8", name: "Patricia White", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Patricia" },
    ],
    category: "workshop",
    isRecurring: false
  },
  {
    id: 3,
    title: "Business Strategy Session",
    description: "Focused discussion on growth tactics and market positioning",
    date: addDays(new Date(new Date().setHours(14, 0, 0, 0)), 3),
    endDate: addDays(new Date(new Date().setHours(15, 30, 0, 0)), 3),
    location: "Private Call",
    attendees: [
      { id: "1", name: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
      { id: "2", name: "Sarah Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    ],
    category: "meeting",
    isRecurring: false
  },
  {
    id: 4,
    title: "Hall of Fame Showcase",
    description: "Monthly showcase of the community's most outstanding achievements",
    date: addDays(new Date(new Date().setHours(16, 0, 0, 0)), 5),
    endDate: addDays(new Date(new Date().setHours(17, 30, 0, 0)), 5),
    location: "Hall of Fame Channel",
    attendees: [
      { id: "1", name: "John Smith", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John" },
      { id: "2", name: "Sarah Lee", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
      { id: "3", name: "Michael Brown", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael" },
      { id: "4", name: "Emma Wilson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
      { id: "9", name: "David Miller", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    ],
    category: "community",
    isRecurring: true,
    recurringDays: "Monthly"
  }
];

interface EventDetailProps {
  event: typeof upcomingEvents[0];
  onClose: () => void;
}

const EventDetail: React.FC<EventDetailProps> = ({ event, onClose }) => {
  const [attending, setAttending] = useState(false);
  
  const toggleAttendance = () => {
    setAttending(!attending);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-bold">{event.title}</h3>
          <p className="text-muted-foreground">{event.description}</p>
        </div>
        <Badge variant="outline" className={
          event.category === "community" 
            ? "bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200 dark:border-purple-800/30" 
            : event.category === "workshop"
            ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-800/30"
            : "bg-gray-100 text-gray-600 dark:bg-gray-900/30 dark:text-gray-400 border-gray-200 dark:border-gray-800/30"
        }>
          {event.category}
        </Badge>
      </div>
      
      <div className="space-y-3">
        <div className="flex items-center text-sm">
          <CalendarIcon size={16} className="mr-2 text-muted-foreground" />
          <span>
            {format(event.date, "EEEE, MMMM d, yyyy")}
            {event.isRecurring && ` (${event.recurringDays})`}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <Clock size={16} className="mr-2 text-muted-foreground" />
          <span>
            {format(event.date, "h:mm a")} - {format(event.endDate, "h:mm a")}
          </span>
        </div>
        <div className="flex items-center text-sm">
          <MapPin size={16} className="mr-2 text-muted-foreground" />
          <span>{event.location}</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <div className="flex items-center">
          <Users size={16} className="mr-2 text-muted-foreground" />
          <span className="text-sm font-medium">{event.attendees.length} Attendees</span>
        </div>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {event.attendees.slice(0, 5).map(attendee => (
            <Avatar key={attendee.id} className="h-8 w-8 border-2 border-background">
              <AvatarImage src={attendee.avatar} alt={attendee.name} />
              <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
            </Avatar>
          ))}
          {event.attendees.length > 5 && (
            <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs">
              +{event.attendees.length - 5}
            </div>
          )}
        </div>
      </div>
      
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
        <Button 
          onClick={toggleAttendance}
          className={attending ? "bg-red-100 hover:bg-red-200 text-red-600 border-red-200" : ""}
        >
          {attending ? "Cancel Attendance" : "Attend Event"}
        </Button>
      </DialogFooter>
    </div>
  );
};

const CalendarPanel: React.FC = () => {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<typeof upcomingEvents[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Function to get events for a specific day
  const getDayEvents = (day: Date | undefined) => {
    if (!day) return [];
    return upcomingEvents.filter(event => day && isSameDay(event.date, day));
  };
  
  // Get today's events
  const todayEvents = getDayEvents(new Date());
  
  // Get selected day's events
  const selectedDayEvents = getDayEvents(date);
  
  // Date with events highlighting function
  const dateWithEventsClass = (day: Date) => {
    const hasEvents = upcomingEvents.some(event => isSameDay(day, event.date));
    return hasEvents ? "bg-primary/10 text-primary font-medium rounded-full" : "";
  };
  
  return (
    <div id="calendar" className="h-full flex flex-col">
      <div className="px-6 py-4 border-b">
        <h1 className="text-2xl font-bold mb-1">Calendar</h1>
        <p className="text-muted-foreground">Manage and view your scheduled events</p>
      </div>
      
      <div className="flex flex-col md:flex-row h-full overflow-hidden">
        {/* Calendar sidebar */}
        <div className="w-full md:w-80 border-r p-4 bg-card/50">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="font-medium">Calendar</h2>
              <Dialog>
                <DialogTrigger asChild>
                  <Button size="sm" className="h-8">
                    <Plus size={14} className="mr-1" /> Add Event
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Add New Event</DialogTitle>
                    <DialogDescription>
                      Create a new event in your calendar
                    </DialogDescription>
                  </DialogHeader>
                  <div className="py-4">
                    <p className="text-center text-muted-foreground">Event creation form would go here</p>
                  </div>
                  <DialogFooter>
                    <Button variant="outline">Cancel</Button>
                    <Button>Create Event</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
            
            <Calendar
              mode="single"
              selected={date}
              onSelect={setDate}
              className="rounded-md border shadow-sm"
              modifiersClassNames={{
                today: "bg-primary text-primary-foreground",
              }}
              modifiersStyles={{
                selected: {
                  backgroundColor: "hsl(var(--primary))",
                  color: "hsl(var(--primary-foreground))",
                },
              }}
              components={{
                DayContent: (props) => (
                  <div className={`flex h-8 w-8 items-center justify-center ${dateWithEventsClass(props.date)}`}>
                    {props.date.getDate()}
                  </div>
                ),
              }}
            />
            
            <div>
              <h3 className="font-medium text-sm mb-2">Today's Events</h3>
              {todayEvents.length === 0 ? (
                <p className="text-xs text-muted-foreground">No events scheduled for today</p>
              ) : (
                <div className="space-y-2">
                  {todayEvents.map(event => (
                    <div 
                      key={event.id} 
                      className="p-2 rounded border bg-card hover:bg-card/80 cursor-pointer"
                      onClick={() => {
                        setSelectedEvent(event);
                        setIsDialogOpen(true);
                      }}
                    >
                      <p className="text-sm font-medium truncate">{event.title}</p>
                      <div className="flex items-center justify-between mt-1">
                        <span className="text-xs text-muted-foreground">
                          {format(event.date, "h:mm a")}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {event.category}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Main content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <Tabs defaultValue="day" className="h-full flex flex-col">
            <div className="px-4 pt-4 pb-2 flex items-center justify-between border-b">
              <div className="flex items-center">
                <Button variant="ghost" size="icon" className="mr-1">
                  <ChevronLeft size={16} />
                </Button>
                <Button variant="ghost" size="icon">
                  <ChevronRight size={16} />
                </Button>
                <h2 className="text-lg font-medium ml-2">
                  {date ? format(date, "MMMM d, yyyy") : "Today"}
                </h2>
              </div>
              <TabsList>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="day" className="flex-1 p-4 overflow-auto">
              {selectedDayEvents.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center mb-4">
                    <CalendarIcon size={32} className="text-muted-foreground" />
                  </div>
                  <h3 className="font-medium text-lg mb-2">No Events Scheduled</h3>
                  <p className="text-muted-foreground max-w-sm mb-6">
                    There are no events scheduled for this day. You can add a new event using the button below.
                  </p>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus size={16} className="mr-2" /> Add Event
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add New Event</DialogTitle>
                        <DialogDescription>
                          Create a new event in your calendar
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <p className="text-center text-muted-foreground">Event creation form would go here</p>
                      </div>
                      <DialogFooter>
                        <Button variant="outline">Cancel</Button>
                        <Button>Create Event</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              ) : (
                <div className="space-y-4">
                  {selectedDayEvents.map(event => (
                    <Card key={event.id} className="overflow-hidden">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{event.title}</CardTitle>
                            <CardDescription className="mt-1">{event.description}</CardDescription>
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal size={16} />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() => {
                                  setSelectedEvent(event);
                                  setIsDialogOpen(true);
                                }}
                              >
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>Edit Event</DropdownMenuItem>
                              <DropdownMenuItem className="text-red-500 focus:text-red-500 focus:bg-red-50 dark:focus:bg-red-950/20">
                                Delete Event
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center text-sm">
                            <Clock size={16} className="mr-2 text-muted-foreground" />
                            <span>{format(event.date, "h:mm a")} - {format(event.endDate, "h:mm a")}</span>
                          </div>
                          <div className="flex items-center text-sm">
                            <MapPin size={16} className="mr-2 text-muted-foreground" />
                            <span>{event.location}</span>
                          </div>
                          <div className="flex items-center text-sm mt-2">
                            <Users size={16} className="mr-2 text-muted-foreground" />
                            <div className="flex items-center">
                              <div className="flex -space-x-1.5 mr-2">
                                {event.attendees.slice(0, 3).map(attendee => (
                                  <Avatar key={attendee.id} className="h-6 w-6 border-2 border-background">
                                    <AvatarImage src={attendee.avatar} alt={attendee.name} />
                                    <AvatarFallback>{attendee.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                ))}
                              </div>
                              <span className="text-sm text-muted-foreground">
                                {event.attendees.length} attendees
                              </span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <Button 
                          className="w-full"
                          onClick={() => {
                            setSelectedEvent(event);
                            setIsDialogOpen(true);
                          }}
                        >
                          View Details
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="week" className="flex-1 p-4 overflow-auto">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">Weekly view would be displayed here</p>
              </div>
            </TabsContent>
            
            <TabsContent value="month" className="flex-1 p-4 overflow-auto">
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-muted-foreground">Monthly view would be displayed here</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      
      {/* Event detail dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Event Details</DialogTitle>
          </DialogHeader>
          {selectedEvent && <EventDetail event={selectedEvent} onClose={() => setIsDialogOpen(false)} />}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CalendarPanel;
