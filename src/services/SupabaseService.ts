
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

// Define ProfileData type
export interface ProfileData {
  id: string;
  full_name: string;
  avatar_url?: string;
}

// Define EventData type - make sure start_time and end_time are strings
export interface EventData {
  id?: string;
  title: string;
  description?: string | null;
  start_time: string;  // Changed from Date | string to just string
  end_time: string;    // Changed from Date | string to just string
  created_by?: string | null;
  workspace_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// Authentication functions
async function signUp(email: string, password: string, fullName: string): Promise<User> {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  });

  if (error) {
    console.error('Error signing up:', error);
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned from signup');
  }

  return data.user;
}

async function signIn(email: string, password: string): Promise<User> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    console.error('Error signing in:', error);
    throw error;
  }

  if (!data.user) {
    throw new Error('No user returned from sign in');
  }

  return data.user;
}

async function signOut(): Promise<void> {
  const { error } = await supabase.auth.signOut();
  
  if (error) {
    console.error('Error signing out:', error);
    throw error;
  }
}

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
      id: item.profiles ? item.profiles.id : item.user_id,
      full_name: item.profiles ? item.profiles.full_name : '',
      avatar_url: item.profiles ? item.profiles.avatar_url : ''
    } as ProfileData
  }));
}

// Helper function to ensure dates are always strings
function ensureDateString(date: Date | string): string {
  if (typeof date === 'string') {
    return date;
  }
  return date.toISOString();
}

// Event management functions
async function createEvent(eventData: EventData) {
  // Format dates to ensure they are strings
  const formattedData = {
    ...eventData,
    start_time: ensureDateString(eventData.start_time),
    end_time: ensureDateString(eventData.end_time)
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

async function updateEvent(eventId: string, eventData: Partial<EventData>) {
  // Format dates to strings if they are Date objects
  const formattedData = {
    ...eventData
  };
  
  if (eventData.start_time) {
    formattedData.start_time = ensureDateString(eventData.start_time);
  }
  
  if (eventData.end_time) {
    formattedData.end_time = ensureDateString(eventData.end_time);
  }

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

async function deleteEvent(eventId: string) {
  const { error } = await supabase
    .from("events")
    .delete()
    .eq("id", eventId);

  if (error) {
    console.error("Error deleting event:", error);
    throw error;
  }

  return true;
}

// Add resetPassword and updatePassword functions that are referenced but missing
async function resetPassword(email: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/reset-password',
    });
    
    if (error) {
      console.error("Error sending reset password email:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in resetPassword:", error);
    return false;
  }
}

async function updatePassword(newPassword: string): Promise<boolean> {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    });
    
    if (error) {
      console.error("Error updating password:", error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Error in updatePassword:", error);
    return false;
  }
}

// Export these functions with proper type handling
export {
  signUp,
  signIn,
  signOut,
  getWorkspaceMembers,
  createEvent,
  updateEvent,
  getEvents,
  deleteEvent,
  resetPassword,
  updatePassword
};

// Fix the export type syntax for TypeScript isolatedModules mode
export type { ProfileData as ProfileDataType, EventData as EventDataType };
