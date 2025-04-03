
import React, { useState } from 'react';
import { format } from 'date-fns';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CalendarEvent } from '@/utils/calendarUtils';
import { CalendarIcon, Clock, MapPin, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

const formSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  date: z.date({
    required_error: 'Event date is required',
  }),
  type: z.enum(['meeting', 'task', 'reminder', 'event', 'webinar', 'deadline']),
  description: z.string().optional(),
  startTime: z.string().optional(),
  endTime: z.string().optional(),
  location: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  reminder: z.object({
    time: z.number().optional(),
    unit: z.enum(['minutes', 'hours', 'days']).optional(),
  }).optional(),
  url: z.string().url().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CalendarEventFormProps {
  event?: CalendarEvent;
  onSubmit: (event: Partial<CalendarEvent>) => void;
  onCancel: () => void;
}

const CalendarEventForm: React.FC<CalendarEventFormProps> = ({ event, onSubmit, onCancel }) => {
  const [attendees, setAttendees] = useState<string>('');
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: event?.title || '',
      date: event?.date ? (typeof event.date === 'string' ? new Date(event.date) : event.date) : new Date(),
      type: event?.type || 'event',
      description: event?.description || '',
      startTime: event?.startTime || '',
      endTime: event?.endTime || '',
      location: event?.location || '',
      priority: event?.priority || 'medium',
      url: event?.url || '',
    },
  });

  const handleSubmit = (values: FormValues) => {
    const attendeesList = attendees
      .split(',')
      .map(name => name.trim())
      .filter(name => name.length > 0)
      .map((name, index) => ({
        id: `attendee-${index}`,
        name,
      }));

    onSubmit({
      ...values,
      attendees: attendeesList.length > 0 ? attendeesList : undefined,
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Event Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter event title" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date *</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Type *</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select event type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="event">Event</SelectItem>
                    <SelectItem value="webinar">Webinar</SelectItem>
                    <SelectItem value="deadline">Deadline</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-gray-500" />
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter event description" 
                  className="resize-none min-h-[100px]" 
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-2 text-gray-500" />
                <FormControl>
                  <Input placeholder="Enter location" {...field} />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div>
          <Label htmlFor="attendees">Attendees (comma-separated)</Label>
          <div className="flex items-center">
            <Users className="w-4 h-4 mr-2 text-gray-500" />
            <Input
              id="attendees"
              placeholder="John Doe, Jane Smith"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="priority"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Priority</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-1"
                >
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="low" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Low
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="medium" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      Medium
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-1 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="high" />
                    </FormControl>
                    <FormLabel className="font-normal cursor-pointer">
                      High
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="url"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL</FormLabel>
              <FormControl>
                <Input placeholder="https://..." {...field} />
              </FormControl>
              <FormDescription>
                Optional: Add a relevant URL for online events
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end space-x-2">
          <Button variant="outline" type="button" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {event ? 'Update Event' : 'Create Event'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default CalendarEventForm;
