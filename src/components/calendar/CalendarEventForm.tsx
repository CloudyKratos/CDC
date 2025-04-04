
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Clock, MapPin, Users, Link2, BellRing } from 'lucide-react';
import { format } from 'date-fns';
import { CalendarEvent, Reminder } from '@/types/workspace';
import { cn } from '@/lib/utils';

interface CalendarEventFormProps {
  event?: Partial<CalendarEvent>;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  event,
  onSubmit,
  onCancel
}) => {
  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [date, setDate] = useState<Date | undefined>(
    event?.date instanceof Date ? event.date : new Date()
  );
  const [startTime, setStartTime] = useState(event?.startTime || '');
  const [endTime, setEndTime] = useState(event?.endTime || '');
  const [location, setLocation] = useState(event?.location || '');
  const [url, setUrl] = useState(event?.url || '');
  const [type, setType] = useState(event?.type || 'event');
  const [priority, setPriority] = useState(event?.priority || 'medium');
  const [reminderTime, setReminderTime] = useState<number | undefined>(
    event?.reminder?.time
  );
  const [reminderUnit, setReminderUnit] = useState<"minutes" | "hours" | "days">(
    event?.reminder?.unit || "minutes"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const formData: Partial<CalendarEvent> = {
      title,
      description,
      date: date || new Date(),
      startTime,
      endTime,
      location,
      url,
      type: type as "meeting" | "task" | "reminder" | "event" | "webinar" | "deadline",
      priority: priority as "high" | "medium" | "low",
      attendees: event?.attendees || [],
    };
    
    // Only add reminder if both time and unit are set
    if (reminderTime !== undefined) {
      formData.reminder = {
        time: reminderTime,
        unit: reminderUnit
      };
    }
    
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title">Title *</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          required
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description"
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Date *</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label>Type</Label>
          <Select
            value={type}
            onValueChange={(value) => setType(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startTime">Start Time</Label>
          <div className="flex items-center">
            <Clock className="mr-2 h-4 w-4 text-gray-500" />
            <Input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </div>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="endTime">End Time</Label>
          <Input
            id="endTime"
            type="time"
            value={endTime}
            onChange={(e) => setEndTime(e.target.value)}
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="location">Location</Label>
        <div className="flex items-center">
          <MapPin className="mr-2 h-4 w-4 text-gray-500" />
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Add location"
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="url">URL</Label>
        <div className="flex items-center">
          <Link2 className="mr-2 h-4 w-4 text-gray-500" />
          <Input
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Add URL"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Priority</Label>
          <Select
            value={priority}
            onValueChange={(value) => setPriority(value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label>Reminder</Label>
          <div className="flex gap-2">
            <Input
              type="number"
              min="1"
              value={reminderTime !== undefined ? reminderTime : ''}
              onChange={(e) => setReminderTime(e.target.value ? parseInt(e.target.value) : undefined)}
              placeholder="Time"
              className="w-1/2"
            />
            <Select
              value={reminderUnit}
              onValueChange={(value: "minutes" | "hours" | "days") => setReminderUnit(value)}
            >
              <SelectTrigger className="w-1/2">
                <SelectValue placeholder="Unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="minutes">Minutes</SelectItem>
                <SelectItem value="hours">Hours</SelectItem>
                <SelectItem value="days">Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {event?.id ? 'Update Event' : 'Create Event'}
        </Button>
      </div>
    </form>
  );
};

export default CalendarEventForm;
