
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useRole } from '@/contexts/RoleContext';
import RoleBasedComponent from '@/components/auth/RoleBasedComponent';
import { Plus, Calendar as CalendarIcon, Clock, Users, Tag } from 'lucide-react';
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
  type?: 'ama' | 'workshop' | 'fireside' | 'general';
}

interface CalendarPanelProps {
  isAdminView?: boolean;
}

const CalendarPanel: React.FC<CalendarPanelProps> = ({ isAdminView = false }) => {
  const { canManageCalendar, currentRole } = useRole();
  const [events, setEvents] = useState<CalendarEvent[]>([
    {
      id: '1',
      title: 'Community AMA Session',
      start: new Date(2024, 1, 15, 10, 0),
      end: new Date(2024, 1, 15, 11, 0),
      description: 'Ask me anything session with the community leaders',
      tags: ['AMA', 'Community'],
      attendees: 45,
      type: 'ama'
    },
    {
      id: '2',
      title: 'Web Development Workshop',
      start: new Date(2024, 1, 18, 14, 0),
      end: new Date(2024, 1, 18, 16, 0),
      description: 'Hands-on workshop covering React and modern web development',
      tags: ['Workshop', 'Development'],
      attendees: 25,
      type: 'workshop'
    },
    {
      id: '3',
      title: 'Fireside Chat with CEO',
      start: new Date(2024, 1, 22, 17, 0),
      end: new Date(2024, 1, 22, 18, 0),
      description: 'Casual conversation with our CEO about company vision',
      tags: ['Fireside', 'Leadership'],
      attendees: 80,
      type: 'fireside'
    }
  ]);

  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [view, setView] = useState<View>('month');

  const eventStyleGetter = (event: CalendarEvent) => {
    const colors = {
      ama: { backgroundColor: '#3B82F6', color: 'white' },
      workshop: { backgroundColor: '#10B981', color: 'white' },
      fireside: { backgroundColor: '#F59E0B', color: 'white' },
      general: { backgroundColor: '#6B7280', color: 'white' }
    };

    return {
      style: colors[event.type || 'general']
    };
  };

  const getTypeIcon = (type?: string) => {
    switch (type) {
      case 'ama': return '❓';
      case 'workshop': return '🔧';
      case 'fireside': return '🔥';
      default: return '📅';
    }
  };

  const handleViewChange = (newView: View) => {
    setView(newView);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {isAdminView ? 'Admin Calendar Management' : 'Community Calendar'}
          </h2>
          <p className="text-gray-600">
            {isAdminView ? 'Manage and organize community events' : 'Discover and view upcoming events'}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Controls */}
          <div className="flex bg-gray-100 rounded-lg p-1">
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

          {/* Add Event Button - Only for Admins */}
          <RoleBasedComponent allowedRoles={['admin']}>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Event
            </Button>
          </RoleBasedComponent>
        </div>
      </div>

      {/* Role Information */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              <div>
                <p className="font-medium text-blue-900">
                  {isAdminView 
                    ? 'Admin calendar management interface' 
                    : canManageCalendar 
                      ? 'You have full calendar management access' 
                      : 'You can view calendar events'}
                </p>
                <p className="text-sm text-blue-600">
                  Current role: <Badge className="ml-1 capitalize">{currentRole}</Badge>
                </p>
              </div>
            </div>
            
            {(canManageCalendar || isAdminView) && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Import Events
                </Button>
                <Button variant="outline" size="sm">
                  Export Calendar
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Calendar */}
      <Card>
        <CardContent className="p-0">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor={(event: CalendarEvent) => event.start}
            endAccessor={(event: CalendarEvent) => event.end}
            style={{ height: 600 }}
            view={view}
            onView={handleViewChange}
            onSelectEvent={setSelectedEvent}
            eventPropGetter={eventStyleGetter}
            className="p-4"
          />
        </CardContent>
      </Card>

      {/* Event Details Modal */}
      {selectedEvent && (
        <Card className="fixed inset-0 z-50 m-4 md:relative md:m-0">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{getTypeIcon(selectedEvent.type)}</span>
              <div>
                <CardTitle>{selectedEvent.title}</CardTitle>
                <p className="text-sm text-gray-600 mt-1">
                  {format(selectedEvent.start, 'PPP')} • {format(selectedEvent.start, 'p')} - {format(selectedEvent.end, 'p')}
                </p>
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSelectedEvent(null)}>
              ✕
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedEvent.description && (
              <p className="text-gray-700">{selectedEvent.description}</p>
            )}
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {Math.round((selectedEvent.end.getTime() - selectedEvent.start.getTime()) / (1000 * 60))} minutes
              </div>
              
              {selectedEvent.attendees && (
                <div className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {selectedEvent.attendees} attendees
                </div>
              )}
            </div>

            {selectedEvent.tags && (
              <div className="flex items-center gap-2">
                <Tag className="h-4 w-4 text-gray-500" />
                <div className="flex gap-1">
                  {selectedEvent.tags.map((tag, index) => (
                    <Badge key={index} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button className="flex-1">Join Event</Button>
              
              <RoleBasedComponent allowedRoles={['admin']}>
                <Button variant="outline">Edit</Button>
                <Button variant="outline">Delete</Button>
              </RoleBasedComponent>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default CalendarPanel;
