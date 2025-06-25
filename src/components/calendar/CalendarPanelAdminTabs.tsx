
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, Calendar as CalendarIcon, RefreshCw } from 'lucide-react';
import { CalendarEventData } from '@/types/calendar-events';
import AdminEventManagement from './AdminEventManagement';
import EnhancedCommunityCalendar from './EnhancedCommunityCalendar';

interface CalendarPanelAdminTabsProps {
  events: CalendarEventData[];
  isLoading: boolean;
  retryCount: number;
  onCreateEvent: (eventData: CalendarEventData) => Promise<void>;
  onUpdateEvent: (id: string, eventData: CalendarEventData) => Promise<void>;
  onDeleteEvent: (id: string) => Promise<void>;
}

export const CalendarPanelAdminTabs: React.FC<CalendarPanelAdminTabsProps> = ({
  events,
  isLoading,
  retryCount,
  onCreateEvent,
  onUpdateEvent,
  onDeleteEvent
}) => {
  return (
    <>
      {/* Loading State */}
      {isLoading && (
        <Alert className="border-blue-200 bg-blue-50">
          <RefreshCw className="h-4 w-4 animate-spin text-blue-600" />
          <AlertDescription className="text-blue-800">
            Refreshing calendar events... (Attempt #{retryCount + 1})
          </AlertDescription>
        </Alert>
      )}

      {/* Admin Interface */}
      <Tabs defaultValue="manage" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Event Management
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            Community View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <AdminEventManagement
            events={events}
            onCreateEvent={onCreateEvent}
            onUpdateEvent={onUpdateEvent}
            onDeleteEvent={onDeleteEvent}
            isLoading={isLoading}
          />
        </TabsContent>

        <TabsContent value="calendar">
          <EnhancedCommunityCalendar />
        </TabsContent>
      </Tabs>
    </>
  );
};
