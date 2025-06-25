
import { Database } from '@/integrations/supabase/types';

// Use the actual database types as the foundation
export type ExtendedStage = Database['public']['Tables']['stages']['Row'];
export type ExtendedStageInsert = Database['public']['Tables']['stages']['Insert'];

// Properly extend stage participants with profile data
export interface StageParticipant extends Database['public']['Tables']['stage_participants']['Row'] {
  profiles?: {
    id: string;
    full_name?: string | null;
    username?: string | null;
    avatar_url?: string | null;
  } | null;
}

export type StageParticipantInsert = Database['public']['Tables']['stage_participants']['Insert'];

// Use actual database types for speaker requests
export type ExtendedSpeakerRequest = Database['public']['Tables']['speaker_requests']['Row'];
export type ExtendedSpeakerRequestInsert = Database['public']['Tables']['speaker_requests']['Insert'];

// Extended types for user_roles
export type UserRole = Database['public']['Tables']['user_roles']['Row'];
export type UserRoleInsert = Database['public']['Tables']['user_roles']['Insert'];

// Extended types for events table
export type Event = Database['public']['Tables']['events']['Row'];
export type EventInsert = Database['public']['Tables']['events']['Insert'];

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
