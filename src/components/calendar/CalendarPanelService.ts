
import { CalendarEventData } from '@/types/calendar-events';
import { EventData } from '@/services/SupabaseService';
import CalendarService from '@/services/CalendarService';
import { toast } from 'sonner';

export class CalendarPanelService {
  static async loadEvents(): Promise<CalendarEventData[]> {
    console.log('📅 CalendarPanelService: Loading events...');
    
    const eventsData = await CalendarService.getEvents();
    console.log('📅 CalendarPanelService: Events loaded:', eventsData.length);
    
    // Convert EnhancedEventData to CalendarEventData
    const calendarEvents: CalendarEventData[] = eventsData.map(event => ({
      id: event.id,
      title: event.title,
      description: event.description,
      start_time: event.start_time,
      end_time: event.end_time,
      event_type: event.event_type as CalendarEventData['event_type'],
      status: event.status as CalendarEventData['status'],
      max_attendees: event.max_attendees,
      is_recurring: event.is_recurring,
      recurrence_pattern: event.recurrence_pattern,
      tags: event.tags,
      cohort_id: event.cohort_id,
      coach_id: event.coach_id,
      replay_url: event.replay_url,
      meeting_url: event.meeting_url,
      resources: event.resources,
      visibility_level: event.visibility_level,
      xp_reward: event.xp_reward,
      created_by: event.created_by,
      workspace_id: event.workspace_id
    }));
    
    return calendarEvents;
  }

  static async createEvent(eventData: CalendarEventData): Promise<void> {
    console.log('📅 CalendarPanelService: Creating event:', eventData);
    
    // Convert CalendarEventData to EventData format for the service
    const eventPayload: EventData = {
      id: eventData.id,
      title: eventData.title,
      description: eventData.description || '',
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      event_type: eventData.event_type || 'mission_call',
      status: eventData.status || 'scheduled',
      max_attendees: eventData.max_attendees,
      is_recurring: eventData.is_recurring || false,
      recurrence_pattern: eventData.recurrence_pattern,
      tags: eventData.tags,
      cohort_id: eventData.cohort_id,
      coach_id: eventData.coach_id,
      replay_url: eventData.replay_url,
      meeting_url: eventData.meeting_url,
      resources: eventData.resources,
      visibility_level: eventData.visibility_level || 'public',
      xp_reward: eventData.xp_reward || 10,
      created_by: eventData.created_by || '',
      workspace_id: eventData.workspace_id
    };

    const createdEvent = await CalendarService.createEvent(eventPayload);
    
    if (createdEvent) {
      console.log('📅 CalendarPanelService: Event created successfully');
      toast.success('Event created successfully');
    } else {
      throw new Error('Failed to create event');
    }
  }

  static async updateEvent(id: string, eventData: CalendarEventData): Promise<void> {
    console.log('📅 CalendarPanelService: Updating event:', id, eventData);
    
    // Convert CalendarEventData to Partial<EventData> format for the service
    const eventPayload: Partial<EventData> = {
      title: eventData.title,
      description: eventData.description,
      start_time: eventData.start_time,
      end_time: eventData.end_time,
      event_type: eventData.event_type,
      status: eventData.status,
      max_attendees: eventData.max_attendees,
      is_recurring: eventData.is_recurring,
      recurrence_pattern: eventData.recurrence_pattern,
      tags: eventData.tags,
      cohort_id: eventData.cohort_id,
      coach_id: eventData.coach_id,
      replay_url: eventData.replay_url,
      meeting_url: eventData.meeting_url,
      resources: eventData.resources,
      visibility_level: eventData.visibility_level,
      xp_reward: eventData.xp_reward,
      workspace_id: eventData.workspace_id
    };

    const updatedEvent = await CalendarService.updateEvent(id, eventPayload);
    
    if (updatedEvent) {
      console.log('📅 CalendarPanelService: Event updated successfully');
      toast.success('Event updated successfully');
    } else {
      throw new Error('Failed to update event');
    }
  }

  static async deleteEvent(id: string): Promise<void> {
    console.log('📅 CalendarPanelService: Deleting event:', id);
    const success = await CalendarService.deleteEvent(id);
    
    if (success) {
      console.log('📅 CalendarPanelService: Event deleted successfully');
      toast.success('Event deleted successfully');
    } else {
      throw new Error('Failed to delete event');
    }
  }
}
