
import { CalendarEventData } from '@/types/calendar-events';

export class EventDataProcessor {
  static processEventData(eventData: CalendarEventData, userId: string): any {
    const processedData = {
      title: eventData.title.trim(),
      description: eventData.description?.trim() || null,
      start_time: new Date(eventData.start_time).toISOString(),
      end_time: new Date(eventData.end_time).toISOString(),
      event_type: eventData.event_type || 'mission_call',
      status: eventData.status || 'scheduled',
      max_attendees: eventData.max_attendees || null,
      is_recurring: eventData.is_recurring || false,
      recurrence_pattern: eventData.recurrence_pattern || null,
      tags: eventData.tags || [],
      cohort_id: eventData.cohort_id || null,
      coach_id: eventData.coach_id || null,
      replay_url: eventData.replay_url?.trim() || null,
      meeting_url: eventData.meeting_url?.trim() || null,
      resources: eventData.resources || null,
      visibility_level: eventData.visibility_level || 'public',
      xp_reward: eventData.xp_reward || 10,
      created_by: userId,
      workspace_id: eventData.workspace_id || null
    };

    // Remove any undefined values
    Object.keys(processedData).forEach(key => {
      if (processedData[key] === undefined) {
        delete processedData[key];
      }
    });

    return processedData;
  }

  static processUpdateData(updates: Partial<CalendarEventData>): any {
    const processedUpdates: any = {};

    if (updates.title !== undefined) {
      processedUpdates.title = updates.title.trim();
    }

    if (updates.description !== undefined) {
      processedUpdates.description = updates.description?.trim() || null;
    }

    if (updates.start_time !== undefined) {
      processedUpdates.start_time = new Date(updates.start_time).toISOString();
    }

    if (updates.end_time !== undefined) {
      processedUpdates.end_time = new Date(updates.end_time).toISOString();
    }

    if (updates.event_type !== undefined) {
      processedUpdates.event_type = updates.event_type;
    }

    if (updates.status !== undefined) {
      processedUpdates.status = updates.status;
    }

    if (updates.max_attendees !== undefined) {
      processedUpdates.max_attendees = updates.max_attendees;
    }

    if (updates.is_recurring !== undefined) {
      processedUpdates.is_recurring = updates.is_recurring;
    }

    if (updates.recurrence_pattern !== undefined) {
      processedUpdates.recurrence_pattern = updates.recurrence_pattern;
    }

    if (updates.tags !== undefined) {
      processedUpdates.tags = updates.tags;
    }

    if (updates.cohort_id !== undefined) {
      processedUpdates.cohort_id = updates.cohort_id;
    }

    if (updates.coach_id !== undefined) {
      processedUpdates.coach_id = updates.coach_id;
    }

    if (updates.replay_url !== undefined) {
      processedUpdates.replay_url = updates.replay_url?.trim() || null;
    }

    if (updates.meeting_url !== undefined) {
      processedUpdates.meeting_url = updates.meeting_url?.trim() || null;
    }

    if (updates.resources !== undefined) {
      processedUpdates.resources = updates.resources;
    }

    if (updates.visibility_level !== undefined) {
      processedUpdates.visibility_level = updates.visibility_level;
    }

    if (updates.xp_reward !== undefined) {
      processedUpdates.xp_reward = updates.xp_reward;
    }

    if (updates.workspace_id !== undefined) {
      processedUpdates.workspace_id = updates.workspace_id;
    }

    // Add updated_at timestamp
    processedUpdates.updated_at = new Date().toISOString();

    return processedUpdates;
  }
}
