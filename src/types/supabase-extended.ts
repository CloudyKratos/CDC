
import { Database } from '@/integrations/supabase/types';

// Use the actual database types as the foundation
export type ExtendedStage = Database['public']['Tables']['stages']['Row'];
export type ExtendedStageInsert = Database['public']['Tables']['stages']['Insert'];

// Enhanced StageParticipant type with proper profile data
export type StageParticipant = Database['public']['Tables']['stage_participants']['Row'] & {
  profiles?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
};

export type StageParticipantInsert = Database['public']['Tables']['stage_participants']['Insert'];

// Enhanced speaker request type with profile data
export type ExtendedSpeakerRequest = Database['public']['Tables']['speaker_requests']['Row'] & {
  profiles?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
};
export type ExtendedSpeakerRequestInsert = Database['public']['Tables']['speaker_requests']['Insert'];

// Enhanced types for user_roles - fix the enum issue
export type UserRole = 'admin' | 'moderator' | 'user';
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

// User with role interface for admin components
export interface UserWithRole {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isHidden?: boolean;
  profile?: {
    full_name?: string | null;
    username?: string | null;
    email?: string | null;
    created_at?: string;
  };
}

// Enhanced types for events table - fix the event_type issue
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];

// Enhanced event data with proper typing
export type EnhancedEventData = Database['public']['Tables']['events']['Row'] & {
  event_type: CalendarEventType | null;
};

// Service response types
export interface StageAccessValidation {
  canAccess: boolean;
  reason?: string;
}

// Type helpers for common operations
export type StageRole = 'moderator' | 'speaker' | 'audience';
export type StageStatus = 'scheduled' | 'live' | 'ended';
export type SpeakerRequestStatus = 'pending' | 'approved' | 'denied';
export type UserRoleType = 'admin' | 'moderator' | 'user';

// Calendar event type that matches SupabaseService EventData
export type CalendarEventType = 
  | 'mission_call'
  | 'reflection_hour' 
  | 'wisdom_drop'
  | 'tribe_meetup'
  | 'office_hours'
  | 'accountability_circle'
  | 'solo_ritual'
  | 'workshop'
  | 'course_drop'
  | 'challenge_sprint'
  | 'deep_work_day';

// Platform metrics for analytics - updated to match component expectations
export interface PlatformMetrics {
  totalUsers: number;
  activeUsers: number;
  totalEvents: number;
  upcomingEvents: number;
  totalStages: number;
  activeStages: number;
  totalMessages: number;
  userGrowth: number;
}

// User statistics for admin dashboard
export interface UserStats {
  totalUsers: number;
  adminCount: number;
  moderatorCount: number;
  memberCount: number;
  activeUsers: number;
}

// Fixed DirectMessage interface with proper sender info
export interface DirectMessage {
  id: string;
  sender_id: string;
  recipient_id: string;
  content: string;
  created_at: string;
  updated_at?: string;
  is_read: boolean;
  is_deleted?: boolean;
  reply_to_id?: string | null;
  sender?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}

// Fixed Conversation interface with proper participant info
export interface Conversation {
  id: string;
  participants: string[];
  last_message?: DirectMessage;
  created_at: string;
  updated_at: string;
  last_activity_at: string;
  unread_count?: number;
  other_participant?: {
    id: string;
    username?: string | null;
    full_name?: string | null;
    avatar_url?: string | null;
  };
}
