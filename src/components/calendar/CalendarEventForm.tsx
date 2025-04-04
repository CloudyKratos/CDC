
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarEvent } from "@/types/workspace";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, Clock, Users, Bell, Tag, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type EventType = "event" | "meeting" | "task" | "reminder" | "webinar" | "deadline";
type EventPriority = "low" | "medium" | "high";

interface CalendarEventFormProps {
  onSubmit: (event: CalendarEvent) => void;
  onCancel: () => void;
  initialEvent?: Partial<CalendarEvent>;
  mode?: "create" | "edit";
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  onSubmit,
  onCancel,
  initialEvent = {},
  mode = "create",
}) => {
  const [title, setTitle] = useState(initialEvent.title || "");
  const [date, setDate] = useState<Date>(initialEvent.date ? new Date(initialEvent.date) : new Date());
  const [description, setDescription] = useState(initialEvent.description || "");
  const [type, setType] = useState<EventType>(initialEvent.type as EventType || "event");
  const [location, setLocation] = useState(initialEvent.location || "");
  const [isAllDay, setIsAllDay] = useState(initialEvent.isAllDay || false);
  const [startTime, setStartTime] = useState(initialEvent.startTime || "09:00");
  const [endTime, setEndTime] = useState(initialEvent.endTime || "10:00");
  const [participants, setParticipants] = useState(initialEvent.participants || []);
  const [participantInput, setParticipantInput] = useState("");
  const [hasReminder, setHasReminder] = useState(initialEvent.reminder ? true : false);
  const [reminderTime, setReminderTime] = useState(initialEvent.reminder || "30");
  const [priority, setPriority] = useState<EventPriority>(initialEvent.priority as EventPriority || "medium");
  
  const isValid = title.trim() !== "";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) return;
    
    const newEvent: CalendarEvent = {
      id: initialEvent.id || `event-${Date.now()}`,
      title,
      date,
      description,
      type,
      location,
      isAllDay,
      startTime: isAllDay ? undefined : startTime,
      endTime: isAllDay ? undefined : endTime,
      participants,
      priority,
      ...(hasReminder ? { reminder: reminderTime } : {}),
    };
    
    onSubmit(newEvent);
  };

  const handleParticipantAdd = () => {
    if (participantInput.trim() === "") return;
    
    setParticipants([
      ...participants,
      { id: `participant-${Date.now()}`, name: participantInput.trim() }
    ]);
    setParticipantInput("");
  };

  const handleParticipantRemove = (id: string) => {
    setParticipants(participants.filter(participant => participant.id !== id));
  };

  const handleTypeChange = (value: string) => {
    setType(value as EventType);
  };

  const handlePriorityChange = (value: string) => {
    setPriority(value as EventPriority);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Event Title *</Label>
        <Input 
          id="title" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          placeholder="Enter event title" 
          required
          className="mt-1"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Date</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal mt-1",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div>
          <Label>Event Type</Label>
          <Select value={type} onValueChange={handleTypeChange}>
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select event type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="event">Event</SelectItem>
              <SelectItem value="meeting">Meeting</SelectItem>
              <SelectItem value="task">Task</SelectItem>
              <SelectItem value="reminder">Reminder</SelectItem>
              <SelectItem value="webinar">Webinar</SelectItem>
              <SelectItem value="deadline">Deadline</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="all-day">All Day</Label>
          <Switch 
            id="all-day"
            checked={isAllDay}
            onCheckedChange={setIsAllDay}
          />
        </div>
      </div>
      
      {!isAllDay && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="start-time">Start Time</Label>
            <div className="flex items-center mt-1">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="start-time" 
                type="time" 
                value={startTime} 
                onChange={(e) => setStartTime(e.target.value)}
              />
            </div>
          </div>
          <div>
            <Label htmlFor="end-time">End Time</Label>
            <div className="flex items-center mt-1">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <Input 
                id="end-time" 
                type="time" 
                value={endTime} 
                onChange={(e) => setEndTime(e.target.value)}
              />
            </div>
          </div>
        </div>
      )}

      <div>
        <Label htmlFor="location">Location</Label>
        <Input 
          id="location" 
          value={location} 
          onChange={(e) => setLocation(e.target.value)} 
          placeholder="Enter location (optional)"
          className="mt-1"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Enter event description (optional)"
          rows={3}
          className="mt-1"
        />
      </div>

      <div>
        <Label>Priority</Label>
        <Select value={priority} onValueChange={handlePriorityChange}>
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="has-reminder">Set Reminder</Label>
          <Switch 
            id="has-reminder"
            checked={hasReminder}
            onCheckedChange={setHasReminder}
          />
        </div>
        
        {hasReminder && (
          <div className="mt-2">
            <Select value={reminderTime} onValueChange={(value) => setReminderTime(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Reminder time" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 minutes before</SelectItem>
                <SelectItem value="15">15 minutes before</SelectItem>
                <SelectItem value="30">30 minutes before</SelectItem>
                <SelectItem value="60">1 hour before</SelectItem>
                <SelectItem value="1440">1 day before</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label>Participants</Label>
        <div className="flex mt-1">
          <Input 
            value={participantInput} 
            onChange={(e) => setParticipantInput(e.target.value)} 
            placeholder="Add participant"
            className="flex-1"
          />
          <Button 
            type="button" 
            variant="secondary" 
            onClick={handleParticipantAdd}
            className="ml-2"
          >
            Add
          </Button>
        </div>
        
        {participants.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {participants.map(participant => (
              <div 
                key={participant.id}
                className="bg-secondary text-secondary-foreground px-3 py-1 rounded-full flex items-center text-sm"
              >
                <Users className="h-3 w-3 mr-1" />
                <span>{participant.name}</span>
                <button 
                  type="button"
                  onClick={() => handleParticipantRemove(participant.id)}
                  className="ml-2 text-secondary-foreground/70 hover:text-secondary-foreground"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!isValid}>
          {mode === "create" ? "Create Event" : "Update Event"}
        </Button>
      </div>
    </form>
  );
};

export default CalendarEventForm;
