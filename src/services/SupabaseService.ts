
// Fix the getWorkspaceMembers function to handle profiles properly
async function getWorkspaceMembers(workspaceId: string) {
  const { data, error } = await supabase
    .from('workspace_members')
    .select(`
      user_id,
      role,
      joined_at,
      profiles:user_id (
        id,
        full_name,
        avatar_url
      )
    `)
    .eq('workspace_id', workspaceId);

  if (error) {
    console.error('Error fetching workspace members:', error);
    return [];
  }

  return data.map(item => ({
    id: item.user_id,
    role: item.role,
    joinedAt: item.joined_at,
    profile: {
      id: item.user_id,
      full_name: item.profiles?.full_name || '',
      avatar_url: item.profiles?.avatar_url || ''
    } as ProfileData
  }));
}

// Fix the createEvent function to handle string dates
async function createEvent(eventData: EventData) {
  // Make sure we're sending string values for dates to the API
  const formattedData = {
    title: eventData.title,
    description: eventData.description,
    start_time: eventData.start_time,
    end_time: eventData.end_time,
    created_by: eventData.created_by,
    workspace_id: eventData.workspace_id
  };

  const { data, error } = await supabase
    .from("events")
    .insert(formattedData)
    .select()
    .single();

  if (error) {
    console.error("Error creating event:", error);
    throw error;
  }

  return data;
}

// Fix the updateEvent function to handle string dates
async function updateEvent(eventId: string, eventData: Partial<EventData>) {
  // Make sure we're sending string values for dates to the API
  const formattedData: Record<string, any> = {};
  
  if (eventData.title) formattedData.title = eventData.title;
  if (eventData.description !== undefined) formattedData.description = eventData.description;
  if (eventData.start_time) formattedData.start_time = eventData.start_time;
  if (eventData.end_time) formattedData.end_time = eventData.end_time;
  if (eventData.created_by) formattedData.created_by = eventData.created_by;
  if (eventData.workspace_id) formattedData.workspace_id = eventData.workspace_id;

  const { data, error } = await supabase
    .from("events")
    .update(formattedData)
    .eq("id", eventId)
    .select()
    .single();

  if (error) {
    console.error("Error updating event:", error);
    throw error;
  }

  return data;
}

// Fix the getEvents function by removing errors accessing nonexistent tables
async function getEvents(params: { start_date?: string, end_date?: string } = {}) {
  let query = supabase
    .from("events")
    .select("*");

  if (params.start_date) {
    query = query.gte("start_time", params.start_date);
  }

  if (params.end_date) {
    query = query.lte("end_time", params.end_date);
  }

  const { data, error } = await query.order("start_time", { ascending: true });

  if (error) {
    console.error("Error fetching events:", error);
    return [];
  }

  return data;
}

// Export these functions
export {
  getWorkspaceMembers,
  createEvent,
  updateEvent,
  getEvents
};
