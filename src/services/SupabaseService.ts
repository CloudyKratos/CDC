
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/workspace";
import { Observable } from "rxjs";

// Define ProfileData type
interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
}

// Define EventData type
export interface EventData {
  id?: string;
  title: string;
  description?: string | null;
  start_time: Date | string;
  end_time: Date | string;
  created_by?: string | null;
  workspace_id?: string | null;
  created_at?: string;
  updated_at?: string;
}

// User authentication functions
async function signUp(email: string, password: string, fullName: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      },
    },
  });

  if (error) {
    console.error("Error signing up:", error);
    throw error;
  }

  return data.user;
}

async function signIn(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error("Error signing in:", error);
    throw error;
  }

  return data.user;
}

async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) {
    console.error("Error signing out:", error);
    throw error;
  }
  return true;
}

async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) {
    console.error("Error resetting password:", error);
    throw error;
  }

  return true;
}

async function updatePassword(password: string) {
  const { error } = await supabase.auth.updateUser({
    password,
  });

  if (error) {
    console.error("Error updating password:", error);
    throw error;
  }

  return true;
}

async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return null;
  }

  const { id, email, user_metadata } = data.user;
  return {
    id,
    email: email || "",
    name: user_metadata?.full_name || "",
    avatar: user_metadata?.avatar_url || "",
  };
}

// Profile functions
async function updateProfile(userId: string, data: any) {
  const { error } = await supabase
    .from("profiles")
    .update(data)
    .eq("id", userId);

  if (error) {
    console.error("Error updating profile:", error);
    throw error;
  }

  return true;
}

async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();

  if (error) {
    console.error("Error fetching profile:", error);
    return null;
  }

  return data;
}

// Workspace functions
async function createWorkspace(workspaceData: any) {
  const { data, error } = await supabase
    .from("workspaces")
    .insert(workspaceData)
    .select()
    .single();

  if (error) {
    console.error("Error creating workspace:", error);
    throw error;
  }

  // Add creator as a member with owner role
  await supabase.from("workspace_members").insert({
    workspace_id: data.id,
    user_id: workspaceData.owner_id,
    role: "owner",
  });

  return data;
}

async function getWorkspaces(userId: string) {
  const { data, error } = await supabase
    .from("workspace_members")
    .select(
      `
      workspace_id,
      role,
      workspaces:workspace_id (
        id,
        name,
        description,
        created_at,
        owner_id
      )
    `
    )
    .eq("user_id", userId);

  if (error) {
    console.error("Error fetching workspaces:", error);
    return [];
  }

  return data.map((item) => ({
    ...item.workspaces,
    role: item.role,
  }));
}

async function getWorkspace(workspaceId: string) {
  const { data, error } = await supabase
    .from("workspaces")
    .select("*")
    .eq("id", workspaceId)
    .single();

  if (error) {
    console.error("Error fetching workspace:", error);
    return null;
  }

  return data;
}

async function updateWorkspace(workspaceId: string, workspaceData: any) {
  const { data, error } = await supabase
    .from("workspaces")
    .update(workspaceData)
    .eq("id", workspaceId)
    .select()
    .single();

  if (error) {
    console.error("Error updating workspace:", error);
    throw error;
  }

  return data;
}

async function deleteWorkspace(workspaceId: string) {
  const { error } = await supabase
    .from("workspaces")
    .delete()
    .eq("id", workspaceId);

  if (error) {
    console.error("Error deleting workspace:", error);
    throw error;
  }

  return true;
}

async function inviteToWorkspace(workspaceId: string, email: string, role: string) {
  // First check if user exists
  const { data: userData, error: userError } = await supabase
    .from("profiles")
    .select("id")
    .eq("email", email)
    .single();

  if (userError) {
    console.error("Error finding user:", userError);
    throw new Error("User not found");
  }

  // Add user to workspace
  const { error } = await supabase.from("workspace_members").insert({
    workspace_id: workspaceId,
    user_id: userData.id,
    role,
  });

  if (error) {
    console.error("Error inviting to workspace:", error);
    throw error;
  }

  return true;
}

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
      id: item.profiles?.id || item.user_id,
      full_name: item.profiles?.full_name,
      avatar_url: item.profiles?.avatar_url
    } as ProfileData
  }));
}

async function removeFromWorkspace(workspaceId: string, userId: string) {
  const { error } = await supabase
    .from("workspace_members")
    .delete()
    .eq("workspace_id", workspaceId)
    .eq("user_id", userId);

  if (error) {
    console.error("Error removing from workspace:", error);
    throw error;
  }

  return true;
}

// Message functions
async function sendMessage(messageData: any) {
  const { data, error } = await supabase
    .from("messages")
    .insert(messageData)
    .select()
    .single();

  if (error) {
    console.error("Error sending message:", error);
    throw error;
  }

  return data;
}

async function getMessages(workspaceId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select(
      `
      id,
      content,
      created_at,
      sender_id,
      workspace_id,
      sender:sender_id (
        id,
        username,
        full_name,
        avatar_url
      )
    `
    )
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data;
}

function subscribeToMessages(workspaceId: string, callback: (message: any) => void) {
  const subscription = supabase
    .channel(`workspace-${workspaceId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `workspace_id=eq.${workspaceId}`,
      },
      async (payload) => {
        // Fetch the full message with sender info
        const { data } = await supabase
          .from("messages")
          .select(
            `
            id,
            content,
            created_at,
            sender_id,
            workspace_id,
            sender:sender_id (
              id,
              username,
              full_name,
              avatar_url
            )
          `
          )
          .eq("id", payload.new.id)
          .single();

        if (data) {
          callback(data);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(subscription);
  };
}

// Event management functions
async function createEvent(eventData: EventData) {
  const { data, error } = await supabase
    .from("events")
    .insert(eventData)
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

async function getEvent(eventId: string) {
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", eventId)
    .single();

  if (error) {
    console.error("Error fetching event:", error);
    return null;
  }

  return data;
}

async function updateEvent(eventId: string, eventData: Partial<EventData>) {
  const { data, error } = await supabase
    .from("events")
    .update(eventData)
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

// Presence tracking
function setupPresence(userId: string, channel: string, info: any) {
  const presenceChannel = supabase.channel(`presence-${channel}`);
  
  presenceChannel
    .on('presence', { event: 'sync' }, () => {
      const state = presenceChannel.presenceState();
      console.log('Presence state updated:', state);
    })
    .on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('User joined:', key, newPresences);
    })
    .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
      console.log('User left:', key, leftPresences);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await presenceChannel.track({ userId, ...info });
      }
    });
  
  return new Observable((subscriber) => {
    // Return cleanup function
    return () => {
      presenceChannel.unsubscribe();
      subscriber.complete();
    };
  });
}

// Export all functions
export default {
  // Auth
  signUp,
  signIn,
  signOut,
  resetPassword,
  updatePassword,
  getCurrentUser,

  // Profile
  updateProfile,
  getProfile,

  // Workspaces
  createWorkspace,
  getWorkspaces,
  getWorkspace,
  updateWorkspace,
  deleteWorkspace,
  inviteToWorkspace,
  getWorkspaceMembers,
  removeFromWorkspace,

  // Messages
  sendMessage,
  getMessages,
  subscribeToMessages,

  // Events
  createEvent,
  getEvents,
  getEvent,
  updateEvent,
  deleteEvent,

  // Presence
  setupPresence,
};
