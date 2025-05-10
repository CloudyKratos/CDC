import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CalendarEvent } from '@/types/calendar';
import { getEventTypeColor, getCalendarCells, addEventsToCalendar, filterEvents, groupEventsByDate } from '@/utils/calendarUtils';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { toast } from 'sonner';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import SupabaseService from '@/services/SupabaseService';
import type { EventData } from '@/services/SupabaseService';

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView = false }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [cells, setCells] = useState(getCalendarCells(currentDate));
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>([]);
  const [groupedEvents, setGroupedEvents] = useState<Record<string, CalendarEvent[]>>({});
  const [filters, setFilters] = useState({
    meeting: true,
    task: true,
    reminder: true,
    event: true,
    webinar: true,
    deadline: true,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddEventForm, setShowAddEventForm] = useState(false);
  const [showEditEventForm, setShowEditEventForm] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const { currentWorkspace } = useWorkspace();
  
  useEffect(() => {
    loadEvents();
  }, [currentDate, currentWorkspace]);
  
  useEffect(() => {
    const filtered = filterEvents(events, currentDate, filters, searchTerm);
    setFilteredEvents(filtered);
    setGroupedEvents(groupEventsByDate(filtered));
  }, [events, currentDate, filters, searchTerm]);
  
  useEffect(() => {
    const newCells = getCalendarCells(currentDate);
    const updatedCells = addEventsToCalendar(newCells, filteredEvents);
    setCells(updatedCells);
  }, [currentDate, filteredEvents]);
  
  const loadEvents = async () => {
    if (!currentWorkspace?.id) return;
    
    try {
      const eventsData = await SupabaseService.getEvents();
      
      // Convert start_time and end_time strings to Date objects
      const parsedEvents: CalendarEvent[] = eventsData.map(event => ({
        id: event.id || '',
        title: event.title,
        description: event.description || '',
        date: new Date(event.start_time),
        start: new Date(event.start_time),
        end: new Date(event.end_time),
        type: 'meeting', // Assuming default type
        priority: 'medium', // Required field with default value
        attendees: []
      }));
      
      setEvents(parsedEvents);
    } catch (error) {
      console.error('Error fetching events:', error);
      toast.error("Failed to load events");
    }
  };
  
  const handleDateChange = (date: Date | undefined) => {
    if (date) {
      setCurrentDate(date);
    }
  };
  
  const handleFilterChange = (type: string, checked: boolean) => {
    setFilters({ ...filters, [type]: checked });
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleAddEvent = async (formData: any) => {
    try {
      const newEvent: EventData = {
        title: formData.title,
        description: formData.description || null,
        // Convert dates to string format as required by our API
        start_time: formData.start_date.toISOString(),
        end_time: formData.end_date.toISOString(),
        workspace_id: currentWorkspace?.id || null
      };
      
      await SupabaseService.createEvent(newEvent);
      toast.success("Event added successfully");
      loadEvents();
      setShowAddEventForm(false);
    } catch (error) {
      console.error('Error adding event:', error);
      toast.error("Failed to add event");
    }
  };
  
  const handleEditEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setShowEditEventForm(true);
  };
  
  const handleUpdateEvent = async (formData: any) => {
    try {
      const updatedEvent: Partial<EventData> = {
        title: formData.title,
        description: formData.description || null,
        // Convert dates to string format as required by our API
        start_time: formData.start_date.toISOString(),
        end_time: formData.end_date.toISOString()
      };
      
      if (selectedEvent) {
        await SupabaseService.updateEvent(selectedEvent.id, updatedEvent);
        toast.success("Event updated successfully");
        loadEvents();
        setShowEditEventForm(false);
        setSelectedEvent(null);
      }
    } catch (error) {
      console.error('Error updating event:', error);
      toast.error("Failed to update event");
    }
  };
  
  const handleDeleteEvent = async (eventId: string) => {
    try {
      await SupabaseService.deleteEvent(eventId);
      toast.success("Event deleted successfully");
      loadEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      toast.error("Failed to delete event");
    }
  };
  
  return (
    <div className="flex h-full">
      {/* Calendar Section */}
      <div className="w-80 border-r p-4">
        <Card>
          <CardHeader>
            <CardTitle>Calendar</CardTitle>
            <CardDescription>Select a date to view events</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Calendar
              mode="single"
              selected={currentDate}
              onSelect={handleDateChange}
              className="rounded-md border"
            />
            <div className="space-y-2">
              <div className="text-sm font-medium">Filters</div>
              <div className="flex flex-col space-y-1">
                {Object.entries(filters).map(([type, checked]) => (
                  <label key={type} className="inline-flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => handleFilterChange(type, e.target.checked)}
                      className="h-4 w-4 rounded"
                    />
                    <span>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                  </label>
                ))}
              </div>
            </div>
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                type="search"
                id="search"
                placeholder="Search events..."
                onChange={handleSearchChange}
                className="mt-1"
              />
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button>Add Event</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add Event</DialogTitle>
                  <DialogDescription>
                    Create a new event to add to the calendar.
                  </DialogDescription>
                </DialogHeader>
                <AddEventForm onSubmit={handleAddEvent} />
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>
      
      {/* Events Section */}
      <div className="flex-1 p-4">
        <Card className="h-full">
          <CardHeader>
            <CardTitle>Events for {format(currentDate, 'MMMM dd, yyyy')}</CardTitle>
            <CardDescription>
              Here are the events for the selected date.
            </CardDescription>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ScrollArea className="h-full">
              {Object.keys(groupedEvents).length === 0 ? (
                <p className="text-center text-gray-500">No events for this date.</p>
              ) : (
                Object.entries(groupedEvents).map(([date, events]) => (
                  <div key={date} className="mb-4">
                    <h3 className="text-lg font-semibold mb-2">{format(new Date(date), 'EEEE, MMMM dd, yyyy')}</h3>
                    <div className="space-y-2">
                      {events.map((event) => (
                        <div key={event.id} className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Badge className={getEventTypeColor(event.type)}>{event.type}</Badge>
                            <span className="ml-2">{event.title}</span>
                          </div>
                          <div>
                            <Button size="sm" onClick={() => handleEditEvent(event)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteEvent(event.id)}>Delete</Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
      
      {/* Edit Event Dialog */}
      <Dialog open={showEditEventForm} onOpenChange={setShowEditEventForm}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Event</DialogTitle>
            <DialogDescription>
              Edit the selected event details.
            </DialogDescription>
          </DialogHeader>
          <EditEventForm
            event={selectedEvent}
            onSubmit={handleUpdateEvent}
            onCancel={() => {
              setShowEditEventForm(false);
              setSelectedEvent(null);
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

interface AddEventFormProps {
  onSubmit: (data: any) => void;
}

const AddEventForm: React.FC<AddEventFormProps> = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(new Date());
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    onSubmit({ title, description, start_date: startDate, end_date: endDate });
    setTitle('');
    setDescription('');
    setStartDate(new Date());
    setEndDate(new Date());
  };
  
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => date && setStartDate(date)}
            className="rounded-md border"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end_date">End Date</Label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => date && setEndDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>
      <Button type="submit">Add Event</Button>
    </form>
  );
};

interface EditEventFormProps {
  event: CalendarEvent | null;
  onSubmit: (data: any) => void;
  onCancel: () => void;
}

const EditEventForm: React.FC<EditEventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(event?.start || event?.date || new Date());
  const [endDate, setEndDate] = useState<Date | undefined>(event?.end || event?.date || new Date());
  
  useEffect(() => {
    if (event) {
      setTitle(event.title);
      setDescription(event.description);
      setStartDate(event.start || event.date);
      setEndDate(event.end || event.date);
    }
  }, [event]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !startDate || !endDate) {
      toast.error("Please fill in all fields.");
      return;
    }
    
    onSubmit({ title, description, start_date: startDate, end_date: endDate });
  };
  
  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="title">Title</Label>
        <Input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="grid gap-2">
          <Label htmlFor="start_date">Start Date</Label>
          <Calendar
            mode="single"
            selected={startDate}
            onSelect={(date) => date && setStartDate(date)}
            className="rounded-md border"
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="end_date">End Date</Label>
          <Calendar
            mode="single"
            selected={endDate}
            onSelect={(date) => date && setEndDate(date)}
            className="rounded-md border"
          />
        </div>
      </div>
      <div className="flex justify-between">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">Update Event</Button>
      </div>
    </form>
  );
};

export default CalendarPanel;
