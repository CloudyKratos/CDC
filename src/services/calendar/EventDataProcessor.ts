
import { EnhancedEventData } from './CalendarEventService';

export class EventDataProcessor {
  static processEventData(eventData: EnhancedEventData, userId: string): any {
    console.log('🔍 EventDataProcessor: Preparing event data...');
    
    const startTime = new Date(eventData.start_time).toISOString();
    const endTime = new Date(eventData.end_time).toISOString();
    
    console.log('📅 EventDataProcessor: Processed dates:', { startTime, endTime });

    const cleanEventData = {
      title: eventData.title.trim(),
      description: eventData.description?.trim() || '',
      start_time: startTime,
      end_time: endTime,
      event_type: eventData.event_type || 'mission_call',
      status: eventData.status || 'scheduled',
      visibility_level: eventData.visibility_level || 'public',
      xp_reward: Math.min(Math.max(eventData.xp_reward || 10, 0), 100),
      max_attendees: eventData.max_attendees && eventData.max_attendees > 0 ? eventData.max_attendees : null,
      is_recurring: eventData.is_recurring || false,
      tags: Array.isArray(eventData.tags) ? eventData.tags.filter(tag => tag.trim()) : [],
      meeting_url: eventData.meeting_url?.trim() || '',
      created_by: userId,
      workspace_id: null // Keep as null to avoid workspace issues
    };

    console.log('📋 EventDataProcessor: Final event data:', cleanEventData);
    return cleanEventData;
  }

  static processUpdateData(updates: Partial<EnhancedEventData>): any {
    const cleanUpdates = {
      ...updates,
      title: updates.title?.trim(),
      description: updates.description?.trim(),
      meeting_url: updates.meeting_url?.trim(),
      tags: Array.isArray(updates.tags) ? updates.tags.filter(tag => tag.trim()) : updates.tags,
      xp_reward: updates.xp_reward ? Math.min(Math.max(updates.xp_reward, 0), 100) : updates.xp_reward
    };

    return cleanUpdates;
  }
}
