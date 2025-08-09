
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Calendar, Users, Zap, Clock, TrendingUp, Activity } from 'lucide-react';
import { useRole } from '@/contexts/RoleContext';
import CommunityCalendarView from './CommunityCalendarView';
import { useCalendarEvents } from '@/hooks/useCalendarEvents';
import { format, isToday, isTomorrow, addDays } from 'date-fns';
import { getEventTypeConfig } from '@/utils/calendarHelpers';

const EnhancedCommunityCalendar: React.FC = () => {
  const { canManageCalendar, currentRole } = useRole();
  const { events, isLoading } = useCalendarEvents();
  const [activeTab, setActiveTab] = useState('calendar');

  // Calculate statistics
  const todayEvents = events.filter(event => isToday(new Date(event.start_time)));
  const tomorrowEvents = events.filter(event => isTomorrow(new Date(event.start_time)));
  const thisWeekEvents = events.filter(event => {
    const eventDate = new Date(event.start_time);
    const weekFromNow = addDays(new Date(), 7);
    return eventDate >= new Date() && eventDate <= weekFromNow;
  });
  const liveEvents = events.filter(event => event.status === 'live');

  const popularEventTypes = events.reduce((acc, event) => {
    if (event.event_type) {
      acc[event.event_type] = (acc[event.event_type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);

  const topEventTypes = Object.entries(popularEventTypes)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      {/* Hero Section - Enhanced mobile responsiveness */}
      <div className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative p-4 sm:p-6 lg:p-8 text-center">
          <div className="max-w-4xl mx-auto space-y-3 sm:space-y-4 lg:space-y-6">
            <h1 className="text-2xl sm:text-3xl lg:text-5xl font-bold tracking-tight">
              Community Calendar
            </h1>
            <p className="text-sm sm:text-lg lg:text-xl text-white/90 max-w-2xl mx-auto px-2">
              Discover, join, and engage with community events happening around you. 
              Stay connected and never miss out on what matters most.
            </p>
            
            {/* Quick Stats - Mobile optimized grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:gap-4 mt-4 sm:mt-6 lg:mt-8 max-w-3xl mx-auto">
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">{events.length}</div>
                <div className="text-xs sm:text-sm text-white/80">Total Events</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold text-red-300">{liveEvents.length}</div>
                <div className="text-xs sm:text-sm text-white/80">Live Now</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">{todayEvents.length}</div>
                <div className="text-xs sm:text-sm text-white/80">Today</div>
              </div>
              <div className="bg-white/10 backdrop-blur-lg rounded-lg p-3 sm:p-4 text-center">
                <div className="text-xl sm:text-2xl font-bold">{thisWeekEvents.length}</div>
                <div className="text-xs sm:text-sm text-white/80">This Week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Enhanced mobile layout */}
      <div className="max-w-7xl mx-auto p-3 sm:p-4 lg:p-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-3 sm:space-y-4 lg:space-y-6">
          <div className="flex flex-col items-start gap-3 sm:gap-4">
            <TabsList className="grid w-full max-w-md grid-cols-3 h-10 sm:h-auto">
              <TabsTrigger value="calendar" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Calendar</span>
              </TabsTrigger>
              <TabsTrigger value="insights" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Insights</span>
              </TabsTrigger>
              <TabsTrigger value="activity" className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm">
                <Activity className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden xs:inline">Activity</span>
              </TabsTrigger>
            </TabsList>

            {canManageCalendar && (
              <Badge variant="outline" className="bg-blue-50 text-blue-700 text-xs sm:text-sm">
                Admin Access
              </Badge>
            )}
          </div>

          <TabsContent value="calendar">
            <CommunityCalendarView />
          </TabsContent>

          <TabsContent value="insights" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Event Types Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Zap className="h-5 w-5 text-yellow-500" />
                    Popular Event Types
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {topEventTypes.map(([type, count]) => {
                      const config = getEventTypeConfig(type);
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{config.icon}</span>
                            <span className="text-sm font-medium capitalize">
                              {type.replace('_', ' ')}
                            </span>
                          </div>
                          <Badge variant="secondary">{count}</Badge>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Today's Highlights */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5 text-blue-500" />
                    Today's Events
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {todayEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No events scheduled for today
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {todayEvents.slice(0, 3).map(event => {
                        const config = getEventTypeConfig(event.event_type);
                        return (
                          <div key={event.id} className="flex items-center gap-2 p-2 bg-muted/50 rounded">
                            <span>{config.icon}</span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{event.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {format(new Date(event.start_time), 'h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Community Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-green-500" />
                    Community Engagement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Events This Month</span>
                      <span className="font-bold">{events.length}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Average per Week</span>
                      <span className="font-bold">{Math.ceil(events.length / 4)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Most Active Day</span>
                      <span className="font-bold">Wednesday</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4 md:space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
              {/* Recent Activity */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {events.slice(0, 5).map(event => {
                      const config = getEventTypeConfig(event.event_type);
                      return (
                        <div key={event.id} className="flex items-start gap-3 p-3 bg-muted/30 rounded-lg">
                          <span className="text-lg">{config.icon}</span>
                          <div className="flex-1">
                            <h4 className="font-medium">{event.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(event.start_time), 'MMM d, yyyy • h:mm a')}
                            </p>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="outline" className="text-xs">
                                {event.event_type?.replace('_', ' ')}
                              </Badge>
                              <Badge variant={event.status === 'live' ? 'default' : 'secondary'} className="text-xs">
                                {event.status}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              {/* Upcoming This Week */}
              <Card>
                <CardHeader>
                  <CardTitle>This Week's Schedule</CardTitle>
                </CardHeader>
                <CardContent>
                  {thisWeekEvents.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No events scheduled for this week
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {thisWeekEvents.slice(0, 5).map(event => {
                        const config = getEventTypeConfig(event.event_type);
                        return (
                          <div key={event.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                            <span className="text-lg">{config.icon}</span>
                            <div className="flex-1">
                              <h4 className="font-medium">{event.title}</h4>
                              <p className="text-sm text-muted-foreground">
                                {format(new Date(event.start_time), 'EEEE, MMM d • h:mm a')}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default EnhancedCommunityCalendar;
