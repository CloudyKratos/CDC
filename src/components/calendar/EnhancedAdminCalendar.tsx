
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addDays, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  Clock, 
  Users, 
  Tag,
  Settings,
  Filter,
  Download,
  Upload,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  CheckCircle,
  XCircle,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  tags?: string[];
  attendees?: number;
  maxAttendees?: number;
  type?: 'stage' | 'meeting' | 'workshop' | 'webinar' | 'social';
  status?: 'scheduled' | 'live' | 'completed' | 'cancelled';
  creator?: string;
  location?: string;
  isRecurring?: boolean;
  visibility?: 'public' | 'private' | 'members';
}

interface EventStats {
  totalEvents: number;
  upcomingEvents: number;
  liveEvents: number;
  completedEvents: number;
  totalAttendees: number;
  averageAttendance: number;
}

export const EnhancedAdminCalendar: React.FC = () => {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');
  const [activeTab, setActiveTab] = useState('calendar');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [stats, setStats] = useState<EventStats>({
    totalEvents: 0,
    upcomingEvents: 0,
    liveEvents: 0,
    completedEvents: 0,
    totalAttendees: 0,
    averageAttendance: 0
  });

  // Sample events data
  useEffect(() => {
    const sampleEvents: CalendarEvent[] = [
      {
        id: '1',
        title: 'Weekly Team Standup',
        start: new Date(2024, 1, 15, 10, 0),
        end: new Date(2024, 1, 15, 11, 0),
        description: 'Weekly team synchronization and updates',
        tags: ['meeting', 'team'],
        attendees: 12,
        maxAttendees: 20,
        type: 'meeting',
        status: 'scheduled',
        creator: 'John Doe',
        location: 'Conference Room A',
        visibility: 'private'
      },
      {
        id: '2',
        title: 'Product Demo Stage',
        start: new Date(2024, 1, 18, 14, 0),
        end: new Date(2024, 1, 18, 15, 30),
        description: 'Interactive product demonstration with Q&A',
        tags: ['demo', 'product'],
        attendees: 85,
        maxAttendees: 100,
        type: 'stage',
        status: 'live',
        creator: 'Jane Smith',
        visibility: 'public'
      },
      {
        id: '3',
        title: 'Design Workshop',
        start: new Date(2024, 1, 22, 9, 0),
        end: new Date(2024, 1, 22, 12, 0),
        description: 'Hands-on design thinking workshop',
        tags: ['workshop', 'design'],
        attendees: 25,
        maxAttendees: 30,
        type: 'workshop',
        status: 'scheduled',
        creator: 'Mike Johnson',
        visibility: 'members'
      },
      {
        id: '4',
        title: 'Monthly All-Hands',
        start: new Date(2024, 1, 28, 16, 0),
        end: new Date(2024, 1, 28, 17, 0),
        description: 'Company-wide monthly meeting',
        tags: ['all-hands', 'company'],
        attendees: 150,
        maxAttendees: 200,
        type: 'webinar',
        status: 'completed',
        creator: 'CEO',
        isRecurring: true,
        visibility: 'public'
      }
    ];
    
    setEvents(sampleEvents);
    
    // Calculate stats
    const now = new Date();
    const totalEvents = sampleEvents.length;
    const upcomingEvents = sampleEvents.filter(e => e.start > now && e.status === 'scheduled').length;
    const liveEvents = sampleEvents.filter(e => e.status === 'live').length;
    const completedEvents = sampleEvents.filter(e => e.status === 'completed').length;
    const totalAttendees = sampleEvents.reduce((sum, e) => sum + (e.attendees || 0), 0);
    const averageAttendance = totalEvents > 0 ? Math.round(totalAttendees / totalEvents) : 0;
    
    setStats({
      totalEvents,
      upcomingEvents,
      liveEvents,
      completedEvents,
      totalAttendees,
      averageAttendance
    });
  }, []);

  const filteredEvents = events.filter(event => {
    const typeMatch = filterType === 'all' || event.type === filterType;
    const statusMatch = filterStatus === 'all' || event.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      stage: { backgroundColor: '#3B82F6', color: 'white' },
      meeting: { backgroundColor: '#10B981', color: 'white' },
      workshop: { backgroundColor: '#F59E0B', color: 'white' },
      webinar: { backgroundColor: '#8B5CF6', color: 'white' },
      social: { backgroundColor: '#EF4444', color: 'white' }
    };

    const statusStyles = {
      live: { border: '3px solid #10B981', boxShadow: '0 0 10px rgba(16, 185, 129, 0.5)' },
      cancelled: { opacity: 0.5, textDecoration: 'line-through' },
      completed: { opacity: 0.8 }
    };

    return {
      style: {
        ...colors[event.type || 'meeting'],
        ...statusStyles[event.status || 'scheduled']
      }
    };
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'live': return <Play className="h-4 w-4 text-green-500" />;
      case 'scheduled': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-gray-500" />;
      case 'cancelled': return <XCircle className="h-4 w-4 text-red-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'stage': return '🎭';
      case 'meeting': return '📅';
      case 'workshop': return '🔧';
      case 'webinar': return '📺';
      case 'social': return '🎉';
      default: return '📅';
    }
  };

  const handleEventAction = (action: string, eventId: string) => {
    const event = events.find(e => e.id === eventId);
    if (!event) return;

    switch (action) {
      case 'start':
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, status: 'live' as const } : e
        ));
        toast.success(`Started ${event.title}`);
        break;
      case 'end':
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, status: 'completed' as const } : e
        ));
        toast.success(`Ended ${event.title}`);
        break;
      case 'cancel':
        setEvents(prev => prev.map(e => 
          e.id === eventId ? { ...e, status: 'cancelled' as const } : e
        ));
        toast.success(`Cancelled ${event.title}`);
        break;
      case 'delete':
        setEvents(prev => prev.filter(e => e.id !== eventId));
        toast.success(`Deleted ${event.title}`);
        break;
    }
  };

  // Fixed accessor functions for react-big-calendar
  const startAccessor = (event: CalendarEvent) => event.start;
  const endAccessor = (event: CalendarEvent) => event.end;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Enhanced Calendar Management</h2>
          <p className="text-gray-600">Advanced event management and analytics</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm">
            <Upload className="h-4 w-4 mr-2" />
            Import
          </Button>
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Event
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalEvents}</p>
                <p className="text-sm text-gray-600">Total Events</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">{stats.upcomingEvents}</p>
                <p className="text-sm text-gray-600">Upcoming</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.liveEvents}</p>
                <p className="text-sm text-gray-600">Live Now</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-gray-600" />
              <div>
                <p className="text-2xl font-bold">{stats.completedEvents}</p>
                <p className="text-sm text-gray-600">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalAttendees}</p>
                <p className="text-sm text-gray-600">Total Attendees</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-indigo-600" />
              <div>
                <p className="text-2xl font-bold">{stats.averageAttendance}</p>
                <p className="text-sm text-gray-600">Avg Attendance</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-gray-500" />
              <span className="text-sm font-medium">Filters:</span>
            </div>
            
            <select 
              value={filterType} 
              onChange={(e) => setFilterType(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Types</option>
              <option value="stage">Stages</option>
              <option value="meeting">Meetings</option>
              <option value="workshop">Workshops</option>
              <option value="webinar">Webinars</option>
              <option value="social">Social</option>
            </select>
            
            <select 
              value={filterStatus} 
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-1 border rounded text-sm"
            >
              <option value="all">All Status</option>
              <option value="scheduled">Scheduled</option>
              <option value="live">Live</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <div className="flex bg-gray-100 rounded-lg p-1 ml-auto">
              {(['month', 'week', 'day'] as const).map((viewType) => (
                <Button
                  key={viewType}
                  variant={view === viewType ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setView(viewType)}
                  className="capitalize"
                >
                  {viewType}
                </Button>
              ))}
            </div>
          </div>

          {/* Calendar */}
          <Card>
            <CardContent className="p-0">
              <Calendar
                localizer={localizer}
                events={filteredEvents}
                startAccessor={startAccessor}
                endAccessor={endAccessor}
                style={{ height: 600 }}
                view={view}
                onView={setView}
                onSelectEvent={setSelectedEvent}
                eventPropGetter={eventStyleGetter}
                className="p-4"
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="list" className="space-y-4">
          <div className="space-y-3">
            {filteredEvents.map((event) => (
              <Card key={event.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl">{getTypeIcon(event.type)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          <Badge variant="outline" className="capitalize">
                            {event.type}
                          </Badge>
                          {getStatusIcon(event.status)}
                        </div>
                        <p className="text-sm text-gray-600 mt-1">
                          {format(event.start, 'PPP p')} - {format(event.end, 'p')}
                        </p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>👥 {event.attendees}/{event.maxAttendees} attendees</span>
                          <span>👤 {event.creator}</span>
                          {event.location && <span>📍 {event.location}</span>}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {event.status === 'scheduled' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction('start', event.id)}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      
                      {event.status === 'live' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEventAction('end', event.id)}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          End
                        </Button>
                      )}
                      
                      <Button variant="outline" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      <Button variant="outline" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleEventAction('delete', event.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="analytics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {['stage', 'meeting', 'workshop', 'webinar', 'social'].map((type) => {
                    const count = events.filter(e => e.type === type).length;
                    const percentage = events.length > 0 ? (count / events.length) * 100 : 0;
                    
                    return (
                      <div key={type} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span>{getTypeIcon(type)}</span>
                          <span className="capitalize">{type}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-24 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-8">{count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Attendance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600">{stats.averageAttendance}</div>
                    <div className="text-sm text-gray-600">Average Attendance</div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Attendance Rate</span>
                      <span>85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Engagement Score</span>
                      <span>92%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader className="flex flex-row items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{getTypeIcon(selectedEvent.type)}</span>
                <div>
                  <CardTitle>{selectedEvent.title}</CardTitle>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="capitalize">
                      {selectedEvent.type}
                    </Badge>
                    <Badge variant="outline">
                      {selectedEvent.status}
                    </Badge>
                    <Badge variant="outline">
                      {selectedEvent.visibility}
                    </Badge>
                  </div>
                </div>
              </div>
              <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
                ✕
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Start:</span>
                  <p>{format(selectedEvent.start, 'PPP p')}</p>
                </div>
                <div>
                  <span className="font-medium">End:</span>
                  <p>{format(selectedEvent.end, 'PPP p')}</p>
                </div>
                <div>
                  <span className="font-medium">Creator:</span>
                  <p>{selectedEvent.creator}</p>
                </div>
                <div>
                  <span className="font-medium">Attendees:</span>
                  <p>{selectedEvent.attendees}/{selectedEvent.maxAttendees}</p>
                </div>
              </div>
              
              {selectedEvent.description && (
                <div>
                  <span className="font-medium">Description:</span>
                  <p className="text-gray-700 mt-1">{selectedEvent.description}</p>
                </div>
              )}
              
              {selectedEvent.tags && selectedEvent.tags.length > 0 && (
                <div>
                  <span className="font-medium">Tags:</span>
                  <div className="flex gap-1 mt-1">
                    {selectedEvent.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <div className="flex gap-2 pt-4">
                <Button className="flex-1">Join Event</Button>
                <Button variant="outline">Edit</Button>
                <Button variant="outline">Clone</Button>
                <Button variant="destructive">Delete</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default EnhancedAdminCalendar;
