
export class EventDataProcessor {
  static processEventData(eventData: any, userId: string): any {
    console.log('🔍 EventDataProcessor: Preparing event data...');
    
    // Process dates
    const startTime = new Date(eventData.start_time).toISOString();
    const endTime = new Date(eventData.end_time).toISOString();
    
    console.log('📅 EventDataProcessor: Processed dates:', {
      startTime,
      endTime
    });

    // Clean and prepare the event data
    const cleanData = {
      title: eventData.title?.trim(),
      description: eventData.description?.trim() || '',
      start_time: startTime,
      end_time: endTime,
      event_type: eventData.event_type || 'mission_call',
      status: 'scheduled',
      visibility_level: eventData.visibility_level || 'public',
      xp_reward: eventData.xp_reward || 10,
      max_attendees: eventData.max_attendees || null,
      is_recurring: eventData.is_recurring || false,
      tags: eventData.tags || [],
      meeting_url: eventData.meeting_url?.trim() || '',
      created_by: userId,
      // Remove workspace_id completely to avoid RLS conflicts
      workspace_id: null
    };

    console.log('📋 EventDataProcessor: Final event data:', cleanData);
    return cleanData;
  }

  static processUpdateData(updates: any): any {
    console.log('🔧 EventDataProcessor: Processing update data...');
    
    const cleanUpdates: any = {};
    
    // Only include fields that are actually being updated
    if (updates.title !== undefined) cleanUpdates.title = updates.title?.trim();
    if (updates.description !== undefined) cleanUpdates.description = updates.description?.trim() || '';
    if (updates.start_time !== undefined) cleanUpdates.start_time = new Date(updates.start_time).toISOString();
    if (updates.end_time !== undefined) cleanUpdates.end_time = new Date(updates.end_time).toISOString();
    if (updates.event_type !== undefined) cleanUpdates.event_type = updates.event_type;
    if (updates.visibility_level !== undefined) cleanUpdates.visibility_level = updates.visibility_level;
    if (updates.xp_reward !== undefined) cleanUpdates.xp_reward = updates.xp_reward;
    if (updates.max_attendees !== undefined) cleanUpdates.max_attendees = updates.max_attendees;
    if (updates.is_recurring !== undefined) cleanUpdates.is_recurring = updates.is_recurring;
    if (updates.tags !== undefined) cleanUpdates.tags = updates.tags;
    if (updates.meeting_url !== undefined) cleanUpdates.meeting_url = updates.meeting_url?.trim() || '';
    
    // Always add updated timestamp
    cleanUpdates.updated_at = new Date().toISOString();
    
    console.log('✅ EventDataProcessor: Cleaned update data:', cleanUpdates);
    return cleanUpdates;
  }
}
