
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Mic, 
  Video,
  Globe,
  Plus,
  X
} from 'lucide-react';
import { format, addHours, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface StageSchedulerProps {
  onCreateStage: (stageData: {
    name: string;
    description?: string;
    scheduledTime?: Date;
    type: 'audio' | 'video';
    maxSpeakers?: number;
    isRecordingEnabled?: boolean;
  }) => void;
  canCreate: boolean;
}

interface TimeZoneInfo {
  name: string;
  offset: string;
  city: string;
}

const commonTimeZones: TimeZoneInfo[] = [
  { name: 'America/New_York', offset: 'UTC-5', city: 'New York' },
  { name: 'America/Los_Angeles', offset: 'UTC-8', city: 'Los Angeles' },
  { name: 'Europe/London', offset: 'UTC+0', city: 'London' },
  { name: 'Europe/Paris', offset: 'UTC+1', city: 'Paris' },
  { name: 'Asia/Tokyo', offset: 'UTC+9', city: 'Tokyo' },
  { name: 'Asia/Kolkata', offset: 'UTC+5:30', city: 'Mumbai' },
  { name: 'Australia/Sydney', offset: 'UTC+11', city: 'Sydney' },
];

const StageScheduler: React.FC<StageSchedulerProps> = ({ onCreateStage, canCreate }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    type: 'video' as 'audio' | 'video',
    maxSpeakers: 10,
    isRecordingEnabled: false,
  });
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [quickScheduleOptions] = useState([
    { label: 'In 1 hour', hours: 1 },
    { label: 'In 3 hours', hours: 3 },
    { label: 'Tomorrow same time', hours: 24 },
    { label: 'Next week', hours: 168 },
  ]);

  const handleQuickSchedule = (hours: number) => {
    const scheduledTime = addHours(new Date(), hours);
    setSelectedDate(scheduledTime);
    setSelectedTime(format(scheduledTime, 'HH:mm'));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCreate) {
      toast.error('You do not have permission to create stages');
      return;
    }

    if (!formData.name.trim()) {
      toast.error('Please enter a stage name');
      return;
    }

    let scheduledTime: Date | undefined;
    
    if (selectedDate && selectedTime) {
      const [hours, minutes] = selectedTime.split(':').map(Number);
      scheduledTime = new Date(selectedDate);
      scheduledTime.setHours(hours, minutes, 0, 0);
      
      // Convert to selected timezone
      const timeZoneOffset = new Date().getTimezoneOffset();
      const selectedOffset = getTimeZoneOffset(selectedTimeZone);
      const offsetDiff = selectedOffset - timeZoneOffset;
      scheduledTime = new Date(scheduledTime.getTime() + (offsetDiff * 60000));
    }

    onCreateStage({
      ...formData,
      scheduledTime,
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      type: 'video',
      maxSpeakers: 10,
      isRecordingEnabled: false,
    });
    setSelectedDate(undefined);
    setSelectedTime('');
  };

  const getTimeZoneOffset = (timeZone: string): number => {
    const now = new Date();
    const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
    const targetTime = new Date(utc.toLocaleString('en-US', { timeZone }));
    return (targetTime.getTime() - utc.getTime()) / 60000;
  };

  const formatTimeInTimeZone = (date: Date, timeZone: string): string => {
    return date.toLocaleString('en-US', {
      timeZone,
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const getScheduledDateTime = (): Date | null => {
    if (!selectedDate || !selectedTime) return null;
    
    const [hours, minutes] = selectedTime.split(':').map(Number);
    const dateTime = new Date(selectedDate);
    dateTime.setHours(hours, minutes, 0, 0);
    return dateTime;
  };

  return (
    <div className="space-y-6">
      {/* Quick Schedule Options */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Quick Schedule
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {quickScheduleOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                onClick={() => handleQuickSchedule(option.hours)}
                className="h-auto py-3 flex flex-col gap-1"
                disabled={!canCreate}
              >
                <span className="text-sm font-medium">{option.label}</span>
                <span className="text-xs text-muted-foreground">
                  {format(addHours(new Date(), option.hours), 'MMM d, h:mm a')}
                </span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Stage Creation Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create New Stage
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Stage Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter stage name..."
                  disabled={!canCreate}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Stage Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'audio' | 'video') => 
                    setFormData(prev => ({ ...prev, type: value }))
                  }
                  disabled={!canCreate}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">
                      <div className="flex items-center gap-2">
                        <Video className="h-4 w-4" />
                        Video + Audio
                      </div>
                    </SelectItem>
                    <SelectItem value="audio">
                      <div className="flex items-center gap-2">
                        <Mic className="h-4 w-4" />
                        Audio Only
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description (Optional)</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe what this stage is about..."
                disabled={!canCreate}
                rows={3}
              />
            </div>

            {/* Scheduling */}
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Schedule (Optional - leave empty to start immediately)
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal",
                          !selectedDate && "text-muted-foreground"
                        )}
                        disabled={!canCreate}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                        disabled={(date) => date < new Date()}
                        className="pointer-events-auto"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    type="time"
                    value={selectedTime}
                    onChange={(e) => setSelectedTime(e.target.value)}
                    disabled={!canCreate}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Time Zone</Label>
                  <Select
                    value={selectedTimeZone}
                    onValueChange={setSelectedTimeZone}
                    disabled={!canCreate}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {commonTimeZones.map((tz) => (
                        <SelectItem key={tz.name} value={tz.name}>
                          <div className="flex items-center justify-between w-full">
                            <span>{tz.city}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {tz.offset}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Time Preview */}
              {getScheduledDateTime() && (
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h5 className="font-medium mb-2 flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Time Zone Preview
                  </h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                    {commonTimeZones.slice(0, 6).map((tz) => (
                      <div key={tz.name} className="flex justify-between">
                        <span className="text-muted-foreground">{tz.city}:</span>
                        <span className="font-mono">
                          {formatTimeInTimeZone(getScheduledDateTime()!, tz.name)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Advanced Settings */}
            <Separator />
            
            <div className="space-y-4">
              <h4 className="font-medium flex items-center gap-2">
                <Users className="h-4 w-4" />
                Advanced Settings
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="maxSpeakers">Max Speakers</Label>
                  <Select
                    value={formData.maxSpeakers.toString()}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, maxSpeakers: parseInt(value) }))
                    }
                    disabled={!canCreate}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[5, 10, 15, 20, 25, 50].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} speakers
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Recording</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="recording"
                      checked={formData.isRecordingEnabled}
                      onChange={(e) => 
                        setFormData(prev => ({ ...prev, isRecordingEnabled: e.target.checked }))
                      }
                      disabled={!canCreate}
                      className="rounded"
                    />
                    <Label htmlFor="recording" className="text-sm">
                      Enable recording for this stage
                    </Label>
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex gap-3">
              <Button 
                type="submit" 
                disabled={!canCreate || !formData.name.trim()}
                className="flex-1"
              >
                {selectedDate && selectedTime ? 'Schedule Stage' : 'Create & Start Now'}
              </Button>
              
              {(selectedDate || selectedTime) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSelectedDate(undefined);
                    setSelectedTime('');
                  }}
                  disabled={!canCreate}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            {!canCreate && (
              <div className="text-sm text-muted-foreground text-center p-4 bg-muted/30 rounded-lg">
                You need admin or moderator permissions to create stage calls.
              </div>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default StageScheduler;
