
import React, { useState } from "react";
import { CalendarEvent, Attendee, Reminder } from "@/types/workspace";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { CalendarIcon, Clock, AlertTriangle, MapPin, Link2 } from "lucide-react";

export interface CalendarEventFormProps {
  onSubmit: (eventData: Partial<CalendarEvent>) => void;
  onCancel: () => void;
  event?: Partial<CalendarEvent>;
}

const defaultAttendees: Attendee[] = [
  { id: "1", name: "You", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You" },
];

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ onSubmit, onCancel, event }) => {
  const [title, setTitle] = useState(event?.title || "");
  const [date, setDate] = useState<Date | undefined>(
    event?.date ? (typeof event.date === 'string' ? new Date(event.date) : event.date) : new Date()
  );
  const [startTime, setStartTime] = useState(event?.startTime || "09:00");
  const [endTime, setEndTime] = useState(event?.endTime || "10:00");
  const [type, setType] = useState(event?.type || "meeting");
  const [description, setDescription] = useState(event?.description || "");
  const [priority, setPriority] = useState(event?.priority || "medium");
  const [location, setLocation] = useState(event?.location || "");
  const [url, setUrl] = useState(event?.url || "");
  const [isAllDay, setIsAllDay] = useState(event?.isAllDay || false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [attendees, setAttendees] = useState<Attendee[]>(event?.attendees || defaultAttendees);
  const [reminderType, setReminderType] = useState<string>(
    event?.reminder 
      ? (typeof event.reminder === 'string' 
          ? event.reminder 
          : event.reminder.type) 
      : "notification"
  );
  const [reminderTime, setReminderTime] = useState<string>(
    event?.reminder 
      ? (typeof event.reminder === 'string' 
          ? "15 minutes before" 
          : event.reminder.time) 
      : "15 minutes before"
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title || !date || !type || !priority) {
      return; // Form validation
    }
    
    const eventData: Partial<CalendarEvent> = {
      title,
      date,
      type: type as CalendarEvent["type"],
      description,
      priority: priority as CalendarEvent["priority"],
      attendees,
      isAllDay,
      reminder: {
        time: reminderTime,
        type: reminderType as "email" | "notification" | "sms"
      }
    };
    
    if (!isAllDay) {
      eventData.startTime = startTime;
      eventData.endTime = endTime;
    }
    
    if (location) eventData.location = location;
    if (url) eventData.url = url;
    
    onSubmit(eventData);
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <Input 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Event title" 
          required
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : "Select date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => {
                  setDate(date);
                  setShowDatePicker(false);
                }}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Type</label>
          <Select value={type} onValueChange={setType}>
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
      
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="allDay" 
          checked={isAllDay} 
          onCheckedChange={(checked) => setIsAllDay(checked as boolean)} 
        />
        <label htmlFor="allDay" className="text-sm font-medium">
          All day event
        </label>
      </div>
      
      {!isAllDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Start Time</label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-400" />
              <Input 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)} 
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">End Time</label>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-gray-400" />
              <Input 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)} 
              />
            </div>
          </div>
        </div>
      )}
      
      <div>
        <label className="block text-sm font-medium mb-1">Description</label>
        <Textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Add a description..." 
          className="min-h-[100px]"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">Priority</label>
          <Select value={priority} onValueChange={setPriority}>
            <SelectTrigger>
              <SelectValue placeholder="Select priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">
                <div className="flex items-center">
                  Low
                  <span className="ml-2 h-2 w-2 rounded-full bg-gray-400"></span>
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center">
                  Medium
                  <span className="ml-2 h-2 w-2 rounded-full bg-yellow-400"></span>
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center">
                  High
                  <span className="ml-2 h-2 w-2 rounded-full bg-red-500"></span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Reminder</label>
          <Select value={reminderType} onValueChange={setReminderType}>
            <SelectTrigger>
              <SelectValue placeholder="Reminder type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="notification">Notification</SelectItem>
              <SelectItem value="email">Email</SelectItem>
              <SelectItem value="sms">SMS</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">Reminder time</label>
        <Select value={reminderTime} onValueChange={setReminderTime}>
          <SelectTrigger>
            <SelectValue placeholder="When to remind" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="5 minutes before">5 minutes before</SelectItem>
            <SelectItem value="15 minutes before">15 minutes before</SelectItem>
            <SelectItem value="30 minutes before">30 minutes before</SelectItem>
            <SelectItem value="1 hour before">1 hour before</SelectItem>
            <SelectItem value="1 day before">1 day before</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      {(type === "meeting" || type === "event" || type === "webinar") && (
        <div>
          <label className="block text-sm font-medium mb-1">Location</label>
          <div className="flex items-center">
            <MapPin className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              value={location} 
              onChange={(e) => setLocation(e.target.value)} 
              placeholder="Add location..." 
            />
          </div>
        </div>
      )}
      
      {type === "webinar" && (
        <div>
          <label className="block text-sm font-medium mb-1">URL</label>
          <div className="flex items-center">
            <Link2 className="mr-2 h-4 w-4 text-gray-400" />
            <Input 
              value={url} 
              onChange={(e) => setUrl(e.target.value)} 
              placeholder="https://..." 
            />
          </div>
        </div>
      )}
      
      <div className="flex justify-end space-x-2 pt-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {event?.id ? "Update" : "Create"} Event
        </Button>
      </div>
    </form>
  );
};

export default CalendarEventForm;
