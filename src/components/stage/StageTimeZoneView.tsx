
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Globe, 
  Clock, 
  Users, 
  MapPin,
  Sun,
  Moon,
  Sunrise,
  Sunset
} from 'lucide-react';

interface TimeZoneData {
  name: string;
  city: string;
  country: string;
  offset: string;
  utcOffset: number;
  currentTime: Date;
  memberCount: number;
  isBusinessHours: boolean;
  icon: 'sun' | 'moon' | 'sunrise' | 'sunset';
}

interface StageTimeZoneViewProps {}

const StageTimeZoneView: React.FC<StageTimeZoneViewProps> = () => {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [selectedTimeZone, setSelectedTimeZone] = useState(
    Intl.DateTimeFormat().resolvedOptions().timeZone
  );
  const [compareTimeZone, setCompareTimeZone] = useState('America/New_York');

  const timeZones: TimeZoneData[] = [
    {
      name: 'America/Los_Angeles',
      city: 'Los Angeles',
      country: 'USA',
      offset: 'UTC-8',
      utcOffset: -8,
      currentTime: new Date(),
      memberCount: 23,
      isBusinessHours: true,
      icon: 'sun'
    },
    {
      name: 'America/New_York',
      city: 'New York',
      country: 'USA',
      offset: 'UTC-5',
      utcOffset: -5,
      currentTime: new Date(),
      memberCount: 45,
      isBusinessHours: true,
      icon: 'sun'
    },
    {
      name: 'Europe/London',
      city: 'London',
      country: 'UK',
      offset: 'UTC+0',
      utcOffset: 0,
      currentTime: new Date(),
      memberCount: 31,
      isBusinessHours: false,
      icon: 'sunset'
    },
    {
      name: 'Europe/Paris',
      city: 'Paris',
      country: 'France',
      offset: 'UTC+1',
      utcOffset: 1,
      currentTime: new Date(),
      memberCount: 18,
      isBusinessHours: false,
      icon: 'moon'
    },
    {
      name: 'Asia/Tokyo',
      city: 'Tokyo',
      country: 'Japan',
      offset: 'UTC+9',
      utcOffset: 9,
      currentTime: new Date(),
      memberCount: 12,
      isBusinessHours: false,
      icon: 'moon'
    },
    {
      name: 'Asia/Kolkata',
      city: 'Mumbai',
      country: 'India',
      offset: 'UTC+5:30',
      utcOffset: 5.5,
      currentTime: new Date(),
      memberCount: 67,
      isBusinessHours: false,
      icon: 'sunrise'
    },
    {
      name: 'Australia/Sydney',
      city: 'Sydney',
      country: 'Australia',
      offset: 'UTC+11',
      utcOffset: 11,
      currentTime: new Date(),
      memberCount: 8,
      isBusinessHours: true,
      icon: 'sun'
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const getTimeInTimeZone = (timeZone: string): Date => {
    const now = new Date();
    return new Date(now.toLocaleString('en-US', { timeZone }));
  };

  const getTimeDifference = (fromTimeZone: string, toTimeZone: string): string => {
    const fromTime = getTimeInTimeZone(fromTimeZone);
    const toTime = getTimeInTimeZone(toTimeZone);
    const diffMs = toTime.getTime() - fromTime.getTime();
    const diffHours = Math.round(diffMs / (1000 * 60 * 60));
    
    if (diffHours === 0) return 'Same time';
    if (diffHours > 0) return `+${diffHours}h ahead`;
    return `${Math.abs(diffHours)}h behind`;
  };

  const formatTime = (timeZone: string): string => {
    return getTimeInTimeZone(timeZone).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const formatDate = (timeZone: string): string => {
    return getTimeInTimeZone(timeZone).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getTimeIcon = (icon: TimeZoneData['icon']) => {
    switch (icon) {
      case 'sun': return <Sun className="h-4 w-4 text-yellow-500" />;
      case 'moon': return <Moon className="h-4 w-4 text-blue-400" />;
      case 'sunrise': return <Sunrise className="h-4 w-4 text-orange-400" />;
      case 'sunset': return <Sunset className="h-4 w-4 text-orange-600" />;
    }
  };

  const getMemberActivityLevel = (count: number): { level: string; color: string } => {
    if (count >= 50) return { level: 'Very Active', color: 'bg-green-500' };
    if (count >= 20) return { level: 'Active', color: 'bg-yellow-500' };
    if (count >= 10) return { level: 'Moderate', color: 'bg-orange-500' };
    return { level: 'Low', color: 'bg-gray-500' };
  };

  return (
    <div className="space-y-6">
      {/* Current Time Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Your Current Time
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-2">
            <div className="text-3xl font-mono font-bold">
              {formatTime(selectedTimeZone)}
            </div>
            <div className="text-muted-foreground">
              {formatDate(selectedTimeZone)} • {selectedTimeZone}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Time Zone Converter */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Time Zone Converter
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">From</label>
              <Select value={selectedTimeZone} onValueChange={setSelectedTimeZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz.name} value={tz.name}>
                      {tz.city}, {tz.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl font-mono font-bold">
                  {formatTime(selectedTimeZone)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(selectedTimeZone)}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">To</label>
              <Select value={compareTimeZone} onValueChange={setCompareTimeZone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz.name} value={tz.name}>
                      {tz.city}, {tz.country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="text-center p-3 bg-muted/30 rounded-lg">
                <div className="text-xl font-mono font-bold">
                  {formatTime(compareTimeZone)}
                </div>
                <div className="text-xs text-muted-foreground">
                  {formatDate(compareTimeZone)}
                </div>
              </div>
            </div>
          </div>

          <div className="text-center p-3 bg-primary/10 rounded-lg">
            <div className="font-medium">
              {getTimeDifference(selectedTimeZone, compareTimeZone)}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Global Community Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Global Community Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {timeZones.map((tz) => {
              const activity = getMemberActivityLevel(tz.memberCount);
              return (
                <Card key={tz.name} className="border-muted">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{tz.city}</span>
                        </div>
                        {getTimeIcon(tz.icon)}
                      </div>

                      <div className="space-y-1">
                        <div className="text-lg font-mono font-bold">
                          {formatTime(tz.name)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatDate(tz.name)} • {tz.offset}
                        </div>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${activity.color}`} />
                          <span className="text-sm">{tz.memberCount} members</span>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${tz.isBusinessHours ? 'border-green-500 text-green-700' : 'border-gray-400'}`}
                        >
                          {tz.isBusinessHours ? 'Business Hours' : 'Off Hours'}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground">
                        Activity: {activity.level}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Time Zone Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-1"
              onClick={() => {
                setSelectedTimeZone('America/New_York');
                setCompareTimeZone('Europe/London');
              }}
            >
              <span className="text-sm font-medium">US ↔ UK</span>
              <span className="text-xs text-muted-foreground">Business Call</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-1"
              onClick={() => {
                setSelectedTimeZone('Asia/Kolkata');
                setCompareTimeZone('America/Los_Angeles');
              }}
            >
              <span className="text-sm font-medium">India ↔ US</span>
              <span className="text-xs text-muted-foreground">Tech Meeting</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-1"
              onClick={() => {
                setSelectedTimeZone('Australia/Sydney');
                setCompareTimeZone('Asia/Tokyo');
              }}
            >
              <span className="text-sm font-medium">APAC</span>
              <span className="text-xs text-muted-foreground">Regional Sync</span>
            </Button>
            
            <Button 
              variant="outline" 
              className="h-auto py-3 flex flex-col gap-1"
              onClick={() => {
                setSelectedTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone);
                setCompareTimeZone('UTC');
              }}
            >
              <span className="text-sm font-medium">Local ↔ UTC</span>
              <span className="text-xs text-muted-foreground">Global Ref</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default StageTimeZoneView;
