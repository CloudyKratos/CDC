import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types/workspace";
import { Observable } from "rxjs";

// Define ProfileData type
interface ProfileData {
  id: string;
  full_name?: string;
  avatar_url?: string;
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
    profile: item.profiles as unknown as ProfileData
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

// Task functions
async function createTask(taskData: any) {
  const { data, error } = await supabase
    .from("tasks")
    .insert(taskData)
    .select()
    .single();

  if (error) {
    console.error("Error creating task:", error);
    throw error;
  }

  return data;
}

async function getTasks(workspaceId: string) {
  const { data, error } = await supabase
    .from("tasks")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching tasks:", error);
    return [];
  }

  return data;
}

async function updateTask(taskId: string, taskData: any) {
  const { data, error } = await supabase
    .from("tasks")
    .update(taskData)
    .eq("id", taskId)
    .select()
    .single();

  if (error) {
    console.error("Error updating task:", error);
    throw error;
  }

  return data;
}

async function deleteTask(taskId: string) {
  const { error } = await supabase.from("tasks").delete().eq("id", taskId);

  if (error) {
    console.error("Error deleting task:", error);
    throw error;
  }

  return true;
}

// Document functions
async function createDocument(documentData: any) {
  const { data, error } = await supabase
    .from("documents")
    .insert(documentData)
    .select()
    .single();

  if (error) {
    console.error("Error creating document:", error);
    throw error;
  }

  return data;
}

async function getDocuments(workspaceId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching documents:", error);
    return [];
  }

  return data;
}

async function getDocument(documentId: string) {
  const { data, error } = await supabase
    .from("documents")
    .select("*")
    .eq("id", documentId)
    .single();

  if (error) {
    console.error("Error fetching document:", error);
    return null;
  }

  return data;
}

async function updateDocument(documentId: string, documentData: any) {
  const { data, error } = await supabase
    .from("documents")
    .update(documentData)
    .eq("id", documentId)
    .select()
    .single();

  if (error) {
    console.error("Error updating document:", error);
    throw error;
  }

  return data;
}

async function deleteDocument(documentId: string) {
  const { error } = await supabase
    .from("documents")
    .delete()
    .eq("id", documentId);

  if (error) {
    console.error("Error deleting document:", error);
    throw error;
  }

  return true;
}

// File storage functions
async function uploadFile(
  workspaceId: string,
  file: File,
  path: string = "uploads"
) {
  const fileExt = file.name.split(".").pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${workspaceId}/${path}/${fileName}`;

  const { data, error } = await supabase.storage
    .from("workspace-files")
    .upload(filePath, file);

  if (error) {
    console.error("Error uploading file:", error);
    throw error;
  }

  const { data: urlData } = supabase.storage
    .from("workspace-files")
    .getPublicUrl(filePath);

  return {
    path: filePath,
    url: urlData.publicUrl,
    name: file.name,
    size: file.size,
    type: file.type,
  };
}

async function getFiles(workspaceId: string, path: string = "uploads") {
  const { data, error } = await supabase.storage
    .from("workspace-files")
    .list(`${workspaceId}/${path}`);

  if (error) {
    console.error("Error listing files:", error);
    return [];
  }

  return data.map((file) => ({
    name: file.name,
    path: `${workspaceId}/${path}/${file.name}`,
    url: supabase.storage
      .from("workspace-files")
      .getPublicUrl(`${workspaceId}/${path}/${file.name}`).data.publicUrl,
    size: file.metadata?.size,
    type: file.metadata?.mimetype,
  }));
}

async function deleteFile(filePath: string) {
  const { error } = await supabase.storage
    .from("workspace-files")
    .remove([filePath]);

  if (error) {
    console.error("Error deleting file:", error);
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

  // Tasks
  createTask,
  getTasks,
  updateTask,
  deleteTask,

  // Documents
  createDocument,
  getDocuments,
  getDocument,
  updateDocument,
  deleteDocument,

  // Files
  uploadFile,
  getFiles,
  deleteFile,
  
  // Presence
  setupPresence,
};
