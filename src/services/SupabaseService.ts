
import { supabase } from '@/integrations/supabase/client';
import { User } from '@/types/workspace';
import { toast } from 'sonner';

// Types for Supabase tables
export interface WorkspaceData {
  id?: string;
  name: string;
  description?: string;
  owner_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface EventData {
  id?: string;
  title: string;
  description?: string;
  start_time: Date | string;
  end_time: Date | string;
  created_by?: string;
  workspace_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface MessageData {
  id?: string;
  content: string;
  sender_id: string;
  workspace_id: string;
  created_at?: string;
  updated_at?: string;
  is_deleted?: boolean;
}

export interface ProfileData {
  id: string;
  username?: string;
  full_name?: string;
  avatar_url?: string;
  bio?: string;
  location?: string;
  website?: string;
  created_at?: string;
  updated_at?: string;
}

export interface WorkspaceMemberData {
  workspace_id: string;
  user_id: string;
  joined_at?: string;
  role: string;
}

// Utility functions for common operations
export class SupabaseService {
  // Workspaces
  static async getWorkspaces(userId: string): Promise<WorkspaceData[]> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .select('*')
        .eq('owner_id', userId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workspaces:', error);
      throw error;
    }
  }
  
  static async createWorkspace(workspace: WorkspaceData): Promise<WorkspaceData> {
    try {
      const { data, error } = await supabase
        .from('workspaces')
        .insert(workspace)
        .select()
        .single();
        
      if (error) throw error;
      
      // Add creator as member
      await this.addWorkspaceMember({
        workspace_id: data.id as string,
        user_id: workspace.owner_id,
        role: 'owner'
      });
      
      return data;
    } catch (error) {
      console.error('Error creating workspace:', error);
      throw error;
    }
  }
  
  // Events
  static async getEvents(filter: { workspace_id?: string; start_date?: string; end_date?: string } = {}): Promise<EventData[]> {
    try {
      let query = supabase.from('events').select('*');
      
      if (filter.workspace_id) {
        query = query.eq('workspace_id', filter.workspace_id);
      }
      
      if (filter.start_date) {
        query = query.gte('start_time', filter.start_date);
      }
      
      if (filter.end_date) {
        query = query.lte('end_time', filter.end_date);
      }
      
      const { data, error } = await query.order('start_time', { ascending: true });
      
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching events:', error);
      throw error;
    }
  }
  
  static async createEvent(event: EventData): Promise<EventData> {
    try {
      // Format dates if needed
      const formattedEvent = {
        ...event,
        start_time: event.start_time instanceof Date ? event.start_time.toISOString() : event.start_time,
        end_time: event.end_time instanceof Date ? event.end_time.toISOString() : event.end_time
      };
      
      const { data, error } = await supabase
        .from('events')
        .insert(formattedEvent)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating event:', error);
      throw error;
    }
  }
  
  static async updateEvent(id: string, event: Partial<EventData>): Promise<EventData> {
    try {
      // Format dates if needed
      const formattedEvent = {
        ...event,
        start_time: event.start_time instanceof Date ? event.start_time.toISOString() : event.start_time,
        end_time: event.end_time instanceof Date ? event.end_time.toISOString() : event.end_time
      };
      
      const { data, error } = await supabase
        .from('events')
        .update(formattedEvent)
        .eq('id', id)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }
  
  static async deleteEvent(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }
  
  // Messages
  static async getMessages(workspaceId: string): Promise<MessageData[]> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          profiles:sender_id (username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId)
        .eq('is_deleted', false)
        .order('created_at', { ascending: true });
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }
  
  static async sendMessage(message: MessageData): Promise<MessageData> {
    try {
      const { data, error } = await supabase
        .from('messages')
        .insert(message)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }
  
  // Profiles
  static async getProfile(userId: string): Promise<ProfileData | null> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') {
          return null; // No profile found
        }
        throw error;
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching profile:', error);
      throw error;
    }
  }
  
  static async updateProfile(profile: Partial<ProfileData> & { id: string }): Promise<ProfileData> {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({
          ...profile,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  }
  
  // Workspace Members
  static async getWorkspaceMembers(workspaceId: string): Promise<WorkspaceMemberData[]> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .select(`
          *,
          profiles:user_id (username, avatar_url, full_name)
        `)
        .eq('workspace_id', workspaceId);
        
      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching workspace members:', error);
      throw error;
    }
  }
  
  static async addWorkspaceMember(member: WorkspaceMemberData): Promise<WorkspaceMemberData> {
    try {
      const { data, error } = await supabase
        .from('workspace_members')
        .insert(member)
        .select()
        .single();
        
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error adding workspace member:', error);
      throw error;
    }
  }
  
  // Authentication helpers
  static async signUp(email: string, password: string, fullName: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          }
        }
      });
      
      if (error) throw error;
      
      if (data.user) {
        toast.success('Account created successfully!', {
          description: 'Check your email to verify your account.'
        });
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: fullName,
          role: 'user',
          permissions: ['read', 'comment'],
          lastLogin: new Date().toISOString(),
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error signing up:', error);
      toast.error('Failed to create account', {
        description: error.message
      });
      return null;
    }
  }
  
  static async signIn(email: string, password: string): Promise<User | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      if (data.user) {
        // Get profile data
        const profile = await this.getProfile(data.user.id);
        
        toast.success('Signed in successfully!');
        
        return {
          id: data.user.id,
          email: data.user.email || '',
          name: profile?.full_name || data.user.user_metadata.full_name || email.split('@')[0],
          role: data.user.user_metadata.role || 'user',
          avatar: profile?.avatar_url || data.user.user_metadata.avatar_url,
          permissions: ['read', 'comment'],
          lastLogin: new Date().toISOString(),
          profile: profile ? {
            bio: profile.bio || '',
            location: profile.location || '',
            timeZone: 'UTC',
            website: profile.website || ''
          } : undefined
        };
      }
      
      return null;
    } catch (error: any) {
      console.error('Error signing in:', error);
      toast.error('Failed to sign in', {
        description: error.message
      });
      return null;
    }
  }
}

export default SupabaseService;
