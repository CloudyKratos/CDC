import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarEvent } from '@/types/calendar'; // Updated import
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Calendar as CalendarIcon, Clock, MapPin, Trash2 } from 'lucide-react';
import { TimePickerDemo } from '@/components/ui/time-picker-demo';

interface CalendarEventFormProps {
  event: CalendarEvent;
  onSubmit: (eventData: Partial<CalendarEvent>) => Promise<void>;
  onCancel: () => void;
  onDelete: () => Promise<void>;
  isReadOnly?: boolean;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({
  event,
  onSubmit,
  onCancel,
  onDelete,
  isReadOnly = false
}) => {
  const [title, setTitle] = useState(event.title);
  const [description, setDescription] = useState(event.description || '');
  const [startDate, setStartDate] = useState<Date | undefined>(event.start);
  const [endDate, setEndDate] = useState<Date | undefined>(event.end);
  const [location, setLocation] = useState(event.location || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!startDate || !endDate) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await onSubmit({
        ...event,
        title,
        description,
        start: startDate,
        end: endDate,
        location
      });
    } catch (error) {
      console.error("Error submitting event:", error);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleDelete = async () => {
    if (!event.id) return;
    
    const confirmed = window.confirm("Are you sure you want to delete this event?");
    if (!confirmed) return;
    
    setIsDeleting(true);
    
    try {
      await onDelete();
    } catch (error) {
      console.error("Error deleting event:", error);
    } finally {
      setIsDeleting(false);
    }
  };
  
  // Convert date objects to time strings for input
  const getTimeString = (date: Date) => {
    return format(date, 'HH:mm');
  };
  
  // Update the time part of a date
  const updateTimeOfDate = (date: Date, timeString: string) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours);
    newDate.setMinutes(minutes);
    return newDate;
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4 pt-4">
      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Event title"
          required
          className="mt-1"
          disabled={isSubmitting || isReadOnly}
        />
      </div>
      
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Event description"
          className="mt-1"
          rows={3}
          disabled={isSubmitting || isReadOnly}
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <div className="flex mt-1 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !startDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting || isReadOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  disabled={isSubmitting || isReadOnly}
                />
              </PopoverContent>
            </Popover>
            
            <Input 
              type="time"
              value={startDate ? getTimeString(startDate) : '00:00'}
              onChange={(e) => {
                if (startDate) {
                  setStartDate(updateTimeOfDate(startDate, e.target.value));
                }
              }}
              className="w-20"
              disabled={isSubmitting || isReadOnly}
            />
          </div>
        </div>
        
        <div>
          <Label>End Date</Label>
          <div className="flex mt-1 gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !endDate && "text-muted-foreground"
                  )}
                  disabled={isSubmitting || isReadOnly}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {endDate ? format(endDate, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={endDate}
                  onSelect={setEndDate}
                  initialFocus
                  disabled={isSubmitting || isReadOnly}
                />
              </PopoverContent>
            </Popover>
            
            <Input 
              type="time"
              value={endDate ? getTimeString(endDate) : '00:00'}
              onChange={(e) => {
                if (endDate) {
                  setEndDate(updateTimeOfDate(endDate, e.target.value));
                }
              }}
              className="w-20"
              disabled={isSubmitting || isReadOnly}
            />
          </div>
        </div>
      </div>
      
      <div>
        <Label htmlFor="location">Location</Label>
        <div className="relative mt-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <Input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Location"
            className="pl-10"
            disabled={isSubmitting || isReadOnly}
          />
        </div>
      </div>
      
      <div className="flex justify-between pt-4">
        {event.id && !isReadOnly && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={isSubmitting || isDeleting}
            className="gap-1"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        )}
        
        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting || isDeleting}
          >
            {isReadOnly ? 'Close' : 'Cancel'}
          </Button>
          
          {!isReadOnly && (
            <Button 
              type="submit" 
              disabled={isSubmitting || isDeleting || !title || !startDate || !endDate}
              className="bg-primary text-white"
            >
              {isSubmitting ? 'Saving...' : event.id ? 'Update Event' : 'Create Event'}
            </Button>
          )}
        </div>
      </div>
    </form>
  );
};

export default CalendarEventForm;
